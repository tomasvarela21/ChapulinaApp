import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Eye, Edit2, Check, X, Package } from 'lucide-react';
import saleService from '../services/saleService';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [saleToComplete, setSaleToComplete] = useState(null);
  const [productForCompletion, setProductForCompletion] = useState(null);
  const [previewAmount, setPreviewAmount] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await saleService.getAll();
      setSales(response.data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar venta/reserva?',
      message: 'Esta acción no se puede deshacer. ¿Estás segura de que deseas eliminar este registro?',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Eliminando...');
        try {
          await saleService.delete(id);
          setSales(sales.filter(s => s._id !== id));
          toast.success('Venta eliminada exitosamente', { id: loadingToast });
        } catch (err) {
          console.error('Error deleting sale:', err);
          toast.error('Error al eliminar la venta', { id: loadingToast });
        }
      }
    });
  };

  const handleMarkAsCompleted = async (sale) => {
    try {
      // Extraer el ID del producto (puede ser un objeto o un string)
      const productId = typeof sale.product === 'object' ? sale.product._id : sale.product;

      // Obtener el producto para mostrar los precios
      const productResponse = await productService.getById(productId);
      const product = productResponse.data;

      setProductForCompletion(product);
      setSaleToComplete(sale);
      setPaymentMethod('efectivo');

      // Calcular precio inicial (efectivo/contado)
      const initialAmount = product.cashPrice * sale.quantity;
      setPreviewAmount(initialAmount);

      setShowPaymentModal(true);
    } catch (err) {
      console.error('Error loading product:', err);
      toast.error('Error al cargar información del producto');
    }
  };

  // Actualizar precio en tiempo real cuando cambia el método de pago
  useEffect(() => {
    if (productForCompletion && saleToComplete) {
      let newAmount;
      if (paymentMethod === 'tarjeta') {
        newAmount = productForCompletion.listPrice * saleToComplete.quantity;
      } else {
        newAmount = productForCompletion.cashPrice * saleToComplete.quantity;
      }
      setPreviewAmount(newAmount);
    }
  }, [paymentMethod, productForCompletion, saleToComplete]);

  const confirmCompleteReservation = async () => {
    if (!saleToComplete || !productForCompletion) return;

    const loadingToast = toast.loading('Completando reserva...');
    try {
      // Usar el precio ya calculado en previewAmount
      const newPriceType = paymentMethod === 'tarjeta' ? 'lista' : 'contado';

      // Actualizar a vendida con el nuevo precio y método de pago
      const response = await saleService.update(saleToComplete._id, {
        status: 'vendida',
        paymentMethod: paymentMethod,
        amount: previewAmount,
        priceType: newPriceType
      });

      setSales(sales.map(s => s._id === saleToComplete._id ? response.data : s));
      setShowPaymentModal(false);
      setSaleToComplete(null);
      setProductForCompletion(null);
      toast.success('Reserva completada y registrada como venta exitosamente', { id: loadingToast });
    } catch (err) {
      console.error('Error completing reservation:', err);
      toast.error(err.response?.data?.message || 'Error al completar la reserva', { id: loadingToast });
    }
  };

  const handleCancelReservation = (sale) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancelar reserva',
      message: '¿Cancelar esta reserva? El stock será devuelto automáticamente al inventario.',
      type: 'warning',
      onConfirm: async () => {
        const loadingToast = toast.loading('Cancelando...');
        try {
          const response = await saleService.update(sale._id, { status: 'cancelada' });
          setSales(sales.map(s => s._id === sale._id ? response.data : s));
          toast.success('Reserva cancelada exitosamente. Stock restaurado.', { id: loadingToast });
        } catch (err) {
          console.error('Error canceling reservation:', err);
          toast.error('Error al cancelar la reserva', { id: loadingToast });
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      vendida: 'bg-green-100 text-green-700',
      reservada: 'bg-yellow-100 text-yellow-700',
      retirada: 'bg-blue-100 text-blue-700',
      cancelada: 'bg-red-100 text-red-700'
    };
    const icons = {
      vendida: '🟢',
      reservada: '🟡',
      retirada: '🔵',
      cancelada: '🔴'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      none: '-'
    };
    return labels[method] || method;
  };

  const filterSalesByDate = (sale) => {
    if (dateFilter === 'all') return true;

    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return saleDate >= today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return saleDate >= monthAgo;
    }
    return true;
  };

  // Separar reservas pendientes del historial
  // RESERVAS PENDIENTES: Visibles para todos los roles
  const pendingReservations = sales
    .filter(sale => sale.status === 'reservada')
    .filter(sale => statusFilter === 'all' || sale.status === statusFilter)
    .filter(filterSalesByDate);

  // HISTORIAL: Filtrado por usuario (admin ve todo, vendedores solo sus ventas)
  const salesHistory = sales
    .filter(sale => sale.status !== 'reservada')
    .filter(sale => statusFilter === 'all' || sale.status === statusFilter)
    .filter(filterSalesByDate)
    .filter(sale => user.role === 'admin' || sale.soldBy?._id === user._id);

  // Componente de tabla reutilizable
  const SalesTable = ({ sales: salesData, title, emptyMessage }) => (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Prenda</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Categoría</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Talle</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Cant.</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Fecha</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Monto</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salesData.map(sale => (
              <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{sale.customer || '-'}</div>
                  <div className="text-xs text-gray-500 md:hidden truncate max-w-[140px]">{sale.productName || sale.product?.name}</div>
                </td>
                <td className="px-3 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-900 truncate block max-w-[160px]">{sale.productName || sale.product?.name}</span>
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <span className="px-2 py-1 text-xs font-medium bg-secondary text-primary rounded">
                    {sale.category}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                    {sale.size}
                  </span>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell">
                  <span className="text-sm font-medium text-gray-700">{sale.quantity}</span>
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <span className="text-xs text-gray-600">
                    {new Date(sale.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-sm font-bold text-primary">${sale.amount?.toLocaleString()}</span>
                </td>
                <td className="px-3 py-3">
                  {getStatusBadge(sale.status)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {sale.status === 'reservada' && (
                      <>
                        <button
                          onClick={() => handleMarkAsCompleted(sale)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Marcar como retirada"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelReservation(sale)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Cancelar reserva"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteSale(sale._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {salesData.length === 0 && (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Ventas y Reservas
        </h2>
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 md:px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="all">Todos los estados</option>
            <option value="vendida">Vendidas</option>
            <option value="reservada">Reservadas</option>
            <option value="retirada">Retiradas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 md:px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Reservas pendientes */}
      <SalesTable
        sales={pendingReservations}
        title="Reservas Pendientes"
        emptyMessage="No hay reservas pendientes"
      />

      {/* Historial (ventas, retiradas, canceladas) */}
      <SalesTable
        sales={salesHistory}
        title="Historial de Ventas"
        emptyMessage="No se encontraron ventas en el historial"
      />

      {/* Modal de detalles */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-lg w-full my-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Detalles de la {selectedSale.status === 'vendida' || selectedSale.status === 'retirada' ? 'Venta' : 'Reserva'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSale(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedSale.customer || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Teléfono</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedSale.phone || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Producto</p>
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-sm font-semibold text-primary">{selectedSale.productName}</p>
                  <p className="text-xs text-gray-600">Categoría: {selectedSale.category}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-xs"><strong>Talle:</strong> {selectedSale.size}</span>
                    <span className="text-xs"><strong>Cantidad:</strong> {selectedSale.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Tipo de Precio</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedSale.priceType}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Monto Total</p>
                  <p className="text-lg font-bold text-primary">${selectedSale.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Método de Pago</p>
                  <p className="text-sm font-semibold text-gray-900">{getPaymentMethodLabel(selectedSale.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Estado</p>
                  {getStatusBadge(selectedSale.status)}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500">Fecha</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedSale.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedSale.notes && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notas</p>
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">{selectedSale.notes}</p>
                </div>
              )}

              {user.role === 'admin' && selectedSale.soldBy && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-500">Vendido por</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedSale.soldBy.name}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSale(null);
                  }}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && saleToComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full my-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Completar Reserva
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSaleToComplete(null);
                  setProductForCompletion(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-sm font-semibold text-primary">{saleToComplete.productName}</p>
                <p className="text-xs text-gray-600">Cliente: {saleToComplete.customer}</p>
                <p className="text-xs text-gray-600 mt-1">Talle: {saleToComplete.size} | Cantidad: {saleToComplete.quantity}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              {/* Vista previa del precio actualizado */}
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Reserva</p>
                    <p className="text-base text-gray-500 line-through">${saleToComplete.amount?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary uppercase">Final</p>
                    <p className="text-xl font-bold text-primary">${previewAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 capitalize mt-0.5">
                      {paymentMethod === 'tarjeta' ? 'Lista' : 'Contado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Al confirmar, esta reserva se marcará como venta completada con el precio actualizado.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmCompleteReservation}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Confirmar Retiro
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSaleToComplete(null);
                    setProductForCompletion(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
              </div>
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

export default Sales;
