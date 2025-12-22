// src/services/menuTemplateService.ts
import axios from "axios";

// En producción usamos /api (proxy nginx), en desarrollo usamos la URL directa
const API_URL = import.meta.env.PROD 
  ? '/api' 
  : `http://${import.meta.env.VITE_API_URL || 'localhost'}:3000`;

// Configuración base de axios
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Mayor timeout para importaciones grandes
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Tipos TypeScript
export interface Allergen {
  id: number;
  name: string;
}

export interface DishAllergen {
  allergen: Allergen;
}

export interface Dish {
  id: number;
  name: string;
  allergens: DishAllergen[];
}

export interface MenuTemplateMealItem {
  id: number;
  order: number;
  dish: Dish;
}

export interface MenuTemplateMeal {
  id: number;
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MenuTemplateMealItem[];
}

export interface MenuTemplateDay {
  id: number;
  day: string;
  meals: MenuTemplateMeal[];
}

export interface MenuTemplateWeek {
  id: number;
  weekNumber: number;
  days: MenuTemplateDay[];
}

export interface MenuTemplate {
  id: number;
  name: string;
  weeks: MenuTemplateWeek[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuTemplateListItem {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJsonResult {
  message: string;
  templateId: number;
  stats: {
    weeks: number;
    allergens: number;
    dishes: number;
  };
}

// Servicio de plantillas de menú
export const menuTemplateService = {
  // Listar todas las plantillas
  async getTemplates(): Promise<MenuTemplateListItem[]> {
    const response = await apiClient.get('/menu-templates');
    return response.data;
  },

  // Obtener una plantilla completa
  async getTemplate(id: number): Promise<MenuTemplate> {
    const response = await apiClient.get(`/menu-templates/${id}`);
    return response.data;
  },

  // Importar JSON como nueva plantilla
  async importJson(name: string, menuData: any): Promise<ImportJsonResult> {
    const response = await apiClient.post('/menu-templates/import-json', {
      name,
      menuData
    });
    return response.data;
  },

  // Actualizar platos de una comida en la plantilla
  async updateMealItems(
    templateId: number,
    weekNumber: number,
    day: string,
    mealType: string,
    items: Array<{ dishId: number; order: number }>
  ): Promise<MenuTemplateMeal> {
    const response = await apiClient.put(
      `/menu-templates/${templateId}/weeks/${weekNumber}/days/${day}/meals/${mealType}/items`,
      { items }
    );
    return response.data;
  },

  // Actualizar nombre de plantilla
  async updateTemplateName(id: number, name: string): Promise<{ id: number; name: string }> {
    const response = await apiClient.put(`/menu-templates/${id}`, { name });
    return response.data;
  },

  // Eliminar plantilla
  async deleteTemplate(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/menu-templates/${id}`);
    return response.data;
  },

  // Reordenar items de una comida
  async reorderMealItems(mealId: number, itemIds: number[]): Promise<MenuTemplateMeal> {
    const response = await apiClient.put(`/menu-template-meals/${mealId}/reorder`, { itemIds });
    return response.data;
  },

  // Reemplazar plato de un item (busca o crea el plato por nombre)
  async updateItemDish(itemId: number, name: string, allergens: string[]): Promise<MenuTemplateMealItem> {
    const response = await apiClient.put(`/menu-template-items/${itemId}/dish`, { name, allergens });
    return response.data;
  },

  // Listar todos los platos
  async getDishes(): Promise<Dish[]> {
    const response = await apiClient.get('/dishes');
    return response.data;
  },

  // Obtener un plato
  async getDish(id: number): Promise<Dish> {
    const response = await apiClient.get(`/dishes/${id}`);
    return response.data;
  },

  // Actualizar alérgenos de un plato
  async updateDishAllergens(dishId: number, allergens: string[]): Promise<Dish> {
    const response = await apiClient.put(`/dishes/${dishId}/allergens`, { allergens });
    return response.data;
  },

  // Listar todos los alérgenos disponibles
  async getAllergens(): Promise<Allergen[]> {
    const response = await apiClient.get('/allergens');
    return response.data;
  }
};

export default menuTemplateService;

