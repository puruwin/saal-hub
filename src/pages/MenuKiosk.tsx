import { useState, useEffect } from "react";
import AllergenIcon from "../components/AllergenIcon";
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

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena'
};

export default function MenuKiosk() {
  const [todayMenu, setTodayMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Cargar menú del día desde el backend
  const loadTodayMenu = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const today = getTodayDate();
      const menu = await menuService.getMenuByDate(today);
      
      setTodayMenu(menu);
    } catch (err: any) {
      console.error('Error cargando menú del día:', err);
      setError('Error al cargar el menú del día. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar menú al montar el componente
  useEffect(() => {
    loadTodayMenu();
    
    // Auto-refresh cada 5 minutos (300000 ms)
    const interval = setInterval(loadTodayMenu, 300000);
    
    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-2xl font-medium">Cargando menú del día...</p>
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
              onClick={loadTodayMenu}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-container bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-6 py-6">
        {todayMenu ? (
          <div className="h-full kiosk-grid grid grid-cols-3 gap-6">
            {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
              const meal = todayMenu.meals.find(m => m.type === mealType);
              
              // Colores y gradientes para cada tipo de comida
              const mealStyles = {
                breakfast: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300',
                lunch: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300',
                dinner: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300'
              };
              
              const iconStyles = {
                breakfast: '🌅',
                lunch: '🍽️',
                dinner: '🌙'
              };
              
              return (
                <div key={mealType} className={`meal-card flex flex-col rounded-2xl border-2 p-6 shadow-xl ${mealStyles[mealType]} backdrop-blur-sm`}>
                  {/* Título con icono - altura fija */}
                  <div className="text-center mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-4xl mr-3">{iconStyles[mealType]}</span>
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
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
