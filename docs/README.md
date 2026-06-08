# GestoBar - Sistema de Gestión para Bares y Restaurantes (MVP)

GestoBar es un sistema de gestión integral diseñado para bares y restaurantes, enfocado en la eficiencia operativa. Esta versión MVP (Producto Mínimo Viable) cubre funcionalidades esenciales como la gestión de inventario, un dashboard de métricas clave y una base sólida para la autenticación de usuarios con multi-tenancy.

## Tecnologías Utilizadas

El proyecto GestoBar está construido con un stack moderno y eficiente:

*   **Backend:** Fastify (Framework web), Prisma (ORM), PostgreSQL (Base de datos), TypeScript.
*   **Frontend:** React (Librería UI), Tailwind CSS (Framework CSS), TypeScript.
*   **Gestión de paquetes:** pnpm (Monorepo).

## Estado del Proyecto

Basado en el documento de seguimiento `docs/estado_proyecto.md`, las siguientes funcionalidades han sido implementadas o tienen un avance significativo:

### Épica: Control de Menú e Inventario Básico

*   **HU08: Gestión de Productos del Menú (CRUD Backend):** La lógica de negocio y los endpoints para administrar el catálogo de productos, incluyendo la validación de datos y el aislamiento por comercio (`businessId`), están implementados.
*   **HU09: Descuento Automático de Stock:** La lógica para reducir existencias y validar la disponibilidad de productos está desarrollada en el servicio de productos.

### Épica: Reportes y Dashboard Simple

*   **HU14: Dashboard de Métricas Clave Diarias:** La interfaz de usuario del dashboard en el frontend (`frontend/src/pages/Dashboard.tsx`) está avanzada, mostrando KPIs, gráficos de ventas y tablas de productos más vendidos, lista para consumir datos del backend.

### Infraestructura y Multi-Tenancy (Base)

*   **HU01 & HU02: Autenticación y RBAC:** La base técnica para la autenticación y el control de acceso basado en roles está operativa, incluyendo el aislamiento por `businessId` en los servicios de inventario, un middleware de autenticación y el manejo de tokens JWT en el frontend.

## Configuración y Ejecución del Proyecto

Sigue estos pasos para poner en marcha el proyecto GestoBar en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/LeandroNallibAsis/SaaS_GestoBar.git
    cd SaaS_GestoBar
    ```

2.  **Instalar dependencias:**
    GestoBar utiliza `pnpm` para gestionar las dependencias del monorepo. Asegúrate de tener `pnpm` instalado globalmente (`npm install -g pnpm`).
    ```bash
    pnpm install
    ```

3.  **Configuración de la Base de Datos (PostgreSQL):**
    *   Asegúrate de tener una instancia de PostgreSQL en ejecución.
    *   Crea un archivo `.env` en la carpeta `backend/` con la cadena de conexión a tu base de datos. Ejemplo:
        ```
        DATABASE_URL="postgresql://user:password@localhost:5432/gestobar_db?schema=public"
        ```
    *   Ejecuta las migraciones de Prisma para crear el esquema de la base de datos:
        ```bash
        pnpm --workspace --filter backend prisma migrate dev --name init
        ```

4.  **Ejecutar el Backend:**
    ```bash
    pnpm dev:backend
    ```
    El servidor de Fastify se iniciará en `http://localhost:3000`.

5.  **Ejecutar el Frontend:**
    ```bash
    pnpm dev:frontend
    ```
    La aplicación React se iniciará en `http://localhost:5173` (o un puerto similar).

---
link a google drive del proyecto: https://drive.google.com/drive/folders/1tj34rwTHCi_T4z4ruS5XIXRmIHcRczZR?usp=sharing

*Última actualización: Junio 2026*
