# Estado Actual del Proyecto - GestoBar MVP

Este documento resume las funcionalidades implementadas hasta el momento, organizadas por Historias de Usuario (HU) y sus respectivos archivos.

## 1. Infraestructura y Multi-Tenancy (Base)

### HU01 & HU02: Autenticación y RBAC
Base técnica operativa para el aislamiento de datos y control de acceso.
- **Aislamiento por BusinessId:** Implementado en todos los servicios (Inventory, Dashboard).
- **Endpoints de Auth:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\auth\auth.routes.ts` (Login y gestión de permisos).
- **Consumo de JWT:** El frontend ya incluye el token en las cabeceras de las peticiones.

### Base de Datos y Seed
Estructura relacional completa y generador de datos de prueba.
- **Esquema Prisma:** `c:\Users\IK\Desktop\GestoBar\backend\prisma\schema.prisma` (Modelos para Business, User, Table, Product, Order, CashEntry).
- **Script de Seed:** `c:\Users\IK\Desktop\GestoBar\backend\prisma\seed.ts` (Carga inicial de comercio, admin, categorías, productos y mesas).

## 2. Épica: Gestión de Salón y Pedidos (Backend)

### HU11: Configuración de Mesas
Estructura preparada para la distribución del salón.
- **Modelo Table:** Incluye campos de `capacity` y `status` (FREE, OCCUPIED, PENDING_PAYMENT).

### HU04: Estructura de Comandas
Base para el registro de pedidos vinculada a mozos.
- **Relaciones:** Se añadió vinculación entre `Order` y `User` para auditoría de mozos.

## 3. Épica: Control de Menú e Inventario Básico

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

## 4. Épica: Reportes y Dashboard Simple

### HU14: Dashboard de Métricas Clave Diarias
Implementación completa de punta a punta (Backend + Frontend).
- **Vista Principal:** `c:\Users\IK\Desktop\GestoBar\frontend\src\pages\Dashboard.tsx`
- **Lógica Backend:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\dashboard\dashboard.service.ts`
- **Endpoints API:** `c:\Users\IK\Desktop\GestoBar\backend\src\modules\dashboard\dashboard.routes.ts`

---
*Última actualización: Junio 2026*