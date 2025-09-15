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

interface MealEditorProps {
  meal: Meal;
  onMealUpdate: (meal: Meal) => void;
  onMealDelete: (mealId: number) => void;
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

export default function MealEditor({ meal, onMealUpdate, onMealDelete }: MealEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAllergens, setNewItemAllergens] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: MealItem = {
      id: Date.now(),
      name: newItemName.trim(),
      allergens: newItemAllergens
    };

    const updatedMeal = {
      ...meal,
      items: [...meal.items, newItem]
    };

    onMealUpdate(updatedMeal);
    setNewItemName('');
    setNewItemAllergens([]);
  };

  const handleRemoveItem = (itemId: number) => {
    const updatedMeal = {
      ...meal,
      items: meal.items.filter(item => item.id !== itemId)
    };
    onMealUpdate(updatedMeal);
  };

  const handleEditItem = (itemId: number, newName: string) => {
    if (!newName.trim()) return;

    const updatedMeal = {
      ...meal,
      items: meal.items.map(item => 
        item.id === itemId 
          ? { ...item, name: newName.trim() }
          : item
      )
    };
    onMealUpdate(updatedMeal);
    setEditingItem(null);
    setEditingText('');
  };

  const handleStartEdit = (item: MealItem) => {
    setEditingItem(item.id);
    setEditingText(item.name);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingItem) {
        handleEditItem(editingItem, editingText);
      } else {
        handleAddItem();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const toggleAllergen = (allergen: string) => {
    setNewItemAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${mealTypeColors[meal.type]}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          {mealTypeLabels[meal.type]}
        </h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isEditing ? 'Finalizar' : 'Editar'}
          </button>
          <button
            onClick={() => onMealDelete(meal.id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Lista de platos */}
      <div className="space-y-2 mb-4">
        {meal.items.length > 0 ? (
          meal.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <div className="flex-1">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={() => handleEditItem(item.id, editingText)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-gray-900 font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    onClick={() => isEditing && handleStartEdit(item)}
                  >
                    {item.name}
                  </span>
                )}
                
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
              
              {isEditing && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No hay platos agregados
          </div>
        )}
      </div>

      {/* Formulario para agregar nuevo plato */}
      {isEditing && (
        <div className="p-4 bg-white rounded-lg border">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del plato"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyPress}
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

            <button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Agregar Plato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
