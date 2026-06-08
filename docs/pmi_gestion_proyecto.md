# Plan de Gestión del Proyecto: GestoBar (Estándar PMI)

Este documento define la estructura de gestión del proyecto GestoBar MVP, siguiendo los lineamientos del Project Management Institute (PMI).

## 1. Inicio (Acta de Constitución)
- **Objetivo Principal:** Desarrollar un SaaS Multi-tenant para la gestión operativa de bares y restaurantes.
- **Stakeholders:** Propietarios de negocios (clientes), Mozos/Cocineros (usuarios finales), Administrador del Sistema.
- **Criterio de Éxito:** Entrega de un MVP funcional que permita la gestión de inventario, toma de pedidos y cierre de caja en menos de 3 meses.

## 2. Planificación
- **EDT (Estructura de Desglose de Trabajo):**
    1. **Infraestructura:** Configuración de Backend (Fastify), Frontend (React) y Base de Datos (PostgreSQL/Prisma).
    2. **Módulo de Inventario:** CRUD de productos, categorías y gestión de stock.
    3. **Módulo de Salón:** Mapa visual de mesas y estados en tiempo real.
    4. **Ventas y POS:** Creación de comandas, pagos y facturación.
    5. **Dashboard:** Métricas de rendimiento y KPIs diarios.
- **Gestión de Riesgos:** 
    - Inconsistencia de datos entre locales (Mitigación: Multi-tenancy estricto por `businessId`).
    - Errores en stock crítico (Mitigación: Validaciones ACID en transacciones de pedidos).

## 3. Ejecución
- **Repositorio Central:** GitHub SaaS_GestoBar
- **Metodología:** Desarrollo incremental (Ágil).
- **Documentación:** Centralizada en Google Drive y carpeta `/docs` del repositorio.

## 4. Monitoreo y Control
- **Seguimiento de Historias de Usuario:** Revisión semanal de HU completadas vs. pendientes.
- **Calidad:** Pruebas de validación de esquemas (Zod) y tipos (TypeScript) antes de cada commit.
- **Control de Alcance:** No se añadirán funcionalidades de "Fase 2" (ej. integraciones de delivery externo) hasta completar el MVP.

## 5. Cierre
- **Entregables Finales:** Código fuente documentado, Base de datos migrada, Guía de instalación rápida.
- **Evaluación:** Comparación de resultados contra el Documento Maestro original.

---

### Organización del Google Drive (Sugerida)
1. `01_Gestion_PMI/` -> Actas, cronogramas y este documento.
2. `02_Requerimientos/` -> Documento Maestro e Historias de Usuario.
3. `03_Diseño/` -> Paleta de colores, logos y mockups.
4. `04_Tecnico/` -> Documentación de API y diagramas de base de datos.

---
*Última actualización: Junio 2026*