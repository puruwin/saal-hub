import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AllergenIcon from "../components/AllergenIcon";
import { menuService } from "../services/menuService";
import breakfastImage from "../assets/breakfast.jpg";
import lunchImage from "../assets/lunch.jpg";
import dinnerImage from "../assets/dinner.jpg";

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
    
    return () => {};
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  // Determinar qué comida mostrar según la hora actual
  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const totalMinutes = hour * 60 + minute;

    // 00:00 - 11:59: Desayuno
    if (totalMinutes >= 0 && totalMinutes < 720) {
      return 'breakfast';
    }
    // 12:00 - 16:29: Comida
    if (totalMinutes >= 720 && totalMinutes < 990) {
      return 'lunch';
    }
    // 16:30 - 23:59: Cena
    return 'dinner';
  };

  // Obtener la comida actual del menú
  const getCurrentMeal = (): Meal | null => {
    if (!menu) return null;
    const mealType = getCurrentMealType();
    return menu.meals.find(meal => meal.type === mealType) || null;
  };

  // Obtener las otras comidas para el preview
  const getOtherMeals = (): Meal[] => {
    if (!menu) return [];
    const currentMealType = getCurrentMealType();
    return menu.meals.filter(meal => meal.type !== currentMealType);
  };

  // Obtener la imagen según el tipo de comida
  const getMealImage = (mealType: 'breakfast' | 'lunch' | 'dinner'): string => {
    const images = {
      breakfast: breakfastImage,
      lunch: lunchImage,
      dinner: dinnerImage
    };
    return images[mealType];
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center font-['Roboto',sans-serif]">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-2xl font-medium font-['Roboto',sans-serif]">Cargando menú...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas de conexión
  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center font-['Roboto',sans-serif]">
        <div className="text-center">
          <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-200">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-red-800 mb-4 font-['Roboto',sans-serif]">Error de conexión</h2>
            <p className="text-red-600 text-xl mb-6 font-['Roboto',sans-serif]">{error}</p>
            <button
              onClick={loadMenu}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors font-['Roboto',sans-serif]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime();
  const currentMeal = getCurrentMeal();
  const otherMeals = getOtherMeals();
  const currentMealType = getCurrentMealType();

  return (
    <div id="wrapper" className="h-screen w-screen bg-[#fffde3] font-['Roboto',sans-serif]">
      {menu && currentMeal ? (
        <div className="h-full grid grid-cols-2">
          <div className="h-full pl-16 pt-8 flex flex-col">
            <div id="header" className="w-full flex justify-between items-start mb-8">
              <h1 className="text-5xl tracking-[0.20em] font-extrabold font-['Roboto',sans-serif]">
                {mealTypeLabels[currentMealType].toUpperCase()}
              </h1>
              <div className="flex flex-col items-end mr-6">
                <p className="text-2xl font-['Roboto',sans-serif]">{date.toUpperCase()}</p>
                <p className="text-4xl tracking-[0.20em] font-extrabold font-['Roboto',sans-serif] -mr-[0.20em]">{time}</p>
              </div>
            </div>
            <div id="content" className="flex flex-col justify-around flex-1">
              {currentMeal.items.map((item) => (
                <div key={item.id}>
                  <p className="text-2xl font-extrabold tracking-[0.10em] font-['Roboto',sans-serif]">
                    {item.name.toUpperCase()}
                  </p>
                  <div className="flex flex-row space-x-4 min-h-[2rem]">
                    {item.allergens.length > 0 && item.allergens.map((allergen) => (
                      <AllergenIcon key={allergen} allergen={allergen} className="w-8 h-8" />
                    ))}
                  </div>
                </div>
              ))}
              <div className={`grid ${otherMeals.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4 border-4 box-border border-gray-800 py-2 px-4 mr-6`}>
                {otherMeals.map((meal) => (
                  <div key={meal.id}>
                    <p className="text-2xl font-extrabold tracking-[0.10em] font-['Roboto',sans-serif]">
                      {mealTypeLabels[meal.type].toUpperCase()}
                    </p>
                    {meal.items.map((item) => (
                      <p key={item.id} className="font-['Roboto',sans-serif]">
                        {item.name}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-full">
            <img src={getMealImage(currentMealType)} alt="menu" className="w-full h-screen object-cover" />
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
              <div className="text-8xl mb-6">📅</div>
              <h2 className="text-5xl font-bold text-gray-800 mb-6 drop-shadow-sm font-['Roboto',sans-serif]">
                No hay menú disponible
              </h2>
              <p className="text-gray-600 text-2xl font-medium font-['Roboto',sans-serif]">
                {paramDate ? formatMenuDate(paramDate) : formatDateTime().date}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

