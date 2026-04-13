# Notas de Desarrollador (Sobako)

Este archivo es para apuntes personales, recordatorios y documentación técnica interna sobre el estado del repositorio y las ramas.

## 📌 Pendientes y Recordatorios
- [ ] Revisar la implementación de los filtros CSS en `TextEditModal.tsx` si se añaden nuevos sprites.
- [ ] Mantener la paleta de 17 colores sincronizada entre texto, cajas y sombras.
- [ ] El color 11 (#29ADFF) es el color base del sprite original; no añadirle filtros por defecto.

## 🛠️ Notas sobre el Sistema de Color (Caja)
- **Filtros**: Se utilizan filtros CSS combinados (`grayscale`, `brightness`, `contrast`, `invert`) para emular la paleta PICO-8 sobre el sprite azul original (`#32A1D7`).
- **Blanco Nuclear**: Logrado con `brightness(3) contrast(1.1)`. Preserva detalles mínimos.
- **Negro con Relieve**: Logrado invirtiendo el sprite brillante (`brightness(1.9) invert(1)`) para que las sombras originales actúen como luces.
- **Melocotón (#FFCCAA)**: Utiliza `sepia(1)` como base para un tono más orgánico.

---
*Nota: Este archivo es para uso interno del equipo de desarrollo.*
