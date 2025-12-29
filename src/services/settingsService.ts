// src/services/settingsService.ts
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

// Tipos TypeScript
export interface AppSettings {
  schoolStartDate?: string;
  [key: string]: string | undefined;
}

// Servicios de API
export const settingsService = {
  // Obtener todas las configuraciones
  async getSettings(): Promise<AppSettings> {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error);
      return {};
    }
  },

  // Obtener una configuración específica
  async getSetting(key: string): Promise<string | null> {
    try {
      const response = await apiClient.get(`/settings/${key}`);
      return response.data.value;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Configuración no existe
      }
      console.error(`Error obteniendo configuración ${key}:`, error);
      return null;
    }
  },

  // Actualizar o crear una configuración
  async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      await apiClient.put(`/settings/${key}`, { value });
      return true;
    } catch (error) {
      console.error(`Error actualizando configuración ${key}:`, error);
      return false;
    }
  },

  // Actualizar múltiples configuraciones
  async updateSettings(settings: Record<string, string>): Promise<boolean> {
    try {
      await apiClient.post('/settings/bulk', settings);
      return true;
    } catch (error) {
      console.error('Error actualizando configuraciones:', error);
      return false;
    }
  },

  // Obtener la fecha de inicio escolar
  async getSchoolStartDate(): Promise<Date | null> {
    try {
      const dateString = await this.getSetting('schoolStartDate');
      if (!dateString) return null;
      return new Date(dateString);
    } catch (error) {
      console.error('Error obteniendo schoolStartDate:', error);
      return null;
    }
  }
};

export default settingsService;

