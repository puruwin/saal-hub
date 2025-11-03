import { useState, useEffect } from "react";
import AllergenIcon from "./AllergenIcon";
import { menuService } from "../services/menuService";
import BulkImportModal from "./BulkImportModal";
import BulkDeleteModal from "./BulkDeleteModal";
import DayEditor from "./DayEditor";

interface MealItem {
  id: number;
  name: string;
  allergens: string[];
}

interface Meal {
  id: number;
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MealItem[];
}

interface Menu {
  id: number;
  date: string;
  meals: Meal[];
}

interface WeeklyMenuViewProps {
  menus: Menu[];
  onMenuUpdate: (menu: Menu) => void;
}

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena'
};

const mealTypeColors = {
  breakfast: 'bg-yellow-50 border-yellow-200',
  lunch: 'bg-green-50 border-green-200',
  dinner: 'bg-blue-50 border-blue-200'
};

export default function WeeklyMenuView({ menus: initialMenus, onMenuUpdate }: WeeklyMenuViewProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = semana actual, -1 = semana anterior, 1 = semana siguiente
  const [weekMenus, setWeekMenus] = useState<Menu[]>(initialMenus);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);

  const getCurrentWeekStart = () => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay() + 1); // Lunes de la semana actual
    return today;
  };

  const startOfWeek = new Date(getCurrentWeekStart());
  startOfWeek.setDate(startOfWeek.getDate() + (weekOffset * 7)); // Ajustar según el offset

  // Solo 6 días: Lun-Vie + Sáb/Dom unificado
  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(startOfWeek);
    if (i === 5) {
      // Para el sexto día, mostrar sábado (que representa Sáb/Dom)
      date.setDate(startOfWeek.getDate() + 5);
    } else {
      date.setDate(startOfWeek.getDate() + i);
    }
    return date;
  });

  // Cargar menús cuando cambia la semana
  useEffect(() => {
    const loadWeekMenus = async () => {
      setLoadingWeek(true);
      try {
        const currentWeekStart = new Date(getCurrentWeekStart());
        currentWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
        
        const endOfWeek = new Date(currentWeekStart);
        endOfWeek.setDate(currentWeekStart.getDate() + 6);

        const startDateStr = currentWeekStart.toISOString().split('T')[0];
        const endDateStr = endOfWeek.toISOString().split('T')[0];

        const fetchedMenus = await menuService.getMenus(startDateStr, endDateStr);
        setWeekMenus(fetchedMenus);
      } catch (error) {
        console.error('Error cargando menús de la semana:', error);
      } finally {
        setLoadingWeek(false);
      }
    };

    loadWeekMenus();
  }, [weekOffset]);

  // Función para recargar manualmente
  const reloadWeekMenus = async () => {
    setLoadingWeek(true);
    try {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startDateStr = startOfWeek.toISOString().split('T')[0];
      const endDateStr = endOfWeek.toISOString().split('T')[0];

      const fetchedMenus = await menuService.getMenus(startDateStr, endDateStr);
      setWeekMenus(fetchedMenus);
    } catch (error) {
      console.error('Error cargando menús de la semana:', error);
    } finally {
      setLoadingWeek(false);
    }
  };

  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  const getWeekRange = () => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const getDayLabel = (date: Date, index: number) => {
    if (index === 5) {
      // Fin de semana unificado
      return 'Sáb/Dom';
    }
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const getDayNumber = (date: Date, index: number) => {
    const formatDay = (d: Date) => {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };
    
    if (index === 5) {
      // Mostrar rango sábado-domingo
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 1);
      return `${formatDay(date)}-${formatDay(sunday)}`;
    }
    return formatDay(date);
  };

  const getMenuForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weekMenus.find(menu => menu.date === dateStr);
  };

  const handleViewDayMenu = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    window.open(`/menu/${dateStr}`, '_blank');
  };

  const handleEditDayMenu = (date: Date) => {
    setEditingDate(date);
  };

  const handleBackToWeeklyView = () => {
    setEditingDate(null);
  };

  const handleMenuCreate = async (dateStr: string) => {
    try {
      const newMenu = await menuService.createMenu({
        date: dateStr,
        meals: []
      });
      setWeekMenus(prev => [...prev, newMenu]);
      onMenuUpdate(newMenu);
    } catch (error) {
      console.error('Error creando menú:', error);
    }
  };

  const handleBulkImport = async (startDate: string) => {
    try {
      // Importar los datos del JSON
      const response = await fetch('/menu_data.json');
      const menuData = await response.json();
      
      const result = await menuService.bulkImportMenus(startDate, menuData);
      
      // Recargar los menús de la semana actual después de la importación
      await reloadWeekMenus();
      
      return result;
    } catch (error: any) {
      console.error('Error importando menús:', error);
      throw error;
    }
  };

  const handleBulkDelete = async (startDate: string, endDate: string) => {
    try {
      const result = await menuService.bulkDeleteMenus(startDate, endDate);
      
      // Recargar los menús de la semana actual después del borrado
      await reloadWeekMenus();
      
      return result;
    } catch (error: any) {
      console.error('Error borrando menús:', error);
      throw error;
    }
  };

  // Si estamos editando un día específico, mostrar el DayEditor
  if (editingDate) {
    const dateStr = editingDate.toISOString().split('T')[0];
    const menuForDay = weekMenus.find(m => m.date === dateStr);
    
    return (
      <div>
        <button
          onClick={handleBackToWeeklyView}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Vista Semanal
        </button>
        <DayEditor
          menu={menuForDay || null}
          date={editingDate}
          onMenuUpdate={(updatedMenu) => {
            setWeekMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
            onMenuUpdate(updatedMenu);
          }}
          onMenuCreate={handleMenuCreate}
        />
      </div>
    );
  }

  return (
    <>
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={handleBulkImport}
      />

      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
      />
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Menú Semanal</h2>
              <p className="text-gray-600 mt-1">Usa el botón "Editar Día" para modificar los menús</p>
            </div>
             <div className="flex items-center space-x-3">
               <button
                 onClick={reloadWeekMenus}
                 disabled={loadingWeek}
                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                 title="Recargar menús"
               >
                 <svg className={`w-5 h-5 ${loadingWeek ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
               </button>
               <button
                 onClick={() => setIsDeleteModalOpen(true)}
                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                 title="Borrar menús en bloque"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
                 Borrar Menús
               </button>
               <button
                 onClick={() => setIsImportModalOpen(true)}
                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 Importar Menú
               </button>
             </div>
          </div>
          
          {/* Controles de navegación de semana */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors border shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Semana Anterior</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Semana del</p>
                <p className="text-lg font-bold text-gray-900">{getWeekRange()}</p>
              </div>
              
              {weekOffset !== 0 && (
                <button
                  onClick={goToCurrentWeek}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ir a Semana Actual
                </button>
              )}
            </div>
            
            <button
              onClick={goToNextWeek}
              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors border shadow-sm"
            >
              <span>Semana Siguiente</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700">Día</th>
              <th className="text-left p-4 font-medium text-gray-700">Desayuno</th>
              <th className="text-left p-4 font-medium text-gray-700">Comida</th>
              <th className="text-left p-4 font-medium text-gray-700">Cena</th>
              <th className="text-left p-4 font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day, dayIndex) => {
              const menu = getMenuForDate(day);
              const dayLabel = getDayLabel(day, dayIndex);
              const dayNumberDisplay = getDayNumber(day, dayIndex);
              const isWeekend = dayIndex === 5;
              
              return (
                <tr key={dayIndex} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className={`font-medium text-gray-900 capitalize ${isWeekend ? 'text-blue-600' : ''}`}>
                      {dayLabel}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayNumberDisplay}
                    </div>
                  </td>
                  
                  {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
                    const meal = menu?.meals.find(m => m.type === mealType);
                    
                    return (
                      <td key={mealType} className="p-4">
                        <div className={`rounded-lg border-2 ${isWeekend ? 'border-solid border-blue-300' : 'border-dashed'} p-3 min-h-[120px] ${mealTypeColors[mealType]}`}>
                          {meal && meal.items.length > 0 ? (
                            <div className="space-y-2">
                              {meal.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                  <span className="text-sm px-2 py-1">
                                    {item.name}
                                  </span>
                                  
                                  {item.allergens.length > 0 && (
                                    <div className="flex space-x-1">
                                      {item.allergens.map((allergen, idx) => (
                                        <span 
                                          key={idx}
                                          className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded"
                                        >
                                          <AllergenIcon allergen={allergen} className="w-3 h-3" />
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-sm">
                              Sin {mealTypeLabels[mealType].toLowerCase()}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Nueva columna de acciones */}
                  <td className="p-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEditDayMenu(day)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Día
                      </button>
                      <button
                        onClick={() => handleViewDayMenu(day)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Menú
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}
