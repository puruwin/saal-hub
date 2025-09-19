import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyMenuView from "../components/WeeklyMenuView";
import DayEditor from "../components/DayEditor";
import { menuService } from "../services/menuService";

interface User {
  id: string;
  username: string;
}

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay token
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData || userData === "undefined") {
      console.log("No hay token o datos de usuario válidos, redirigiendo al login");
      console.log("Token:", token);
      console.log("UserData:", userData);
      navigate("/");
      return;
    }

    try {
      // Verificar que userData no esté vacío o sea solo espacios
      if (userData.trim() === "") {
        console.log("Datos de usuario vacíos, redirigiendo al login");
        navigate("/");
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log("Usuario parseado correctamente:", parsedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error al parsear datos del usuario:", error);
      console.log("Datos problemáticos:", userData);
      // Limpiar datos corruptos
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Cargar menús del backend
  const loadMenus = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Cargar menús de la semana actual
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunes
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

      const startDateStr = startOfWeek.toISOString().split('T')[0];
      const endDateStr = endOfWeek.toISOString().split('T')[0];
      
      const fetchedMenus = await menuService.getMenus(startDateStr, endDateStr);
      setMenus(fetchedMenus);
    } catch (err) {
      console.error('Error cargando menús:', err);
      setError('Error al cargar los menús. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar menús
  const handleMenuUpdate = async (updatedMenu: Menu) => {
    setLoading(true);
    setError(null);
    try {
      const result = await menuService.updateMenu(updatedMenu.id, {
        meals: updatedMenu.meals
      });
      
      setMenus(prev => {
        const existingIndex = prev.findIndex(m => m.id === result.id);
        if (existingIndex >= 0) {
          const newMenus = [...prev];
          newMenus[existingIndex] = result;
          return newMenus;
        } else {
          return [...prev, result];
        }
      });
    } catch (err) {
      console.error('Error actualizando menú:', err);
      setError('Error al actualizar el menú. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuCreate = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const newMenu = await menuService.createMenu({
        date,
        meals: []
      });
      setMenus(prev => [...prev, newMenu]);
    } catch (err) {
      console.error('Error creando menú:', err);
      setError('Error al crear el menú. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getMenuForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return menus.find(menu => menu.date === dateStr);
  };

  // Cargar menús cuando el usuario se autentique
  useEffect(() => {
    if (user) {
      loadMenus();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Menu Hub Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Ver Menú Público
              </a>
              <span className="text-gray-700">
                Bienvenido, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Controles de navegación */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Menús</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Vista Semanal
                </button>
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'daily'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Editor Diario
                </button>
              </div>
            </div>

            {viewMode === 'daily' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Manejo de errores */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  ⚠️
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de carga */}
          {loading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
                <p className="text-sm">Cargando...</p>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          {viewMode === 'weekly' ? (
            <WeeklyMenuView 
              menus={menus} 
              onMenuUpdate={handleMenuUpdate} 
            />
          ) : (
            <DayEditor
              menu={getMenuForDate(selectedDate) ?? null}
              date={selectedDate}
              onMenuUpdate={handleMenuUpdate}
              onMenuCreate={handleMenuCreate}
            />
          )}
        </div>
      </main>
    </div>
  );
}
