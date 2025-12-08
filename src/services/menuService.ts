// src/services/menuService.ts
import axios from "axios";

// En producción usamos /api (proxy nginx), en desarrollo usamos la URL directa
const API_URL = import.meta.env.PROD 
  ? '/api' 
  : `http://${import.meta.env.VITE_API_URL || 'localhost'}:3000`;

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
  name: item.dish?.name || item.name, // Soporte para nueva estructura (dish) y retrocompatibilidad
  allergens: item.dish?.allergens?.map((a: any) => a.allergen.name) || item.allergens?.map((a: any) => a.allergen.name) || []
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
    } catch (error: any) {
      console.error('Error agregando plato:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'MEAL_NOT_FOUND') {
        throw new Error(`La comida no existe. Por favor, recarga la página e inténtalo de nuevo.`);
      } else if (errorCode === 'MENU_NOT_FOUND') {
        throw new Error(`El menú no existe. Por favor, recarga la página e inténtalo de nuevo.`);
      }
      
      throw new Error(errorMsg);
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
  },

  // Importación masiva de menús escolares
  async bulkImportMenus(startDate: string, menuData: any): Promise<{ message: string; count: number; skipped: number; errors: number; templatesCreated: number; templatesUpdated: number }> {
    try {
      const response = await apiClient.post('/menus/bulk-import', {
        startDate,
        menuData
      });
      return response.data;
    } catch (error) {
      console.error('Error en importación masiva:', error);
      throw error;
    }
  },

  // Borrado masivo de menús por rango de fechas
  async bulkDeleteMenus(startDate: string, endDate: string): Promise<{ message: string; count: number; deletedMenus: string[] }> {
    try {
      const response = await apiClient.delete('/menus/bulk-delete', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error en borrado masivo:', error);
      throw error;
    }
  },

  // === SERVICIOS PARA PLANTILLAS DE PLATOS ===

  // Buscar plantillas de platos por nombre (autocompletado)
  async searchPlateTemplates(query: string): Promise<{ id: number; name: string; allergens: string[]; usageCount: number }[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }
      const response = await apiClient.get('/plate-templates/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error buscando plantillas:', error);
      return [];
    }
  },

  // Obtener todas las plantillas de platos
  async getAllPlateTemplates(): Promise<{ id: number; name: string; allergens: string[]; usageCount: number }[]> {
    try {
      const response = await apiClient.get('/plate-templates');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      return [];
    }
  },

  // Crear o actualizar una plantilla de plato
  async savePlateTemplate(name: string, allergens: string[]): Promise<{ id: number; name: string; allergens: string[]; usageCount: number }> {
    try {
      const response = await apiClient.post('/plate-templates', {
        name,
        allergens
      });
      return response.data;
    } catch (error) {
      console.error('Error guardando plantilla:', error);
      throw error;
    }
  },

  // Incrementar contador de uso de una plantilla
  async incrementPlateTemplateUsage(id: number): Promise<void> {
    try {
      await apiClient.post(`/plate-templates/${id}/use`);
    } catch (error) {
      console.error('Error incrementando contador:', error);
    }
  }
};
