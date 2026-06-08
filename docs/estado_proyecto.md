# Estado Actual del Proyecto - GestoBar MVP

Este documento resume las funcionalidades implementadas hasta el momento, organizadas por Historias de Usuario (HU) y sus respectivos archivos.

## 1. Épica: Control de Menú e Inventario Básico

### HU08: Gestión de Productos del Menú (CRUD Backend)
Se ha completado la lógica de negocio y los endpoints para administrar el catálogo de productos con aislamiento por comercio.
- **Esquemas de validación:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.schema.ts`
- **Lógica de negocio:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.service.ts`
- **Acceso a datos (Prisma):** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.repository.ts`
- **Rutas de la API:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.routes.ts`

### HU09: Descuento Automático de Stock
Implementada la lógica para reducir existencias y validar disponibilidad.
- **Servicio:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.service.ts` (Método `decrementStock`)
- **Repositorio:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\inventory\product.repository.ts` (Operación atomica `decrement`)

## 2. Épica: Reportes y Dashboard Simple

### HU14: Dashboard de Métricas Clave Diarias
Interfaz de usuario avanzada que consume datos del backend para mostrar el rendimiento del negocio.
- **Vista Principal:** `c:\Users\IK\Desktop\GestoBar\frontend\src\pages\Dashboard.tsx`
    - Visualización de KPIs (Ventas, Gastos, Ingreso Neto).
    - Gráfico de tendencia de ventas.
    - Tabla de productos más vendidos.
    - Estado y rendimiento de mesas.

## 3. Infraestructura y Multi-Tenancy (Base)

### HU01 & HU02: Autenticación y RBAC
Aunque el módulo de login no está visualmente completo, la base técnica está operativa:
- **Aislamiento por BusinessId:** Implementado en todos los servicios de inventario.
- **Middleware de Autenticación:** Integrado en las rutas de productos.
- **Consumo de JWT:** El Dashboard ya gestiona el token para las peticiones al backend.

---
*Última actualización: Junio 2024*