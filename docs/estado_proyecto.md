# Estado Actual del Proyecto - GestoBar MVP

Este documento resume las funcionalidades implementadas hasta el momento en el proyecto **GestoBar**, organizadas por módulos, bases de datos y la interfaz de usuario.

---

## 1. Infraestructura Base, Multi-Tenancy y Seguridad

### Autenticación y RBAC (Control de Acceso Basado en Roles)
Base técnica operativa y UI de acceso implementada para asegurar los datos de cada negocio.
- **Aislamiento por BusinessId:** Todos los registros en la base de datos pertenecen a un comercio específico (`businessId`), garantizando que un negocio no pueda ver ni modificar los datos de otro.
- **Roles de Usuario (`UserRole`):** `SuperAdmin` (administración global), `BusinessOwner` (dueño del local con control total) y `Employee` (empleado con permisos específicos).
- **Gestión de Permisos Dinámicos:** El dueño del negocio puede otorgar o revocar permisos específicos (ej. `orders:create`, `cash:view`) de forma individual para cada empleado desde la interfaz.
- **Rutas de Auth (Backend):** `backend/src/modules/auth/auth.routes.ts`
- **Página de Login (Frontend):** `frontend/src/pages/Login.tsx`
- **Control de Rutas:** `frontend/src/components/ProtectedRoute.tsx` y `App.tsx` (redirigen según el token JWT y los permisos).

### Base de Datos y Persistencia
- **Esquema de Prisma:** `backend/prisma/schema.prisma` (Define todos los modelos y relaciones en PostgreSQL).
- **Script de Semillero (Seed):** `backend/prisma/seed.ts` (Inicializa roles, categorías iniciales, un negocio de prueba y el usuario administrador `admin@gestobar.com`).

---

## 2. Gestión de Salón y Mesas

### Mesas y Distribución del Salón
- **Modelo de Mesas (`Table`):** Define el estado de las mesas (`FREE`, `OCCUPIED`, `RESERVED`, `PENDING_PAYMENT`).
- **Unión de Mesas (Table Linking):** Permite vincular mesas dinámicamente (`linkedTableId`) para juntar mesas en el salón cuando hay grupos grandes.
- **Interfaz del Salón:** `frontend/src/pages/TableManagement.tsx` (Permite ver el estado en tiempo real, crear mesas y unirlas/separarlas).
- **Diseño del Salón (SalonLayout):** Estructura en base de datos para almacenar el mapa o layout interactivo del salón (`SalonLayout` y `Area`).

---

## 3. Inventario y Menú Comercial (Separados)

Anteriormente los productos y el inventario estaban unificados, lo cual era poco realista. Ahora se han separado en dos conceptos:
- **Inventario (`InventoryItem`):** Materia prima o stock físico medible (ej. Kg de carne, litros de cerveza, unidades de panes).
- **Menú (`MenuItem`):** Platos, bebidas y productos que se ofrecen al cliente final con un precio de venta (ej. "Lomo Completo", "Pinta de IPA").
- **Categorías (`Category`):** Se separan por tipo `"MENU"` e `"INVENTORY"` para organizar correctamente ambos listados.
- **Vistas del Frontend:**
  - `frontend/src/pages/InventoryPage.tsx` (Control de stock, costo de adquisición y unidad de medida).
  - `frontend/src/pages/MenuPage.tsx` (Gestión de platos expuestos a la venta y sus precios).
- **Rutas y Servicios:** Ubicados bajo `backend/src/modules/inventory/`.

---

## 4. Toma de Pedidos y Comandas

### Gestión de Pedidos (`Order` y `OrderItem`)
Lógica completa para registrar el consumo del salón o pedidos para llevar/delivery.
- **Tipos de Pedido:** `TABLE` (mesa), `TAKEAWAY` (para llevar), `DELIVERY` (con dirección de entrega).
- **Estados del Pedido:** `OPEN`, `PREPARING`, `READY`, `DELIVERED`, `PAID`, `CANCELLED`.
- **Integración con Menú:** Los pedidos se arman seleccionando elementos del **Menú** (`MenuItem`) y registrando cantidad, precio histórico y notas de preparación.
- **Página de Pedidos:** `frontend/src/pages/OrdersPage.tsx` (Permite crear comandas, asociarlas a una mesa o mozo, cambiar su estado en tiempo real y facturarlas).

---

## 5. Módulo Financiero: Libro de Caja

### Control de Caja Diaria (`CashEntry`)
Registro detallado de todo el flujo monetario del negocio.
- **Tipos de Movimiento:** `OPENING` (Apertura de caja), `CLOSING` (Cierre), `SALE` (Ventas automáticas al cobrar pedidos), `EXPENSE` (Gastos/salidas de dinero), `ADJUSTMENT` (Ajustes manuales).
- **Página de Caja:** `frontend/src/pages/CashBookPage.tsx` (Muestra el saldo actual de caja, el historial de movimientos diarios y permite registrar ingresos y egresos manuales).

---

## 6. Reportes e Información Visual

### Dashboard de Métricas
- **Indicadores Clave:** Total de ventas del día, cantidad de pedidos activos, ocupación de mesas en tiempo real y flujo de caja resumido.
- **Página Principal:** `frontend/src/pages/Dashboard.tsx`
- **Endpoints del Dashboard:** `backend/src/modules/dashboard/`

---
*Última actualización: Junio 2026*