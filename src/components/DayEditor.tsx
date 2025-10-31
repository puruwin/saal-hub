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

interface DayEditorProps {
  menu: Menu | null;
  date: Date;
  onMenuUpdate: (menu: Menu) => void;
  onMenuCreate: (date: string) => void;
}

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
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
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; allergens: string[]; usageCount: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const dateStr = date.toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayNumber = date.getDate().toString().padStart(2, '0');
  const monthName = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${dayNumber}/${monthName}/${year}`;

  const getMealByType = (type: 'breakfast' | 'lunch' | 'dinner') => {
    return menu?.meals.find(meal => meal.type === type);
  };

  // Buscar sugerencias de platos
  const handleNameChange = async (value: string) => {
    setNewItemName(value);
    
    if (value.trim().length >= 2) {
      const results = await menuService.searchPlateTemplates(value.trim());
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar una sugerencia
  const selectSuggestion = (suggestion: { id: number; name: string; allergens: string[] }) => {
    setNewItemName(suggestion.name);
    setNewItemAllergens(suggestion.allergens);
    setShowSuggestions(false);
    setSuggestions([]);
    // Incrementar contador de uso
    menuService.incrementPlateTemplateUsage(suggestion.id);
  };

  // Manejar teclas de navegación en autocompletado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleAddItem = async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!newItemName.trim() || loading) return;

    setLoading(true);
    try {
      const meal = getMealByType(mealType);
      const newItemData = {
        name: newItemName.trim(),
        allergens: newItemAllergens
      };

      // Guardar o actualizar la plantilla del plato automáticamente
      try {
        await menuService.savePlateTemplate(newItemData.name, newItemData.allergens);
      } catch (error) {
        console.warn('No se pudo guardar la plantilla del plato:', error);
        // No detenemos el flujo si falla guardar la plantilla
      }

      if (meal && menu) {
        // Agregar item a comida existente usando la API
        await menuService.addMealItem(menu.id, meal.id, newItemData);
        
        // Recargar el menú completo desde el servidor para obtener los IDs actualizados
        const refreshedMenu = await menuService.getMenuByDate(dateStr);
        if (refreshedMenu) {
          onMenuUpdate(refreshedMenu);
        }
      } else if (menu) {
        // Crear nueva comida en menú existente
        await menuService.addMeal(menu.id, {
          type: mealType,
          items: [newItemData]
        });

        // Recargar el menú completo desde el servidor
        const refreshedMenu = await menuService.getMenuByDate(dateStr);
        if (refreshedMenu) {
          onMenuUpdate(refreshedMenu);
        }
      } else {
        // Crear menú completo nuevo
        const newMenu = await menuService.createMenu({
          date: dateStr,
          meals: [{
            type: mealType,
            items: [newItemData]
          }]
        });
        onMenuUpdate(newMenu);
      }

      setNewItemName('');
      setNewItemAllergens([]);
      setShowAddItem(null);
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error: any) {
      console.error('Error agregando plato:', error);
      const errorMessage = error.message || 'Error al agregar el plato. Por favor, inténtalo de nuevo.';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number) => {
    if (!menu || loading) return;

    const meal = getMealByType(mealType);
    if (!meal) return;

    setLoading(true);
    try {
      await menuService.deleteMealItem(menu.id, meal.id, itemId);

      const updatedMenu = {
        ...menu,
        meals: menu.meals.map(m => 
          m.id === meal.id 
            ? { ...m, items: m.items.filter(item => item.id !== itemId) }
            : m
        )
      };
      onMenuUpdate(updatedMenu);
    } catch (error) {
      console.error('Error eliminando plato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number, newName: string) => {
    if (!menu || !newName.trim() || loading) return;

    const meal = getMealByType(mealType);
    if (!meal) return;

    const item = meal.items.find(i => i.id === itemId);
    if (!item) return;

    setLoading(true);
    try {
      await menuService.updateMealItem(menu.id, meal.id, itemId, {
        name: newName.trim(),
        allergens: item.allergens
      });

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
    } catch (error) {
      console.error('Error editando plato:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setNewItemAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleViewDayMenu = () => {
    window.open(`/menu/${dateStr}`, '_blank');
  };

  if (!menu) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)} - {formattedDate}
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)} - {formattedDate}
          </h3>
          <button
            onClick={handleViewDayMenu}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Ver Menú del Día
          </button>
        </div>
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
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Nombre del plato (escribe para buscar)"
                        value={newItemName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          if (suggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                      />
                      
                      {/* Dropdown de sugerencias */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => selectSuggestion(suggestion)}
                              className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                                  {suggestion.allergens.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {suggestion.allergens.map((allergen, idx) => (
                                        <span 
                                          key={idx}
                                          className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                                        >
                                          {allergen}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-2 text-xs text-gray-500">
                                  {suggestion.usageCount}x usado
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
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
                        disabled={!newItemName.trim() || loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {loading ? 'Agregando...' : 'Agregar'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItem(null);
                          setNewItemName('');
                          setNewItemAllergens([]);
                          setSuggestions([]);
                          setShowSuggestions(false);
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
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 ml-2 disabled:opacity-50"
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
