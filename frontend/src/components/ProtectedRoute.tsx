/**
 * ============================================================
 * ProtectedRoute.tsx
 * ============================================================
 * Componente de guardia de autenticación para rutas protegidas.
 * Actúa como un "middleware" en el enrutamiento de React Router:
 *  - Verifica si existe un token JWT en localStorage.
 *  - Si NO hay token → redirige al usuario a la página de login.
 *  - Si SÍ hay token → permite el acceso renderizando las rutas hijas
 *    a través de <Outlet>.
 *
 * Se usa en App.tsx como ruta padre envolvente:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" ... />
 *     ...
 *   </Route>
 *
 * Nota: Este componente solo verifica la existencia del token,
 * no su validez. La validación real del JWT la realiza el backend
 * en cada petición API (middleware de autenticación en Fastify).
 *
 * Módulo: Componentes de seguridad / Autenticación (Frontend)
 * ============================================================
 */

import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente de ruta protegida.
 * Comprueba la presencia de un token JWT en el almacenamiento local
 * del navegador para decidir si el usuario puede acceder a las
 * páginas protegidas o debe ser redirigido al login.
 *
 * @returns <Navigate to="/login"> si no hay token, o <Outlet> para
 *          renderizar las rutas hijas protegidas.
 */
export default function ProtectedRoute() {
  // Intentar recuperar el token JWT del almacenamiento local del navegador
  const token = localStorage.getItem('jwt_token');

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitimos el acceso a las rutas hijas
  return <Outlet />;
}