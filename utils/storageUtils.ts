import { get, set, del } from 'idb-keyval';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await get<string>(key);
      if (value !== undefined && value !== null) {
        return value;
      }
      // Fallback a localStorage para migrar datos antiguos de manera transparente
      const localValue = localStorage.getItem(key);
      if (localValue !== null) {
        await set(key, localValue); 
        return localValue;
      }
      return null;
    } catch (e) {
      console.error(`ANTI_CLOUD Error leyendo ${key}:`, e);
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await set(key, value);
      // Borrar la copia de localStorage si existe para ahorrar espacio
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`ANTI_CLOUD Error guardando ${key} en IndexedDB:`, e);
      // Fallback estricto a localStorage si IndexedDB falla
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.error("ANTI_CLOUD Alerta Crítica: LocalStorage quota exceeded.", err);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`ANTI_CLOUD Error eliminando ${key}:`, e);
    }
  }
};
