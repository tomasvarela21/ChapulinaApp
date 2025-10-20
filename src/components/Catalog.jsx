import React, { useState } from 'react';
import { ShoppingCart, Clock, X } from 'lucide-react';

const Catalog = ({ products, categories, onAddSale }) => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleForm, setSaleForm] = useState({
    customer: '',
    size: '',
    quantity: 1,
    status: 'vendida' // 'vendida' o 'reservada'
  });

  const filteredProducts = products.filter(p => 
    categoryFilter === 'all' || p.category === categoryFilter
  );

  const handleOpenSaleModal = (product, status) => {
    setSelectedProduct(product);
    setSaleForm({
      customer: '',
      size: product.sizes[0]?.size || '',
      quantity: 1,
      status: status
    });
    setShowSaleModal(true);
  };

  const handleSubmitSale = () => {
    if (!saleForm.customer || !saleForm.size) {
      alert('Por favor completa todos los campos');
      return;
    }

    const sale = {
      customer: saleForm.customer,
      product: selectedProduct.name,
      size: saleForm.size,
      quantity: Number(saleForm.quantity),
      date: new Date().toISOString().split('T')[0],
      amount: selectedProduct.cashPrice * saleForm.quantity,
      status: saleForm.status
    };

    onAddSale(sale);
    setShowSaleModal(false);
    setSaleForm({ customer: '', size: '', quantity: 1, status: 'vendida' });
    setSelectedProduct(null);
    
    alert(`${saleForm.status === 'vendida' ? 'Venta' : 'Reserva'} registrada exitosamente!`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Catálogo
      </h2>
      
      <div className="flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{product.detail}</p>
              
              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-600">Talles disponibles:</p>
                <div className="flex gap-1 flex-wrap">
                  {product.sizes.map((sizeObj, idx) => (
                    sizeObj.quantity > 0 && (
                      <span key={idx} className="px-2 py-1 bg-secondary text-primary text-xs font-medium rounded">
                        {sizeObj.size} ({sizeObj.quantity})
                      </span>
                    )
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                {saleForm.status === 'vendida' ? 'Registrar Venta' : 'Registrar Reserva'}
              </h3>
              <button
                onClick={() => setShowSaleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-xl">
                <p className="text-sm font-semibold text-primary">{selectedProduct.name}</p>
                <p className="text-xs text-gray-600">{selectedProduct.detail}</p>
                <p className="text-lg font-bold text-primary mt-2">${selectedProduct.cashPrice}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <input
                  type="text"
                  value={saleForm.customer}
                  onChange={(e) => setSaleForm({...saleForm, customer: e.target.value})}
                  placeholder="Nombre del cliente"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Talle</label>
                <select
                  value={saleForm.size}
                  onChange={(e) => setSaleForm({...saleForm, size: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Seleccionar talle...</option>
                  {selectedProduct.sizes
                    .filter(s => s.quantity > 0)
                    .map((sizeObj, idx) => (
                      <option key={idx} value={sizeObj.size}>
                        {sizeObj.size} (Disponibles: {sizeObj.quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.sizes.find(s => s.size === saleForm.size)?.quantity || 1}
                  value={saleForm.quantity}
                  onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${(selectedProduct.cashPrice * saleForm.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmitSale}
                  className={`flex-1 text-white py-3 rounded-xl transition-colors font-medium ${
                    saleForm.status === 'vendida' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {saleForm.status === 'vendida' ? 'Confirmar Venta' : 'Confirmar Reserva'}
                </button>
                <button
                  onClick={() => setShowSaleModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
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