import { useState, useEffect } from "react";
import AllergenIcon from "./AllergenIcon";
import { menuService } from "../services/menuService";
import menuTemplateService, {
  MenuTemplate,
  MenuTemplateListItem,
  MenuTemplateWeek,
  MenuTemplateDay,
  MenuTemplateMeal,
  Dish,
  Allergen
} from "../services/menuTemplateService";

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena'
};

const dayLabels: Record<string, string> = {
  'LUN': 'Lunes',
  'MAR': 'Martes',
  'MIE': 'Miércoles',
  'JUE': 'Jueves',
  'VIE': 'Viernes',
  'SAB_DOM': 'Fin de semana'
};

const dayOrder = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB_DOM'];

const ALLERGEN_LIST = [
  'gluten', 'lacteos', 'huevos', 'pescado', 'crustaceos', 
  'moluscos', 'frutos_cascara', 'cacahuetes', 'soja', 
  'apio', 'mostaza', 'sesamo', 'sulfitos', 'altramuces'
];

interface EditingItem {
  itemId: number;
  dish: Dish;
}

interface EditDishModalProps {
  editingItem: EditingItem | null;
  allAllergens: string[];
  onSave: (itemId: number, name: string, allergens: string[]) => Promise<void>;
  onClose: () => void;
}

function EditDishModal({ editingItem, allAllergens, onSave, onClose }: EditDishModalProps) {
  const [dishName, setDishName] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setDishName(editingItem.dish.name);
      setSelectedAllergens(editingItem.dish.allergens.map(a => a.allergen.name));
    }
  }, [editingItem]);

  if (!editingItem) return null;

  const handleSave = async () => {
    if (!dishName.trim()) {
      alert('El nombre del plato no puede estar vacío');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(editingItem.itemId, dishName.trim(), selectedAllergens);
      onClose();
    } catch (error) {
      console.error('Error guardando plato:', error);
      alert('Error al guardar el plato');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const nameChanged = dishName.trim() !== editingItem.dish.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">Editar Plato</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Nombre del plato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del plato
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Nombre del plato"
            />
            {nameChanged && (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Se buscará un plato existente o se creará uno nuevo
              </p>
            )}
          </div>

          {/* Alérgenos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alérgenos
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {ALLERGEN_LIST.map(allergen => (
                <button
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    selectedAllergens.includes(allergen)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AllergenIcon allergen={allergen} size={28} />
                  <span className="text-xs mt-1 text-gray-600 capitalize">
                    {allergen.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dishName.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ImportJsonModalProps {
  onImport: (name: string, jsonData: any) => Promise<void>;
  onClose: () => void;
}

function ImportJsonModal({ onImport, onClose }: ImportJsonModalProps) {
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonText(event.target?.result as string);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const menuData = JSON.parse(jsonText);
      if (!menuData.weeks || !Array.isArray(menuData.weeks)) {
        setError('El JSON debe contener un array "weeks"');
        return;
      }

      setImporting(true);
      setError('');
      await onImport(name, menuData);
      onClose();
    } catch (e) {
      setError('Error al parsear el JSON. Verifica el formato.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">Importar Plantilla desde JSON</h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la plantilla
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Menú Escolar 2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O pega el contenido JSON
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"weeks": [...]}'
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !jsonText || !name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {importing ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuTemplateEditor() {
  const [templates, setTemplates] = useState<MenuTemplateListItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  
  // Estado para edición inline de nombre de plato
  const [inlineEditingItemId, setInlineEditingItemId] = useState<number | null>(null);
  const [inlineEditingName, setInlineEditingName] = useState('');
  const [inlineSuggestions, setInlineSuggestions] = useState<{ id: number; name: string; allergens: string[] }[]>([]);
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [selectedInlineSuggestionIndex, setSelectedInlineSuggestionIndex] = useState(-1);
  
  // Estado para drag & drop
  const [draggedItem, setDraggedItem] = useState<{ mealId: number; itemId: number; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Cargar lista de plantillas
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await menuTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (id: number) => {
    setLoadingTemplate(true);
    try {
      const data = await menuTemplateService.getTemplate(id);
      setSelectedTemplate(data);
      setSelectedWeek(0);
    } catch (error) {
      console.error('Error cargando plantilla:', error);
      alert('Error al cargar la plantilla');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleImportJson = async (name: string, menuData: any) => {
    const result = await menuTemplateService.importJson(name, menuData);
    alert(`Plantilla "${name}" importada correctamente.\n\nEstadísticas:\n- Semanas: ${result.stats.weeks}\n- Platos: ${result.stats.dishes}\n- Alérgenos: ${result.stats.allergens}`);
    await loadTemplates();
    await loadTemplate(result.templateId);
  };

  const handleUpdateItemDish = async (itemId: number, name: string, allergens: string[]) => {
    await menuTemplateService.updateItemDish(itemId, name, allergens);
    // Recargar la plantilla para ver los cambios
    if (selectedTemplate) {
      await loadTemplate(selectedTemplate.id);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      return;
    }

    try {
      await menuTemplateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      alert('Error al eliminar la plantilla');
    }
  };

  const handleStartEditName = () => {
    if (selectedTemplate) {
      setNewName(selectedTemplate.name);
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!selectedTemplate || !newName.trim()) return;

    setSavingName(true);
    try {
      await menuTemplateService.updateTemplateName(selectedTemplate.id, newName.trim());
      // Actualizar en la lista de plantillas
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id ? { ...t, name: newName.trim() } : t
      ));
      // Actualizar en la plantilla seleccionada
      setSelectedTemplate(prev => prev ? { ...prev, name: newName.trim() } : null);
      setEditingName(false);
    } catch (error: any) {
      console.error('Error guardando nombre:', error);
      alert(error.response?.data?.error || 'Error al guardar el nombre');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNewName('');
  };

  // Funciones para edición inline de nombre de plato
  const handleStartInlineEdit = (item: { id: number; dish: { name: string } }) => {
    setInlineEditingItemId(item.id);
    setInlineEditingName(item.dish.name);
    setInlineSuggestions([]);
    setShowInlineSuggestions(false);
  };

  const handleInlineNameChange = async (value: string) => {
    setInlineEditingName(value);
    
    if (value.trim().length >= 2) {
      const results = await menuService.searchDishes(value.trim());
      setInlineSuggestions(results);
      setShowInlineSuggestions(results.length > 0);
      setSelectedInlineSuggestionIndex(-1);
    } else {
      setInlineSuggestions([]);
      setShowInlineSuggestions(false);
    }
  };

  const selectInlineSuggestion = async (suggestion: { id: number; name: string; allergens: string[] }, itemId: number) => {
    try {
      // Actualizar con el nombre y alérgenos del plato seleccionado
      await menuTemplateService.updateItemDish(itemId, suggestion.name, suggestion.allergens);
      if (selectedTemplate) {
        await loadTemplate(selectedTemplate.id);
      }
      // Incrementar contador de uso
      menuService.incrementPlateTemplateUsage(suggestion.id);
    } catch (error) {
      console.error('Error actualizando plato:', error);
      alert('Error al actualizar el plato');
    } finally {
      setInlineEditingItemId(null);
      setInlineSuggestions([]);
      setShowInlineSuggestions(false);
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
      handleSaveInlineEdit(itemId, currentAllergens);
    }
    if (e.key === 'Escape') {
      handleCancelInlineEdit();
    }
  };

  const handleSaveInlineEdit = async (itemId: number, currentAllergens: string[]) => {
    if (!inlineEditingName.trim()) {
      setInlineEditingItemId(null);
      return;
    }

    try {
      await menuTemplateService.updateItemDish(itemId, inlineEditingName.trim(), currentAllergens);
      if (selectedTemplate) {
        await loadTemplate(selectedTemplate.id);
      }
    } catch (error) {
      console.error('Error guardando nombre:', error);
      alert('Error al guardar el nombre');
    }
    setInlineEditingItemId(null);
    setInlineSuggestions([]);
    setShowInlineSuggestions(false);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingItemId(null);
    setInlineEditingName('');
    setInlineSuggestions([]);
    setShowInlineSuggestions(false);
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

  const handleDrop = async (e: React.DragEvent, mealId: number, items: Array<{ id: number }>) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.mealId !== mealId || dragOverIndex === null) {
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
    try {
      await menuTemplateService.reorderMealItems(mealId, newItems.map(item => item.id));
      if (selectedTemplate) {
        await loadTemplate(selectedTemplate.id);
      }
    } catch (error) {
      console.error('Error reordenando items:', error);
      alert('Error al reordenar los platos');
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const currentWeek = selectedTemplate?.weeks.find(w => w.weekNumber === selectedWeek);
  const sortedDays = currentWeek?.days.sort((a, b) => 
    dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <h1 className="text-2xl font-bold text-slate-800">Editor de Plantillas de Menú</h1>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar JSON
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Lista de plantillas */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-slate-700">Plantillas</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {templates.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No hay plantillas.<br />
                    <button 
                      onClick={() => setShowImportModal(true)}
                      className="text-blue-600 hover:underline mt-2"
                    >
                      Importar una
                    </button>
                  </div>
                ) : (
                  templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                        selectedTemplate?.id === template.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                      }`}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{template.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main content - Editor de plantilla */}
          <div className="col-span-9">
            {loadingTemplate ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-4">
                {/* Template name header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  {editingName ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') handleCancelEditName();
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                        placeholder="Nombre de la plantilla"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName || !newName.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingName ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h2>
                      <button
                        onClick={handleStartEditName}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar nombre"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Week tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.weeks.map(week => (
                      <button
                        key={week.weekNumber}
                        onClick={() => setSelectedWeek(week.weekNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedWeek === week.weekNumber
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Semana {week.weekNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days grid */}
                {sortedDays && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedDays.map(day => (
                      <div
                        key={day.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
                          <h3 className="font-semibold text-white">
                            {dayLabels[day.day] || day.day}
                          </h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {day.meals
                            .sort((a, b) => {
                              const order = ['breakfast', 'lunch', 'dinner'];
                              return order.indexOf(a.type) - order.indexOf(b.type);
                            })
                            .map(meal => (
                              <div key={meal.id} className="p-3">
                                <h4 className="text-sm font-semibold text-slate-600 mb-2">
                                  {mealTypeLabels[meal.type] || meal.type}
                                </h4>
                                <ul 
                                  className="space-y-1"
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => handleDrop(e, meal.id, meal.items)}
                                >
                                  {meal.items.map((item, index) => (
                                    <li
                                      key={item.id}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, meal.id, item.id, index)}
                                      onDragOver={(e) => handleDragOver(e, index)}
                                      onDragLeave={handleDragLeave}
                                      onDragEnd={handleDragEnd}
                                      className={`flex items-center gap-2 text-sm group rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                                        draggedItem?.itemId === item.id 
                                          ? 'opacity-50 bg-slate-100' 
                                          : dragOverIndex === index && draggedItem?.mealId === meal.id
                                            ? 'border-t-2 border-emerald-500'
                                            : 'hover:bg-slate-50'
                                      }`}
                                    >
                                      {/* Drag handle */}
                                      <div className="text-slate-300 group-hover:text-slate-400 p-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                                        </svg>
                                      </div>
                                      
                                      {/* Nombre del plato (editable inline) */}
                                      <div className="flex-1 min-w-0 relative">
                                        {inlineEditingItemId === item.id ? (
                                          <>
                                            <input
                                              type="text"
                                              value={inlineEditingName}
                                              onChange={(e) => handleInlineNameChange(e.target.value)}
                                              onKeyDown={(e) => handleInlineKeyDown(e, item.id, item.dish.allergens.map(a => a.allergen.name))}
                                              onBlur={() => {
                                                // Pequeño delay para permitir click en sugerencia
                                                setTimeout(() => {
                                                  if (inlineEditingItemId === item.id && !showInlineSuggestions) {
                                                    handleSaveInlineEdit(item.id, item.dish.allergens.map(a => a.allergen.name));
                                                  }
                                                }, 150);
                                              }}
                                              className="w-full px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                        ? 'bg-emerald-100' 
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
                                          </>
                                        ) : (
                                          <span 
                                            className="text-slate-700 block truncate cursor-text hover:text-emerald-700"
                                            onDoubleClick={() => handleStartInlineEdit(item)}
                                            title="Doble clic para editar"
                                          >
                                            {item.dish.name}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Alérgenos y botón de editar */}
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {item.dish.allergens.map(a => (
                                          <AllergenIcon
                                            key={a.allergen.id}
                                            allergen={a.allergen.name}
                                            size={16}
                                          />
                                        ))}
                                        <button
                                          onClick={() => setEditingItem({ itemId: item.id, dish: item.dish })}
                                          className="ml-1 p-1 text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Editar alérgenos"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                          </svg>
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  Selecciona una plantilla
                </h3>
                <p className="text-slate-500">
                  Elige una plantilla de la lista o importa una nueva desde un archivo JSON.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingItem && (
        <EditDishModal
          editingItem={editingItem}
          allAllergens={ALLERGEN_LIST}
          onSave={handleUpdateItemDish}
          onClose={() => setEditingItem(null)}
        />
      )}

      {showImportModal && (
        <ImportJsonModal
          onImport={handleImportJson}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

