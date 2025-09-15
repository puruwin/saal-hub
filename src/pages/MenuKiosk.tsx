import { useState, useEffect } from "react";
import AllergenIcon from "../components/AllergenIcon";

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
  lunch: 'Almuerzo',
  dinner: 'Cena'
};

export default function MenuKiosk() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos (en producción vendría de la API)
  useEffect(() => {
    const loadMenus = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo
      const exampleMenus: Menu[] = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          meals: [
            {
              id: 1,
              type: 'breakfast',
              items: [
                { id: 1, name: 'Café con leche', allergens: ['Lácteos'] },
                { id: 2, name: 'Tostadas con mantequilla', allergens: ['Gluten', 'Lácteos'] },
                { id: 3, name: 'Zumo de naranja natural', allergens: [] },
                { id: 4, name: 'Cereales con leche', allergens: ['Lácteos', 'Gluten'] }
              ]
            },
            {
              id: 2,
              type: 'lunch',
              items: [
                { id: 5, name: 'Ensalada mixta con tomate y lechuga', allergens: [] },
                { id: 6, name: 'Pollo a la plancha con especias', allergens: [] },
                { id: 7, name: 'Arroz blanco con verduras', allergens: [] },
                { id: 8, name: 'Pan integral', allergens: ['Gluten'] },
                { id: 9, name: 'Fruta de temporada', allergens: [] }
              ]
            },
            {
              id: 3,
              type: 'dinner',
              items: [
                { id: 10, name: 'Sopa de verduras casera', allergens: [] },
                { id: 11, name: 'Pescado al horno con limón', allergens: ['Pescado'] },
                { id: 12, name: 'Puré de patatas', allergens: ['Lácteos'] },
                { id: 13, name: 'Yogur natural', allergens: ['Lácteos'] }
              ]
            }
          ]
        }
      ];
      
      setMenus(exampleMenus);
      setIsLoading(false);
    };

    loadMenus();
  }, []);

  const getTodayMenu = () => {
    const today = new Date().toISOString().split('T')[0];
    return menus.find(menu => menu.date === today);
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

  const todayMenu = getTodayMenu();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-8 py-8">
        {todayMenu ? (
          <div className="h-full grid grid-cols-3 gap-8">
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
                <div key={mealType} className={`flex flex-col rounded-2xl border-2 p-6 shadow-xl ${mealStyles[mealType]} backdrop-blur-sm`}>
                  {/* Título con icono */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-5xl mr-3">{iconStyles[mealType]}</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 drop-shadow-sm">
                      {mealTypeLabels[mealType]}
                    </h2>
                  </div>

                  {/* Lista de platos */}
                  <div className="flex-1">
                    {meal && meal.items.length > 0 ? (
                      <div className="space-y-6">
                        {meal.items.map((item) => (
                          <div key={item.id} className="text-center">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
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
                                      <AllergenIcon allergen={allergen} className="w-8 h-8" />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/50">
                          <p className="text-gray-600 text-2xl font-medium">
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
