// src/services/auth.ts
import axios from "axios";
import type { AuthResponse } from "../types/Auth";

// Debug: verificar variables de entorno
console.log('🔍 Debug VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 Debug MODE:', import.meta.env.MODE);
console.log('🔍 Debug DEV:', import.meta.env.DEV);
console.log('🔍 Debug todas las env:', import.meta.env);

const API_URL = `http://${import.meta.env.VITE_API_URL || 'localhost'}:3000`;
console.log('🎯 API_URL final:', API_URL);

// Configuración base de axios
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<any>('/auth/login', {
      username,
      password,
    });
    
    console.log('Login exitoso:', response.data);
    
    // Si el servidor solo devuelve el token, crear el objeto user
    if (response.data.token && !response.data.user) {
      const authResponse: AuthResponse = {
        token: response.data.token,
        user: {
          id: "1", // ID temporal, podrías extraerlo del JWT si es necesario
          username: username // Usar el username como email temporalmente
        }
      };
      return authResponse;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error('Error en login:', error);
    
    // Manejo específico de errores
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('Credenciales inválidas');
      } else if (axiosError.response?.status === 404) {
        throw new Error('Servicio no disponible');
      }
    }
    
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ECONNREFUSED') {
      throw new Error('No se puede conectar con el servidor');
    }
    
    throw new Error('Error inesperado. Inténtalo de nuevo');
  }
}
