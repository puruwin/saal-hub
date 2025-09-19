import { useState } from "react";
import AllergenIcon from "./AllergenIcon";
import { menuService } from "../services/menuService";

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

export default function WeeklyMenuView({ menus, onMenuUpdate }: WeeklyMenuViewProps) {
  const [editingItem, setEditingItem] = useState<{menuId: number, mealId: number, itemId: number} | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunes

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getMenuForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return menus.find(menu => menu.date === dateStr);
  };

  const handleItemEdit = (menuId: number, mealId: number, itemId: number, currentName: string) => {
    setEditingItem({ menuId, mealId, itemId });
    setEditingText(currentName);
  };

  const handleItemSave = async () => {
    if (!editingItem || !editingText.trim() || loading) return;

    const menu = menus.find(m => m.id === editingItem.menuId);
    if (!menu) return;

    const meal = menu.meals.find(m => m.id === editingItem.mealId);
    if (!meal) return;

    const item = meal.items.find(i => i.id === editingItem.itemId);
    if (!item) return;

    setLoading(true);
    try {
      await menuService.updateMealItem(menu.id, meal.id, item.id, {
        name: editingText.trim(),
        allergens: item.allergens
      });

      const updatedMenu = {
        ...menu,
        meals: menu.meals.map(meal => 
          meal.id === editingItem.mealId 
            ? {
                ...meal,
                items: meal.items.map(item =>
                  item.id === editingItem.itemId
                    ? { ...item, name: editingText.trim() }
                    : item
                )
              }
            : meal
        )
      };

      onMenuUpdate(updatedMenu);
      setEditingItem(null);
      setEditingText('');
    } catch (error) {
      console.error('Error guardando cambios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemCancel = () => {
    setEditingItem(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleItemSave();
    } else if (e.key === 'Escape') {
      handleItemCancel();
    }
  };

  const handleViewDayMenu = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    window.open(`/menu/${dateStr}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Menú Semanal</h2>
        <p className="text-gray-600 mt-1">Edita los platos haciendo clic en ellos</p>
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
              const dayName = day.toLocaleDateString('es-ES', { weekday: 'long' });
              const dayNumber = day.getDate();
              
              return (
                <tr key={dayIndex} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 capitalize">
                      {dayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayNumber} de {day.toLocaleDateString('es-ES', { month: 'long' })}
                    </div>
                  </td>
                  
                  {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
                    const meal = menu?.meals.find(m => m.type === mealType);
                    
                    return (
                      <td key={mealType} className="p-4">
                        <div className={`rounded-lg border-2 border-dashed p-3 min-h-[120px] ${mealTypeColors[mealType]}`}>
                          {meal && meal.items.length > 0 ? (
                            <div className="space-y-2">
                              {meal.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                  {editingItem?.menuId === menu?.id && 
                                   editingItem?.mealId === meal?.id && 
                                   editingItem?.itemId === item.id ? (
                                    <input
                                      type="text"
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      onKeyDown={handleKeyPress}
                                      onBlur={handleItemSave}
                                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className={`text-sm cursor-pointer hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-all ${loading ? 'opacity-50' : ''}`}
                                      onClick={() => !loading && handleItemEdit(menu?.id || 0, meal?.id || 0, item.id, item.name)}
                                    >
                                      {item.name}
                                    </span>
                                  )}
                                  
                                  {item.allergens.length > 0 && (
                                    <div className="flex space-x-1">
                                  {item.allergens.map((allergen, idx) => (
                                    <span 
                                      key={idx}
                                      className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded"
                                    >
                                      <AllergenIcon allergen={allergen} className="w-3 h-3" />
                                      {allergen}
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
                    <button
                      onClick={() => handleViewDayMenu(day)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                    >
                      Ver Menú
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
