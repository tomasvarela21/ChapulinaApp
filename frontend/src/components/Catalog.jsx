import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, X, Loader2 } from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import saleService from '../services/saleService';
import toast from 'react-hot-toast';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleForm, setSaleForm] = useState({
    customer: '',
    phone: '',
    size: '',
    quantity: 1,
    priceType: 'contado',
    status: 'vendida',
    paymentMethod: 'efectivo',
    notes: ''
  });
  const [reservationErrors, setReservationErrors] = useState({
    customer: false,
    phone: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        setProducts(productsResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Error al cargar los datos del catálogo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredProducts = products.filter(p =>
    categoryFilter === 'all' || p.category === categoryFilter
  );

  const handleOpenSaleModal = (product, status) => {
    setSelectedProduct(product);
    const availableSizes = product.sizes.filter(s => s.quantity > 0);
    setSaleForm({
      customer: '',
      phone: '',
      size: availableSizes[0]?.size || '',
      quantity: 1,
      priceType: 'contado',
      status: status,
      paymentMethod: status === 'vendida' ? 'efectivo' : 'none',
      notes: ''
    });
    setReservationErrors({ customer: false, phone: false });
    setShowSaleModal(true);
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const price = saleForm.priceType === 'contado'
      ? selectedProduct.cashPrice
      : selectedProduct.listPrice;
    return price * saleForm.quantity;
  };

  const handleCloseSaleModal = () => {
    setShowSaleModal(false);
    setReservationErrors({ customer: false, phone: false });
  };

  const handleSubmitSale = async () => {
    if (!saleForm.size) {
      toast.error('Por favor selecciona un talle');
      return;
    }

    // Validar campos obligatorios para reservas
    if (saleForm.status === 'reservada') {
      const missingCustomer = !saleForm.customer.trim();
      const missingPhone = !saleForm.phone.trim();
      setReservationErrors({
        customer: missingCustomer,
        phone: missingPhone
      });
      if (missingCustomer || missingPhone) {
        toast.error('Nombre y teléfono son obligatorios para reservas');
        return;
      }
    }

    const loadingToast = toast.loading('Procesando...');

    try {
      const saleData = {
        customer: saleForm.customer,
        phone: saleForm.phone,
        product: selectedProduct._id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        size: saleForm.size,
        quantity: Number(saleForm.quantity),
        priceType: saleForm.priceType,
        amount: calculateTotal(),
        status: saleForm.status,
        paymentMethod: saleForm.status === 'vendida' ? saleForm.paymentMethod : 'none',
        notes: saleForm.notes
      };

      await saleService.create(saleData);

      setShowSaleModal(false);
      setSaleForm({
        customer: '',
        phone: '',
        size: '',
        quantity: 1,
        priceType: 'contado',
        status: 'vendida',
        paymentMethod: 'efectivo',
        notes: ''
      });
      setReservationErrors({ customer: false, phone: false });
      setSelectedProduct(null);

      toast.success(
        `${saleForm.status === 'vendida' ? 'Venta' : 'Reserva'} registrada exitosamente`,
        { id: loadingToast }
      );

      // Refresh products to update stock
      const productsResponse = await productService.getAll();
      setProducts(productsResponse.data || []);
    } catch (err) {
      console.error('Error creating sale:', err);
      toast.error(
        err.response?.data?.message || 'Error al registrar la venta',
        { id: loadingToast }
      );
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Catálogo
      </h2>

      <div className="flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 md:px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm md:text-base"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{product.detail}</p>

              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-600">Talles disponibles:</p>
                <div className="flex gap-1 flex-wrap">
                  {product.sizes.filter(s => s.quantity > 0).map((sizeObj, idx) => (
                    <span key={idx} className="px-2 py-1 bg-secondary text-primary text-xs font-medium rounded">
                      {sizeObj.size} ({sizeObj.quantity})
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Contado:</span>
                  <span className="text-lg font-bold text-primary">${product.cashPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Lista:</span>
                  <span className="text-sm text-gray-600">${product.listPrice}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenSaleModal(product, 'vendida')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Vender
                </button>
                <button
                  onClick={() => handleOpenSaleModal(product, 'reservada')}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Venta/Reserva */}
      {showSaleModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSaleModal();
            }
          }}
        >
          <div
            className="bg-white rounded-2xl p-4 md:p-6 max-w-lg w-full my-4 max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                {saleForm.status === 'vendida' ? 'Registrar Venta' : 'Registrar Reserva'}
              </h3>
              <button
                onClick={handleCloseSaleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {/* Información del producto */}
              <div className="bg-secondary p-3 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-primary">{selectedProduct.name}</p>
                <p className="text-xs text-gray-600">{selectedProduct.detail}</p>
              </div>

              {/* Cliente y Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={saleForm.customer}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSaleForm({ ...saleForm, customer: value });
                      if (reservationErrors.customer) {
                        setReservationErrors(prev => ({ ...prev, customer: !value.trim() }));
                      }
                    }}
                    placeholder={saleForm.status === 'reservada' ? 'Nombre (obligatorio)' : 'Nombre (opcional)'}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none ${
                      reservationErrors.customer && saleForm.status === 'reservada'
                        ? 'border border-red-400 focus:border-red-500 bg-red-50'
                        : 'border border-gray-200 focus:border-primary'
                    }`}
                    onBlur={() => {
                      if (saleForm.status === 'reservada') {
                        setReservationErrors(prev => ({ ...prev, customer: !saleForm.customer.trim() }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={saleForm.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSaleForm({ ...saleForm, phone: value });
                      if (reservationErrors.phone) {
                        setReservationErrors(prev => ({ ...prev, phone: !value.trim() }));
                      }
                    }}
                    placeholder={saleForm.status === 'reservada' ? 'Teléfono (obligatorio)' : 'Teléfono (opcional)'}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none ${
                      reservationErrors.phone && saleForm.status === 'reservada'
                        ? 'border border-red-400 focus:border-red-500 bg-red-50'
                        : 'border border-gray-200 focus:border-primary'
                    }`}
                    onBlur={() => {
                      if (saleForm.status === 'reservada') {
                        setReservationErrors(prev => ({ ...prev, phone: !saleForm.phone.trim() }));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Tipo de Precio */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Precio</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ borderColor: saleForm.priceType === 'contado' ? '#D4AF37' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="priceType"
                      value="contado"
                      checked={saleForm.priceType === 'contado'}
                      onChange={(e) => setSaleForm({...saleForm, priceType: e.target.value})}
                      className="text-primary"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium">Contado</span>
                      <p className="text-base font-bold text-primary">${selectedProduct.cashPrice}</p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ borderColor: saleForm.priceType === 'lista' ? '#D4AF37' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="priceType"
                      value="lista"
                      checked={saleForm.priceType === 'lista'}
                      onChange={(e) => {
                        // Si selecciona lista y está en modo venta, sugerir tarjeta
                        if (saleForm.status === 'vendida' && saleForm.paymentMethod !== 'tarjeta') {
                          setSaleForm({...saleForm, priceType: e.target.value, paymentMethod: 'tarjeta'});
                        } else {
                          setSaleForm({...saleForm, priceType: e.target.value});
                        }
                      }}
                      className="text-primary"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium">Lista</span>
                      <p className="text-base font-bold text-gray-700">${selectedProduct.listPrice}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Talle y Cantidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Talle</label>
                  <select
                    value={saleForm.size}
                    onChange={(e) => setSaleForm({...saleForm, size: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {selectedProduct.sizes
                      .filter(s => s.quantity > 0)
                      .map((sizeObj, idx) => (
                        <option key={idx} value={sizeObj.size}>
                          {sizeObj.size} ({sizeObj.quantity})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.sizes.find(s => s.size === saleForm.size)?.quantity || 1}
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ borderColor: saleForm.status === 'vendida' ? '#16a34a' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="status"
                      value="vendida"
                      checked={saleForm.status === 'vendida'}
                      onChange={(e) => {
                        setSaleForm({...saleForm, status: e.target.value, paymentMethod: 'efectivo'});
                        setReservationErrors({ customer: false, phone: false });
                      }}
                    />
                    <span className="text-xs font-medium">Vendida</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ borderColor: saleForm.status === 'reservada' ? '#eab308' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="status"
                      value="reservada"
                      checked={saleForm.status === 'reservada'}
                      onChange={(e) => {
                        setSaleForm({...saleForm, status: e.target.value, paymentMethod: 'none'});
                        setReservationErrors({ customer: false, phone: false });
                      }}
                    />
                    <span className="text-xs font-medium">Reservada</span>
                  </label>
                </div>
              </div>

              {/* Método de Pago (solo si es venta) */}
              {saleForm.status === 'vendida' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) => {
                      const newPaymentMethod = e.target.value;
                      // Si selecciona tarjeta, cambiar automáticamente a precio lista
                      if (newPaymentMethod === 'tarjeta') {
                        setSaleForm({...saleForm, paymentMethod: newPaymentMethod, priceType: 'lista'});
                      } else {
                        setSaleForm({...saleForm, paymentMethod: newPaymentMethod});
                      }
                    }}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta (Precio Lista)</option>
                  </select>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas adicionales</label>
                <textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                  placeholder="Notas opcionales..."
                  rows="2"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Monto Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmitSale}
                  className={`flex-1 text-white py-2 rounded-lg transition-colors font-medium text-sm ${
                    saleForm.status === 'vendida'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {saleForm.status === 'vendida' ? 'Confirmar Venta' : 'Confirmar Reserva'}
                </button>
                <button
                  onClick={handleCloseSaleModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
