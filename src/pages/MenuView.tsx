import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AllergenIcon from "../components/AllergenIcon";
import { menuService } from "../services/menuService";
import { settingsService } from "../services/settingsService";
import breakfastImage from "../assets/breakfast.jpg";
import lunchImage from "../assets/lunch.jpg";
import dinnerImage from "../assets/dinner.jpg";
import marcoRosas from "../assets/marco_rosas.svg";
import ske48Image from "../assets/ske48.png";

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
  const [schoolStartDate, setSchoolStartDate] = useState<Date | null>(null);

  // Función para obtener la fecha a mostrar
  const getDisplayDate = () => {
    // Si hay fecha en el parámetro, usarla; sino usar hoy
    return paramDate || new Date().toISOString().split('T')[0];
  };

  // Cargar configuración del backend (fecha de inicio escolar)
  const loadSettings = async () => {
    try {
      const startDate = await settingsService.getSchoolStartDate();
      if (startDate) {
        setSchoolStartDate(startDate);
        console.log('📅 Fecha de inicio escolar cargada:', startDate);
      } else {
        console.warn('⚠️ No se encontró fecha de inicio escolar en la configuración');
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
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

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadSettings();
  }, []);

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

    // 00:00 - 09:00: Desayuno
    if (totalMinutes >= 0 && totalMinutes < 540) {
      return 'breakfast';
    }
    // 09:00 - 14:30: Comida
    if (totalMinutes >= 540 && totalMinutes < 870) {
      return 'lunch';
    }
    // 14:30 - 23:59: Cena
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

  // Verificar si la fecha del menú es fin de semana
  const isWeekend = (): boolean => {
    if (!menu) return false;
    const date = new Date(menu.date);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
  };

  // Calcular el número de semana escolar basado en una fecha de inicio
  // Asumiendo que la semana escolar comienza un lunes específico
  const getSchoolWeek = (date: Date, schoolStartDate: Date): number => {
    const timeDiff = date.getTime() - schoolStartDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
  };

  // Verificar si es el último viernes de escuela (viernes semana 8) durante la comida
  const isLastFridayLunch = (): boolean => {
    if (!menu) return false;
    
    // Si no tenemos la fecha de inicio escolar, no podemos calcular la semana
    if (!schoolStartDate) {
      console.warn('⚠️ No se puede verificar semana 8: falta schoolStartDate');
      return false;
    }
    
    const date = new Date(menu.date);
    const dayOfWeek = date.getDay();
    
    // Verificar que sea viernes (5)
    if (dayOfWeek !== 5) return false;
    
    // Verificar que sea hora de comida
    const currentMealType = getCurrentMealType();
    if (currentMealType !== 'lunch') return false;
    
    // Calcular la semana escolar actual usando la fecha del backend
    const weekNumber = getSchoolWeek(date, schoolStartDate);
    
    console.log('📊 Semana escolar actual:', weekNumber, 'para fecha:', menu.date);
    console.log('📅 schoolStartDate:', schoolStartDate);
    console.log('🔍 Es viernes?', dayOfWeek === 5, '| Es lunch?', currentMealType === 'lunch');
    
    // Verificar si es la semana 9 (última semana, que es la 8 contando desde 0)
    // El bulk import crea: semana 0 (JUE-DOM) + semanas 1-8 (completas) = 9 semanas totales
    // El viernes de graduación es el viernes de la semana 8 (última semana completa)
    return weekNumber === 9;
  };

  // Obtener comidas para la vista de fin de semana
  const getWeekendMeals = (): { breakfast: Meal | null; lunch: Meal | null } => {
    if (!menu) return { breakfast: null, lunch: null };
    const breakfast = menu.meals.find(meal => meal.type === 'breakfast') || null;
    const lunch = menu.meals.find(meal => meal.type === 'lunch') || null;
    return { breakfast, lunch };
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
  const weekendMeals = getWeekendMeals();

  return (
    <div id="wrapper" className="h-screen w-screen bg-[#fffde3] font-['Roboto',sans-serif]">
        {menu && isLastFridayLunch() && currentMeal ? (
         <div className="h-full flex flex-col bg-[#daf2ff] relative overflow-hidden">
           {/* Marco de rosas - Esquina superior izquierda */}
           <img 
             src={marcoRosas} 
             alt="" 
             className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
             style={{ zIndex: 10 }}
           />
           
           {/* Marco de rosas - Esquina inferior derecha (rotado 180°) */}
           <img 
             src={marcoRosas} 
             alt="" 
             className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
             style={{ transform: 'rotate(180deg)', zIndex: 10 }}
           />
           
           <div 
             id="header" 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
             style={{ zIndex: 20, width: '85vw', maxWidth: '1800px' }}
           >
             {/* Contenedor de imagen y texto superpuestos */}
             <div className="relative">
               {/* Imagen del grupo */}
               <div className="mt-32">
                 <img 
                   src={ske48Image} 
                   alt="SKE48" 
                   className="w-full h-auto"
                 />
               </div>
               
               {/* Texto en arco (superpuesto) */}
               <div className="absolute top-[-120px] left-0 w-full">
                 <svg viewBox="0 0 1600 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                   <defs>
                     <path 
                       id="arc-path" 
                       d="M 50,280 Q 800,80 1550,280"
                       fill="transparent"
                     />
                   </defs>
                   <text 
                     fontSize="68" 
                     fill="#003857" 
                     textAnchor="middle"
                     style={{ 
                       fontFamily: 'Rowena, serif',
                       fontWeight: 900,
                       letterSpacing: '0.05em'
                     }}
                   >
                     <textPath href="#arc-path" startOffset="50%">
                       MENÚ ESPECIAL: VIERNES DE GRADUACIÓN
                     </textPath>
                   </text>
                 </svg>
               </div>
             </div>
           </div>
         </div>
      ) : menu && isWeekend() && weekendMeals.breakfast ? (
        // Vista de fin de semana - dos columnas sin imagen
        <div className="h-full flex flex-col">
          {/* Header compartido */}
          <div id="header" className="w-full flex justify-between items-start px-16 pt-8 pb-4">
            <h1 className="text-5xl tracking-[0.20em] font-extrabold font-['Roboto',sans-serif]">
              FIN DE SEMANA
            </h1>
            <div className="flex flex-col items-end">
              <p className="text-2xl font-['Roboto',sans-serif]">{date.toUpperCase()}</p>
              <p className="text-4xl tracking-[0.20em] font-extrabold font-['Roboto',sans-serif] -mr-[0.20em]">{time}</p>
            </div>
          </div>
          
          {/* Contenido en dos columnas */}
          <div className="flex-1 grid grid-cols-2 gap-8 px-16 pb-8">
            {/* Columna izquierda: Desayuno */}
            <div className="flex flex-col justify-around border-4 box-border border-gray-800 py-4 px-6">
              <div>
                <h2 className="text-4xl font-extrabold tracking-[0.10em] mb-4 font-['Roboto',sans-serif]">
                  DESAYUNO
                </h2>
              </div>
              {weekendMeals.breakfast.items.map((item) => (
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
            </div>
            
            {/* Columna derecha: En Nevera */}
            {weekendMeals.lunch && (
              <div className="flex flex-col justify-around border-4 box-border border-gray-800 py-4 px-6">
                <div>
                  <h2 className="text-4xl font-extrabold tracking-[0.10em] mb-4 font-['Roboto',sans-serif]">
                    EN NEVERA
                  </h2>
                </div>
                {weekendMeals.lunch.items.map((item) => (
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
              </div>
            )}
          </div>
        </div>
      ) : menu && currentMeal ? (
        // Vista normal entre semana
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

