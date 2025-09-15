import { useState } from "react";
import AllergenIcon from "./AllergenIcon";

interface MealItem {
  id: number;
  name: string;
  allergens: string[];
}

interface MealItemEditorProps {
  item: MealItem;
  onItemUpdate: (item: MealItem) => void;
  onItemDelete: (itemId: number) => void;
  isEditing?: boolean;
}

const commonAllergens = [
  'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 
  'Pescado', 'Crustáceos', 'Moluscos', 'Sésamo', 'Mostaza', 'Apio', 'Cacahuetes', 'Altramuces', 'Sulfitos'
];

export default function MealItemEditor({ 
  item, 
  onItemUpdate, 
  onItemDelete, 
  isEditing = false 
}: MealItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const [editingAllergens, setEditingAllergens] = useState(false);

  const handleNameSave = () => {
    if (nameValue.trim() && nameValue.trim() !== item.name) {
      onItemUpdate({
        ...item,
        name: nameValue.trim()
      });
    }
    setEditingName(false);
  };

  const handleNameCancel = () => {
    setNameValue(item.name);
    setEditingName(false);
  };

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = item.allergens.includes(allergen)
      ? item.allergens.filter(a => a !== allergen)
      : [...item.allergens, allergen];
    
    onItemUpdate({
      ...item,
      allergens: newAllergens
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {editingName ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleNameSave}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span 
              className={`text-gray-900 font-medium ${
                isEditing ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''
              }`}
              onClick={() => isEditing && setEditingName(true)}
            >
              {item.name}
            </span>
          )}
          
          {item.allergens.length > 0 && (
            <div className="flex space-x-1 mt-1">
              {item.allergens.map((allergen, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                >
                  {allergen}
                </span>
              ))}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <button
              onClick={() => onItemDelete(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Panel expandido para editar alérgenos */}
      {isExpanded && isEditing && (
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alérgenos
              </label>
              <div className="flex flex-wrap gap-2">
                        {commonAllergens.map(allergen => (
                          <button
                            key={allergen}
                            onClick={() => handleAllergenToggle(allergen)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-full border transition-colors ${
                              item.allergens.includes(allergen)
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
                onClick={() => setEditingAllergens(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
