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
  
  // Estado para edición inline de nombre
  const [inlineEditingItemId, setInlineEditingItemId] = useState<number | null>(null);
  const [inlineEditingName, setInlineEditingName] = useState('');
  const [inlineSuggestions, setInlineSuggestions] = useState<{ id: number; name: string; allergens: string[] }[]>([]);
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [selectedInlineSuggestionIndex, setSelectedInlineSuggestionIndex] = useState(-1);
  const [inlineEditingMealType, setInlineEditingMealType] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  
  // Estado para edición inline de alérgenos
  const [editingAllergensItemId, setEditingAllergensItemId] = useState<number | null>(null);
  const [editingAllergens, setEditingAllergens] = useState<string[]>([]);
  
  // Estado para drag & drop
  const [draggedItem, setDraggedItem] = useState<{ mealId: number; itemId: number; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  // Funciones para edición inline de nombre
  const handleStartInlineEdit = (item: MealItem, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setInlineEditingItemId(item.id);
    setInlineEditingName(item.name);
    setInlineEditingMealType(mealType);
    setInlineSuggestions([]);
    setShowInlineSuggestions(false);
  };

  const handleInlineNameChange = async (value: string) => {
    setInlineEditingName(value);
    console.log('🔍 Buscando sugerencias para:', value);
    
    if (value.trim().length >= 2) {
      const results = await menuService.searchDishes(value.trim());
      console.log('📋 Resultados encontrados:', results);
      setInlineSuggestions(results);
      setShowInlineSuggestions(results.length > 0);
      setSelectedInlineSuggestionIndex(-1);
    } else {
      setInlineSuggestions([]);
      setShowInlineSuggestions(false);
    }
  };

  const selectInlineSuggestion = async (suggestion: { id: number; name: string; allergens: string[] }, itemId: number) => {
    if (!menu || !inlineEditingMealType) return;
    
    const meal = getMealByType(inlineEditingMealType);
    if (!meal) return;

    setLoading(true);
    try {
      // Actualizar con el nombre y alérgenos del plato seleccionado
      await menuService.updateMealItem(menu.id, meal.id, itemId, {
        name: suggestion.name,
        allergens: suggestion.allergens
      });

      const updatedMenu = {
        ...menu,
        meals: menu.meals.map(m => 
          m.id === meal.id 
            ? {
                ...m, 
                items: m.items.map(item => 
                  item.id === itemId 
                    ? { ...item, name: suggestion.name, allergens: suggestion.allergens }
                    : item
                )
              }
            : m
        )
      };
      onMenuUpdate(updatedMenu);
      
      // Incrementar contador de uso
      menuService.incrementPlateTemplateUsage(suggestion.id);
    } catch (error) {
      console.error('Error actualizando plato:', error);
      alert('Error al actualizar el plato');
    } finally {
      setLoading(false);
      setInlineEditingItemId(null);
      setInlineSuggestions([]);
      setShowInlineSuggestions(false);
      setInlineEditingMealType(null);
    }
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: number, currentAllergens: string[]) => {
    if (showInlineSuggestions && inlineSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedInlineSuggestionIndex(prev => 
          prev < inlineSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedInlineSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : inlineSuggestions.length - 1
        );
        return;
      } else if (e.key === 'Enter' && selectedInlineSuggestionIndex >= 0) {
        e.preventDefault();
        selectInlineSuggestion(inlineSuggestions[selectedInlineSuggestionIndex], itemId);
        return;
      }
    }
    
    if (e.key === 'Enter') {
      handleSaveInlineEdit(inlineEditingMealType!, itemId, currentAllergens);
    }
    if (e.key === 'Escape') {
      handleCancelInlineEdit();
    }
  };

  const handleSaveInlineEdit = async (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number, currentAllergens: string[]) => {
    if (!menu || !inlineEditingName.trim()) {
      setInlineEditingItemId(null);
      return;
    }

    const meal = getMealByType(mealType);
    if (!meal) {
      setInlineEditingItemId(null);
      return;
    }

    setLoading(true);
    try {
      await menuService.updateMealItem(menu.id, meal.id, itemId, {
        name: inlineEditingName.trim(),
        allergens: currentAllergens
      });

      const updatedMenu = {
        ...menu,
        meals: menu.meals.map(m => 
          m.id === meal.id 
            ? {
                ...m, 
                items: m.items.map(item => 
                  item.id === itemId 
                    ? { ...item, name: inlineEditingName.trim() }
                    : item
                )
              }
            : m
        )
      };
      onMenuUpdate(updatedMenu);
    } catch (error) {
      console.error('Error guardando nombre:', error);
      alert('Error al guardar el nombre');
    } finally {
      setLoading(false);
      setInlineEditingItemId(null);
    }
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingItemId(null);
    setInlineEditingName('');
    setInlineSuggestions([]);
    setShowInlineSuggestions(false);
    setInlineEditingMealType(null);
  };

  // Funciones para edición inline de alérgenos
  // Normaliza el nombre del alérgeno para comparaciones (minúsculas sin acentos y espacios)
  const normalizeAllergen = (allergen: string) => 
    allergen.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/\s+/g, ''); // Quitar espacios

  const handleStartEditAllergens = (item: MealItem) => {
    setEditingAllergensItemId(item.id);
    // Convertir los alérgenos del item al formato de commonAllergens
    const normalizedAllergens = item.allergens.map(a => {
      const found = commonAllergens.find(ca => normalizeAllergen(ca) === normalizeAllergen(a));
      return found || a;
    });
    console.log('📝 Editando alérgenos:', { original: item.allergens, normalized: normalizedAllergens });
    setEditingAllergens(normalizedAllergens);
  };

  const handleToggleAllergenInline = (allergen: string) => {
    setEditingAllergens(prev => {
      const normalizedAllergen = normalizeAllergen(allergen);
      const isSelected = prev.some(a => normalizeAllergen(a) === normalizedAllergen);
      
      if (isSelected) {
        // Quitar el alérgeno
        const result = prev.filter(a => normalizeAllergen(a) !== normalizedAllergen);
        console.log('➖ Quitando alérgeno:', allergen, '→', result);
        return result;
      } else {
        // Añadir el alérgeno
        const result = [...prev, allergen];
        console.log('➕ Añadiendo alérgeno:', allergen, '→', result);
        return result;
      }
    });
  };

  // Verifica si un alérgeno está seleccionado (comparación normalizada)
  const isAllergenSelected = (allergen: string) => {
    const result = editingAllergens.some(a => normalizeAllergen(a) === normalizeAllergen(allergen));
    return result;
  };

  const handleSaveAllergens = async (mealType: 'breakfast' | 'lunch' | 'dinner', itemId: number, itemName: string) => {
    if (!menu) {
      setEditingAllergensItemId(null);
      return;
    }

    const meal = getMealByType(mealType);
    if (!meal) {
      setEditingAllergensItemId(null);
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Guardando alérgenos:', {
        menuId: menu.id,
        mealId: meal.id,
        itemId: itemId,
        name: itemName,
        allergens: editingAllergens
      });

      await menuService.updateMealItem(menu.id, meal.id, itemId, {
        name: itemName,
        allergens: editingAllergens
      });

      // Recargar el menú completo desde el servidor para asegurar sincronización
      const refreshedMenu = await menuService.getMenuByDate(dateStr);
      if (refreshedMenu) {
        console.log('✅ Menú recargado desde el servidor');
        onMenuUpdate(refreshedMenu);
      }
    } catch (error) {
      console.error('❌ Error guardando alérgenos:', error);
      alert('Error al guardar los alérgenos');
    } finally {
      setLoading(false);
      setEditingAllergensItemId(null);
      setEditingAllergens([]);
    }
  };

  const handleCancelEditAllergens = () => {
    setEditingAllergensItemId(null);
    setEditingAllergens([]);
  };

  // Funciones para drag & drop
  const handleDragStart = (e: React.DragEvent, mealId: number, itemId: number, index: number) => {
    setDraggedItem({ mealId, itemId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(itemId));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, mealId: number, items: MealItem[]) => {
    e.preventDefault();
    
    if (!menu || !draggedItem || draggedItem.mealId !== mealId || dragOverIndex === null) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const fromIndex = draggedItem.index;
    const toIndex = dragOverIndex;

    if (fromIndex === toIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Reordenar el array de items
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Enviar el nuevo orden al backend
    setLoading(true);
    try {
      console.log('🔄 Reordenando platos:', {
        from: fromIndex,
        to: toIndex,
        newOrder: newItems.map(item => item.name)
      });

      await menuService.reorderMealItems(menu.id, mealId, newItems.map(item => item.id));
      
      // Recargar el menú completo desde el servidor para asegurar sincronización
      const refreshedMenu = await menuService.getMenuByDate(dateStr);
      if (refreshedMenu) {
        console.log('✅ Menú recargado con nuevo orden');
        onMenuUpdate(refreshedMenu);
      }
    } catch (error) {
      console.error('❌ Error reordenando items:', error);
      alert('Error al reordenar los platos');
    } finally {
      setLoading(false);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
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
              <ul 
                className="space-y-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => meal && handleDrop(e, meal.id, meal.items)}
              >
                {meal && meal.items.length > 0 ? (
                  meal.items.map((item, index) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => meal && handleDragStart(e, meal.id, item.id, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 bg-white p-3 rounded-lg border group cursor-grab active:cursor-grabbing transition-all ${
                        draggedItem?.itemId === item.id 
                          ? 'opacity-50 bg-gray-100' 
                          : dragOverIndex === index && draggedItem?.mealId === meal?.id
                            ? 'border-t-2 border-blue-500'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="text-gray-300 group-hover:text-gray-400 flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                        </svg>
                      </div>
                      
                      {/* Nombre del plato (editable inline) */}
                      <div className="flex-1 min-w-0">
                        {inlineEditingItemId === item.id ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={inlineEditingName}
                              onChange={(e) => handleInlineNameChange(e.target.value)}
                              onKeyDown={(e) => handleInlineKeyDown(e, item.id, item.allergens)}
                              onBlur={() => {
                                // Pequeño delay para permitir click en sugerencia
                                setTimeout(() => {
                                  if (inlineEditingItemId === item.id && !showInlineSuggestions) {
                                    handleSaveInlineEdit(mealType, item.id, item.allergens);
                                  }
                                }, 150);
                              }}
                              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            {/* Sugerencias de autocompletado */}
                            {showInlineSuggestions && inlineSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {inlineSuggestions.map((suggestion, idx) => (
                                  <div
                                    key={suggestion.id}
                                    className={`px-3 py-2 cursor-pointer ${
                                      idx === selectedInlineSuggestionIndex 
                                        ? 'bg-blue-100' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectInlineSuggestion(suggestion, item.id);
                                    }}
                                  >
                                    <div className="font-medium text-sm text-gray-900">{suggestion.name}</div>
                                    {suggestion.allergens.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {suggestion.allergens.map((allergen, aIdx) => (
                                          <span key={aIdx} className="flex items-center gap-0.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                            <AllergenIcon allergen={allergen} className="w-3 h-3" />
                                            {allergen}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span 
                            className="text-gray-900 font-medium block truncate cursor-text hover:text-blue-700"
                            onDoubleClick={() => handleStartInlineEdit(item, mealType)}
                            title="Doble clic para editar"
                          >
                            {item.name}
                          </span>
                        )}
                        {inlineEditingItemId !== item.id && (
                          editingAllergensItemId === item.id ? (
                            /* Editor inline de alérgenos */
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {commonAllergens.map((allergen) => (
                                  <button
                                    key={allergen}
                                    type="button"
                                    onClick={() => handleToggleAllergenInline(allergen)}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                                      isAllergenSelected(allergen)
                                        ? 'bg-red-100 border-red-300 text-red-800'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                  >
                                    <AllergenIcon allergen={allergen} className="w-3 h-3" />
                                    {allergen}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveAllergens(mealType, item.id, item.name)}
                                  disabled={loading}
                                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={handleCancelEditAllergens}
                                  className="text-xs text-gray-600 hover:text-gray-800"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Vista normal de alérgenos */
                            <div 
                              className="flex flex-wrap gap-1 mt-1 cursor-pointer group/allergens"
                              onClick={() => handleStartEditAllergens(item)}
                              title="Clic para editar alérgenos"
                            >
                              {item.allergens.length > 0 ? (
                                item.allergens.map((allergen, idx) => (
                                  <span 
                                    key={idx}
                                    className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full"
                                  >
                                    <AllergenIcon allergen={allergen} className="w-3 h-3" />
                                    {allergen}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic opacity-0 group-hover:opacity-100 transition-opacity">
                                  + Añadir alérgenos
                                </span>
                              )}
                              <span className="text-xs text-blue-500 opacity-0 group-hover/allergens:opacity-100 transition-opacity ml-1">
                                ✎
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleRemoveItem(mealType, item.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-500 py-4">
                    No hay platos agregados
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
