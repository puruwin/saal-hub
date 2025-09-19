// src/services/menuService.ts
import axios from "axios";

const API_URL = `http://${import.meta.env.VITE_API_URL || 'localhost'}:3000`;

// Configuración base de axios
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Tipos TypeScript
export interface MealItem {
  id: number;
  name: string;
  allergens: { allergen: { name: string } }[];
}

export interface Meal {
  id: number;
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MealItem[];
}

export interface Menu {
  id: number;
  date: string;
  meals: Meal[];
}

// Transformar datos del backend al formato del frontend
const transformMealItem = (item: any): { id: number; name: string; allergens: string[] } => ({
  id: item.id,
  name: item.name,
  allergens: item.allergens.map((a: any) => a.allergen.name)
});

const transformMeal = (meal: any): { id: number; type: 'breakfast' | 'lunch' | 'dinner'; items: any[] } => ({
  id: meal.id,
  type: meal.type,
  items: meal.items.map(transformMealItem)
});

const transformMenu = (menu: any): { id: number; date: string; meals: any[] } => ({
  id: menu.id,
  date: new Date(menu.date).toISOString().split('T')[0],
  meals: menu.meals.map(transformMeal)
});

// Servicios de API
export const menuService = {
  // Obtener menú por fecha
  async getMenuByDate(date: string): Promise<{ id: number; date: string; meals: any[] } | null> {
    try {
      const response = await apiClient.get(`/menus/${date}`);
      return transformMenu(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No hay menú para esa fecha
      }
      throw error;
    }
  },

  // Obtener menús de un rango de fechas
  async getMenus(startDate?: string, endDate?: string): Promise<{ id: number; date: string; meals: any[] }[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/menus', { params });
      return response.data.map(transformMenu);
    } catch (error) {
      console.error('Error obteniendo menús:', error);
      throw error;
    }
  },

  // Crear nuevo menú
  async createMenu(menu: { date: string; meals: any[] }): Promise<{ id: number; date: string; meals: any[] }> {
    try {
      const transformedMeals = menu.meals.map(meal => ({
        type: meal.type,
        items: meal.items.map((item: any) => ({
          name: item.name,
          allergens: item.allergens
        }))
      }));

      const response = await apiClient.post('/menus', {
        date: menu.date,
        meals: transformedMeals
      });
      return transformMenu(response.data);
    } catch (error) {
      console.error('Error creando menú:', error);
      throw error;
    }
  },

  // Actualizar menú existente
  async updateMenu(menuId: number, menu: { meals: any[] }): Promise<{ id: number; date: string; meals: any[] }> {
    try {
      const transformedMeals = menu.meals.map(meal => ({
        type: meal.type,
        items: meal.items.map((item: any) => ({
          name: item.name,
          allergens: item.allergens
        }))
      }));

      const response = await apiClient.put(`/menus/${menuId}`, {
        meals: transformedMeals
      });
      return transformMenu(response.data);
    } catch (error) {
      console.error('Error actualizando menú:', error);
      throw error;
    }
  },

  // Agregar plato a una comida
  async addMealItem(menuId: number, mealId: number, item: { name: string; allergens: string[] }): Promise<any> {
    try {
      const response = await apiClient.post(`/menus/${menuId}/meals/${mealId}/items`, item);
      return transformMealItem(response.data);
    } catch (error) {
      console.error('Error agregando plato:', error);
      throw error;
    }
  },

  // Actualizar plato específico
  async updateMealItem(menuId: number, mealId: number, itemId: number, item: { name: string; allergens: string[] }): Promise<any> {
    try {
      const response = await apiClient.put(`/menus/${menuId}/meals/${mealId}/items/${itemId}`, item);
      return transformMealItem(response.data);
    } catch (error) {
      console.error('Error actualizando plato:', error);
      throw error;
    }
  },

  // Eliminar plato específico
  async deleteMealItem(menuId: number, mealId: number, itemId: number): Promise<void> {
    try {
      await apiClient.delete(`/menus/${menuId}/meals/${mealId}/items/${itemId}`);
    } catch (error) {
      console.error('Error eliminando plato:', error);
      throw error;
    }
  },

  // Agregar comida completa a un menú
  async addMeal(menuId: number, meal: { type: string; items: { name: string; allergens: string[] }[] }): Promise<any> {
    try {
      const response = await apiClient.post(`/menus/${menuId}/meals`, meal);
      return transformMeal(response.data);
    } catch (error) {
      console.error('Error agregando comida:', error);
      throw error;
    }
  },

  // Eliminar menú completo
  async deleteMenu(menuId: number): Promise<void> {
    try {
      await apiClient.delete(`/menus/${menuId}`);
    } catch (error) {
      console.error('Error eliminando menú:', error);
      throw error;
    }
  }
};
