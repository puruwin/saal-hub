import { useState } from "react";
import AllergenIcon from "./AllergenIcon";

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

interface DayEditorProps {
  menu: Menu | null;
  date: Date;
  onMenuUpdate: (menu: Menu) => void;
  onMenuCreate: (date: string) => void;
}

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena'
};

const mealTypeColors = {
  breakfast: 'bg-yellow-50 border-yellow-300',
  lunch: 'bg-green-50 border-green-300',
  dinner: 'bg-blue-50 border-blue-300'
};

const commonAllergens = [
  'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 
  'Pescado', 'Crustáceos', 'Moluscos', 'Sésamo', 'Mostaza', 'Apio', 'Cacahuetes', 'Altramuces', 'Sulfitos'
];

export default function DayEditor({ menu, date, onMenuUpdate, onMenuCreate }: DayEditorProps) {
  const [editingItem, setEditingItem] = useState<{mealId: number, itemId: number} | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAllergens, setNewItemAllergens] = useState<string[]>([]);
  const [showAddItem, setShowAddItem] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);

  const dateStr = date.toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('es-ES', { month: 'long' });

  const getMealByType = (type: 'breakfast' | 'lunch' | 'dinner') => {
    return menu?.meals.find(meal => meal.type === type);
  };

  const handleAddItem = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!newItemName.trim()) return;

    const meal = getMealByType(mealType);
    const newItem: MealItem = {
      id: Date.now(), // ID temporal
      name: newItemName.trim(),
      allergens: newItemAllergens
    };

    if (meal) {
      // Actualizar comida existente
      const updatedMenu = {
        ...menu!,
        meals: menu!.meals.map(m => 
          m.id === meal.id 
            ? { ...m, items: [...m.items, newItem] }
            : m
        )
      };
      onMenuUpdate(updatedMenu);
    } else {
      // Crear nueva comida
      const newMeal: Meal = {
        id: Date.now(),
        type: mealType,
        items: [newItem]
      };

      if (menu) {
        const updatedMenu = {
          ...menu,
          meals: [...menu.meals, newMeal]
        };
        onMenuUpdate(updatedMenu);
      } else {
        // Crear menú completo
        const newMenu: Menu = {
          id: Date.now(),
          date: dateStr,
          meals: [newMeal]
        };
        onMenuUpdate(newMenu);
      }
    }

    setNewItemName('');
    setNewItemAllergens([]);
    setShowAddItem(null);
  };

  const handleRemoveItem = (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number) => {
    if (!menu) return;

    const meal = getMealByType(mealType);
    if (!meal) return;

    const updatedMenu = {
      ...menu,
      meals: menu.meals.map(m => 
        m.id === meal.id 
          ? { ...m, items: m.items.filter(item => item.id !== itemId) }
          : m
      )
    };
    onMenuUpdate(updatedMenu);
  };

  const handleEditItem = (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number, newName: string) => {
    if (!menu || !newName.trim()) return;

    const meal = getMealByType(mealType);
    if (!meal) return;

    const updatedMenu = {
      ...menu,
      meals: menu.meals.map(m => 
        m.id === meal.id 
          ? {
              ...m, 
              items: m.items.map(item => 
                item.id === itemId 
                  ? { ...item, name: newName.trim() }
                  : item
              )
            }
          : m
      )
    };
    onMenuUpdate(updatedMenu);
  };

  const toggleAllergen = (allergen: string) => {
    setNewItemAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  if (!menu) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {dayNumber} de {monthName}
          </h3>
          <p className="text-gray-600 mb-4">No hay menú creado para este día</p>
          <button
            onClick={() => onMenuCreate(dateStr)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Crear Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">
          {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {dayNumber} de {monthName}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
          const meal = getMealByType(mealType);
          
          return (
            <div key={mealType} className={`rounded-lg border-2 p-4 ${mealTypeColors[mealType]}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {mealTypeLabels[mealType]}
                </h4>
                <button
                  onClick={() => setShowAddItem(showAddItem === mealType ? null : mealType)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showAddItem === mealType ? 'Cancelar' : '+ Agregar plato'}
                </button>
              </div>

              {/* Formulario para agregar nuevo plato */}
              {showAddItem === mealType && (
                <div className="mb-4 p-4 bg-white rounded-lg border">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nombre del plato"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alérgenos (opcional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonAllergens.map(allergen => (
                          <button
                            key={allergen}
                            onClick={() => toggleAllergen(allergen)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-full border ${
                              newItemAllergens.includes(allergen)
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <AllergenIcon allergen={allergen} className="w-4 h-4" />
                            {allergen}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddItem(mealType)}
                        disabled={!newItemName.trim()}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Agregar
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItem(null);
                          setNewItemName('');
                          setNewItemAllergens([]);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de platos */}
              <div className="space-y-2">
                {meal && meal.items.length > 0 ? (
                  meal.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">{item.name}</span>
                        {item.allergens.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                        {item.allergens.map((allergen, idx) => (
                          <span 
                            key={idx}
                            className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                          >
                            <AllergenIcon allergen={allergen} className="w-3 h-3" />
                            {allergen}
                          </span>
                        ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(mealType, item.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No hay platos agregados
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
