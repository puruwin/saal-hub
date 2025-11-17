import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AllergenIcon from "../components/AllergenIcon";
import { menuService } from "../services/menuService";
import breakfastIcon from "../assets/breakfast.png";
import lunchIcon from "../assets/lunch.png";
import dinnerIcon from "../assets/dinner.png";

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

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena'
};

export default function MenuView() {
  const { date: paramDate } = useParams<{ date?: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Función para obtener la fecha a mostrar
  const getDisplayDate = () => {
    // Si hay fecha en el parámetro, usarla; sino usar hoy
    return paramDate || new Date().toISOString().split('T')[0];
  };

  // Cargar menú de la fecha correspondiente
  const loadMenu = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const displayDate = getDisplayDate();
      
      // Si es domingo, buscar el menú del sábado
      const selectedDate = new Date(displayDate);
      let searchDate = displayDate;
      
      if (selectedDate.getDay() === 0) {
        // Es domingo, buscar sábado
        const saturday = new Date(selectedDate);
        saturday.setDate(selectedDate.getDate() - 1);
        searchDate = saturday.toISOString().split('T')[0];
      }
      
      const menuData = await menuService.getMenuByDate(searchDate);
      setMenu(menuData);
    } catch (err: any) {
      console.error('Error cargando menú:', err);
      setError('Error al cargar el menú. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar menú al montar el componente o cuando cambie la fecha
  useEffect(() => {
    loadMenu();
    
    // Auto-refresh cada 1 minuto (60000 ms) solo si no hay fecha en parámetro (modo kiosko)
    if (!paramDate) {
      const interval = setInterval(loadMenu, 60000);
      return () => clearInterval(interval);
    }
  }, [paramDate]);

  // Actualizar la hora cada minuto
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Actualizar cada minuto
    const timeInterval = setInterval(updateTime, 60000);

    // Limpiar interval al desmontar
    return () => clearInterval(timeInterval);
  }, []);

  // Formatear fecha y hora
  const formatDateTime = () => {
    const date = currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const time = currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return { date, time };
  };

  // Formatear la fecha del menú para mostrar en pantalla
  const formatMenuDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    // Si es sábado o domingo, mostrar como "Fin de semana"
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      const saturday = dayOfWeek === 0 
        ? new Date(date.getTime() - 24 * 60 * 60 * 1000) 
        : date;
      const sunday = new Date(saturday.getTime() + 24 * 60 * 60 * 1000);
      
      return `Fin de semana (${saturday.getDate()}-${sunday.getDate()} de ${saturday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})`;
    }
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-2xl font-medium">Cargando menú...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas de conexión
  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-200">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-red-800 mb-4">Error de conexión</h2>
            <p className="text-red-600 text-xl mb-6">{error}</p>
            <button
              onClick={loadMenu}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime();

  return (
    <div className="kiosk-container bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-6 py-6 relative">
        {/* Fecha y hora en la parte superior derecha */}
        <div className="absolute top-6 right-6 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-white/50">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800 mb-1">{time}</div>
              <div className="text-sm font-medium text-gray-600 capitalize">{date}</div>
            </div>
          </div>
        </div>

        {menu ? (
          <div className="h-full kiosk-grid grid grid-cols-3 gap-6">
            {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
              const meal = menu.meals.find(m => m.type === mealType);
              
              // Colores y gradientes para cada tipo de comida
              const mealStyles = {
                breakfast: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300',
                lunch: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300',
                dinner: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300'
              };
              
              const iconImages = {
                breakfast: breakfastIcon,
                lunch: lunchIcon,
                dinner: dinnerIcon
              };
              
              return (
                <div key={mealType} className={`meal-card flex flex-col rounded-2xl border-2 p-6 shadow-xl ${mealStyles[mealType]} backdrop-blur-sm`}>
                  {/* Título con icono - altura fija */}
                  <div className="text-center mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center mb-3">
                      <img 
                        src={iconImages[mealType]} 
                        alt={mealTypeLabels[mealType]}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <h2 className="meal-title text-3xl font-bold text-gray-800 drop-shadow-sm">
                      {mealTypeLabels[mealType]}
                    </h2>
                  </div>

                  {/* Lista de platos - con scroll interno */}
                  <div className="meal-scroll flex-1 overflow-y-auto">
                    {meal && meal.items.length > 0 ? (
                      <div className="space-y-4 pr-2">
                        {meal.items.map((item) => (
                          <div key={item.id} className="text-center">
                            <div className="meal-item bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                              <h3 className="meal-item-title text-xl font-semibold text-gray-900 mb-3 leading-tight">
                                {item.name}
                              </h3>
                              {item.allergens.length > 0 && (
                                <div className="flex justify-center flex-wrap gap-2">
                                  {item.allergens.map((allergen, idx) => (
                                    <span 
                                      key={idx}
                                      className="flex items-center justify-center"
                                      title={allergen}
                                    >
                                      <AllergenIcon allergen={allergen} className="w-7 h-7" />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/50">
                          <p className="text-gray-600 text-xl font-medium">
                            Sin {mealTypeLabels[mealType].toLowerCase()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
                <div className="text-8xl mb-6">📅</div>
                <h2 className="text-5xl font-bold text-gray-800 mb-6 drop-shadow-sm">
                  No hay menú disponible
                </h2>
                <p className="text-gray-600 text-2xl font-medium">
                  {paramDate ? formatMenuDate(paramDate) : formatDateTime().date}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

