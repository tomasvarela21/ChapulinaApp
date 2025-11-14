import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye, Loader2, Plus, X, DollarSign, Users, TrendingUp } from 'lucide-react';
import userService from '../services/userService';
import settingsService from '../services/settingsService';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const Settings = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [salesStats, setSalesStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceMarkup, setPriceMarkup] = useState(30);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, settingsResponse, statsResponse] = await Promise.all([
        userService.getAll(),
        settingsService.get(),
        userService.getAllSalesStats()
      ]);

      setUsers(usersResponse.data || []);
      setPriceMarkup(settingsResponse.data?.priceMarkup || 30);
      setSalesStats(statsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePriceMarkup = async () => {
    const loadingToast = toast.loading('Guardando configuración y actualizando precios...');
    try {
      // Guardar la configuración
      await settingsService.update({ priceMarkup });

      // Actualizar todos los precios lista de los productos
      const updateResponse = await productService.updateAllListPrices(priceMarkup);

      toast.success(
        `Configuración guardada. ${updateResponse.message || 'Precios actualizados'}`,
        { id: loadingToast, duration: 4000 }
      );
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Error al guardar la configuración', { id: loadingToast });
    }
  };

  const handleOpenUserModal = (userToEdit = null) => {
    if (userToEdit) {
      setIsEditing(true);
      setSelectedUser(userToEdit);
      setUserForm({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'vendedor'
      });
    }
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'vendedor'
    });
    setIsEditing(false);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    if (!isEditing && !userForm.password) {
      toast.error('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Actualizando vendedor...' : 'Creando vendedor...');

    try {
      const userData = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role
      };

      // Solo incluir password si se proporcionó
      if (userForm.password) {
        userData.password = userForm.password;
      }

      if (isEditing) {
        const response = await userService.update(selectedUser._id, userData);
        setUsers(users.map(u => u._id === selectedUser._id ? response.data : u));
        toast.success('Vendedor actualizado exitosamente', { id: loadingToast });
      } else {
        const response = await userService.create(userData);
        setUsers([...users, response.data]);
        toast.success('Vendedor creado exitosamente', { id: loadingToast });
      }

      handleCloseUserModal();
      fetchData(); // Recargar estadísticas
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.message || 'Error al guardar el vendedor', { id: loadingToast });
    }
  };

  const handleDeleteUser = (userToDelete) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar vendedor?',
      message: `¿Estás segura de que deseas eliminar a ${userToDelete.name}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Eliminando vendedor...');
        try {
          await userService.delete(userToDelete._id);
          setUsers(users.filter(u => u._id !== userToDelete._id));
          setSalesStats(salesStats.filter(s => s.user._id !== userToDelete._id));
          toast.success('Vendedor eliminado exitosamente', { id: loadingToast });
        } catch (err) {
          console.error('Error deleting user:', err);
          toast.error(err.response?.data?.message || 'Error al eliminar el vendedor', { id: loadingToast });
        }
      }
    });
  };

  const handleViewUserStats = async (userId) => {
    const loadingToast = toast.loading('Cargando estadísticas...');
    try {
      const response = await userService.getSalesStats(userId);
      setSelectedUserStats(response.data);
      setShowStatsModal(true);
      toast.dismiss(loadingToast);
    } catch (err) {
      console.error('Error loading stats:', err);
      toast.error('Error al cargar las estadísticas', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
        No tienes permisos para acceder a esta sección.
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Configuración
      </h2>

      {/* Configuración de Precios */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Configuración de Precios con Tarjeta</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje de Recargo: {priceMarkup}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={priceMarkup}
              onChange={(e) => setPriceMarkup(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <p className="text-sm text-gray-500">
            Este porcentaje se aplicará sobre el precio de contado para calcular el precio de lista cuando se paga con tarjeta.
          </p>
          <button
            onClick={handleSavePriceMarkup}
            className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Gestión de Vendedores */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Gestión de Vendedores</h3>
          </div>
          <button
            onClick={() => handleOpenUserModal()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span> Vendedor
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Estado</th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(usr => (
                <tr key={usr._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm font-medium text-gray-900">{usr.name}</span>
                  </td>
                  <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-xs md:text-sm text-gray-600">{usr.email}</span>
                  </td>
                  <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                    <span className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                      usr.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {usr.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap hidden md:table-cell">
                    <span className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                      usr.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {usr.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUserStats(usr._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver estadísticas"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenUserModal(usr)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usr)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay vendedores registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas de Ventas por Vendedor */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Estadísticas de Ventas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {salesStats.map(stat => (
            <div key={stat.user._id} className="bg-secondary border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{stat.user.name}</h4>
                <button
                  onClick={() => handleViewUserStats(stat.user._id)}
                  className="text-primary hover:text-primary/80"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Ventas:</span>
                  <span className="font-semibold text-gray-900">{stat.totalSales}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ingresos Total:</span>
                  <span className="font-semibold text-primary">${stat.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mes Actual:</span>
                    <span className="font-semibold text-gray-900">{stat.monthlySales} ventas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ingresos Mes:</span>
                    <span className="font-semibold text-primary">${stat.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {salesStats.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No hay estadísticas disponibles
            </div>
          )}
        </div>
      </div>

      {/* Modal de Usuario (Crear/Editar) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                {isEditing ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h3>
              <button
                onClick={handleCloseUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {isEditing && '(dejar en blanco para no cambiar)'}
                  {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseUserModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas Detalladas */}
      {showStatsModal && selectedUserStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Estadísticas de {selectedUserStats.user.name}
              </h3>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedUserStats(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Resumen General */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Resumen General</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedUserStats.stats.totalSales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-primary">${selectedUserStats.stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Ventas por Método de Pago */}
              <div className="bg-secondary border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Ingresos por Método de Pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efectivo</span>
                    <span className="font-semibold text-gray-900">
                      ${selectedUserStats.stats.salesByPaymentMethod.efectivo.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tarjeta</span>
                    <span className="font-semibold text-gray-900">
                      ${selectedUserStats.stats.salesByPaymentMethod.tarjeta.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transferencia</span>
                    <span className="font-semibold text-gray-900">
                      ${selectedUserStats.stats.salesByPaymentMethod.transferencia.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Mes */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Mes Actual</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ventas del Mes</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUserStats.stats.monthly.sales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ingresos del Mes</p>
                    <p className="text-xl font-bold text-primary">${selectedUserStats.stats.monthly.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Día */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Hoy</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ventas de Hoy</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUserStats.stats.daily.sales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ingresos de Hoy</p>
                    <p className="text-xl font-bold text-primary">${selectedUserStats.stats.daily.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedUserStats(null);
                }}
                className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default Settings;
