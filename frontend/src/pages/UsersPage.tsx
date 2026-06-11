import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

type UserRole = 'SuperAdmin' | 'BusinessOwner' | 'Employee';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// All configurable permissions shown as checkboxes.
const ALL_PERMISSIONS = [
  { key: 'orders:view', label: 'Ver Pedidos' },
  { key: 'orders:create', label: 'Crear Pedidos' },
  { key: 'orders:manage', label: 'Gestionar Pedidos (cambiar estado, cancelar)' },
  { key: 'tables:view', label: 'Ver Mesas' },
  { key: 'tables:manage', label: 'Gestionar Mesas (cambiar estado, CRUD)' },
  { key: 'inventory:view', label: 'Ver Menú/Productos' },
  { key: 'inventory:manage', label: 'Gestionar Menú/Productos' },
  { key: 'cash:view', label: 'Ver Caja' },
  { key: 'cash:manage', label: 'Gestionar Caja' },
  { key: 'reports:view', label: 'Ver Dashboard y Reportes' }
];

const ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: 'Super Admin',
  BusinessOwner: 'Propietario',
  Employee: 'Empleado'
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee' as UserRole
  });

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>('/users');
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenModal = (user?: User) => {
    setError('');
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Employee' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const method = editingUser ? 'PATCH' : 'POST';
    const path = editingUser ? `/users/${editingUser.id}` : '/users';
    const body: any = { name: formData.name, email: formData.email, role: formData.role };
    if (formData.password) body.password = formData.password;

    try {
      await apiFetch(path, { method, body: JSON.stringify(body) });
      setIsModalOpen(false);
      fetchUsers();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive })
      });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const openPermissionsModal = async (user: User) => {
    setPermissionsModalUser(user);
    try {
      const perms = await apiFetch<string[]>(`/users/${user.id}/permissions`);
      setUserPermissions(perms);
    } catch (e) {
      setUserPermissions([]);
    }
  };

  const togglePermission = (key: string) => {
    setUserPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const savePermissions = async () => {
    if (!permissionsModalUser) return;
    setSaving(true);
    try {
      await apiFetch(`/users/${permissionsModalUser.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissionKeys: userPermissions })
      });
      setPermissionsModalUser(null);
    } catch (e: any) {
      alert(e.message || 'Error al guardar permisos');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#2F3D46] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#A3B31A] mb-1">Usuarios</h1>
          <p className="text-gray-400">Gestiona los empleados y sus accesos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#A3B31A] hover:bg-[#8e9e16] text-[#2F3D46] font-bold py-2 px-6 rounded-xl transition"
        >
          + Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="text-[#A3B31A] animate-pulse">Cargando usuarios...</div>
      ) : (
        <div className="bg-[#3a4d59] rounded-2xl border border-[#4a5a67] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#2F3D46] text-gray-400 text-sm uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a5a67]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                    No hay usuarios creados.
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className={`hover:bg-[#4a5a67] transition ${!user.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'SuperAdmin' ? 'bg-purple-900 text-purple-300' :
                      user.role === 'BusinessOwner' ? 'bg-blue-900 text-blue-300' :
                      'bg-[#2F3D46] text-gray-300'
                    }`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {user.role === 'Employee' && (
                      <button onClick={() => openPermissionsModal(user)} className="text-blue-400 hover:text-blue-300 transition text-sm">
                        Permisos
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(user)} className="text-[#A3B31A] hover:text-[#c9d929] transition text-sm">
                      Editar
                    </button>
                    <button onClick={() => handleToggleActive(user)} className="text-gray-400 hover:text-white transition text-sm">
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="empleado@bar.com"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Contraseña segura'}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Rol</label>
                <select
                  className="w-full bg-[#2F3D46] border border-[#4a5a67] rounded-lg p-2.5 text-white focus:border-[#A3B31A] outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value="Employee">Empleado</option>
                  <option value="BusinessOwner">Propietario</option>
                </select>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition disabled:opacity-50">
                  {saving ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permissionsModalUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#3a4d59] border border-[#A3B31A]/40 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#A3B31A] mb-1">Permisos de acceso</h2>
            <p className="text-gray-400 text-sm mb-6">{permissionsModalUser.name}</p>
            <div className="space-y-2 mb-6">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#4a5a67] cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={userPermissions.includes(perm.key)}
                    onChange={() => togglePermission(perm.key)}
                    className="w-4 h-4 accent-[#A3B31A]"
                  />
                  <span className="text-sm text-gray-300">{perm.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-4 border-t border-[#4a5a67] pt-4">
              <button onClick={() => setPermissionsModalUser(null)} className="text-gray-400 hover:text-white transition">
                Cancelar
              </button>
              <button onClick={savePermissions} disabled={saving} className="bg-[#A3B31A] text-[#2F3D46] font-bold py-2 px-6 rounded-lg hover:bg-[#8e9e16] transition disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
