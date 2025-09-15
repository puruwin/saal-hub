import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyMenuView from "../components/WeeklyMenuView";
import DayEditor from "../components/DayEditor";

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

  // Funciones para manejar menús
  const handleMenuUpdate = (updatedMenu: Menu) => {
    setMenus(prev => {
      const existingIndex = prev.findIndex(m => m.id === updatedMenu.id);
      if (existingIndex >= 0) {
        const newMenus = [...prev];
        newMenus[existingIndex] = updatedMenu;
        return newMenus;
      } else {
        return [...prev, updatedMenu];
      }
    });
  };

  const handleMenuCreate = (date: string) => {
    const newMenu: Menu = {
      id: Date.now(),
      date,
      meals: []
    };
    setMenus(prev => [...prev, newMenu]);
  };

  const getMenuForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return menus.find(menu => menu.date === dateStr);
  };

  // Datos de ejemplo para demostración
  useEffect(() => {
    if (user) {
      // Cargar menús de ejemplo
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
                { id: 2, name: 'Tostadas con mantequilla', allergens: ['Gluten', 'Lácteos'] }
              ]
            },
            {
              id: 2,
              type: 'lunch',
              items: [
                { id: 3, name: 'Ensalada mixta', allergens: [] },
                { id: 4, name: 'Pollo a la plancha', allergens: [] },
                { id: 5, name: 'Arroz blanco', allergens: [] }
              ]
            },
            {
              id: 3,
              type: 'dinner',
              items: [
                { id: 6, name: 'Sopa de verduras', allergens: [] },
                { id: 7, name: 'Pescado al horno', allergens: ['Pescado'] }
              ]
            }
          ]
        }
      ];
      setMenus(exampleMenus);
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
