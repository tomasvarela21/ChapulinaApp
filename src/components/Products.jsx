import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';

const Products = ({ products, setProducts, categories, user, priceMarkup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [showCostPrice, setShowCostPrice] = useState(true);

  const initialProductForm = {
    name: '',
    category: '',
    detail: '',
    sizes: [{ size: 'S', quantity: 0 }, { size: 'M', quantity: 0 }, { size: 'L', quantity: 0 }, { size: 'XL', quantity: 0 }],
    costPrice: '',
    cashPrice: '',
    image: ''
  };

  const [productForm, setProductForm] = useState(initialProductForm);

  const calculateListPrice = (cashPrice) => {
    return Math.round(Number(cashPrice) * (1 + priceMarkup / 100));
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.category) return;
    
    const totalQuantity = productForm.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    
    const newProduct = {
      id: Date.now(),
      ...productForm,
      quantity: totalQuantity,
      listPrice: calculateListPrice(productForm.cashPrice),
      image: productForm.image || 'https://via.placeholder.com/100'
    };
    
    setProducts([...products, newProduct]);
    setProductForm(initialProductForm);
    setShowAddModal(false);
  };

  const handleUpdateProduct = () => {
    if (!productForm.name || !productForm.category) return;
    
    const totalQuantity = productForm.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    
    setProducts(products.map(p => 
      p.id === editingProduct.id 
        ? { 
            ...productForm, 
            id: editingProduct.id,
            quantity: totalQuantity,
            listPrice: calculateListPrice(productForm.cashPrice)
          }
        : p
    ));
    setProductForm(initialProductForm);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás segura de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleEditMode = (productId) => {
    setEditMode(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const confirmEdit = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const totalQuantity = product.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, quantity: totalQuantity, listPrice: calculateListPrice(p.cashPrice) }
          : p
      ));
      setEditMode(prev => ({
        ...prev,
        [productId]: false
      }));
    }
  };

  const updateProductField = (productId, field, value) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, [field]: value }
        : p
    ));
  };

  const updateProductSize = (productId, sizeIndex, quantity) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newSizes = [...p.sizes];
        newSizes[sizeIndex] = { ...newSizes[sizeIndex], quantity: Number(quantity || 0) };
        return { ...p, sizes: newSizes };
      }
      return p;
    }));
  };

  const filteredProducts = products
    .filter(p => 
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.detail.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.cashPrice - b.cashPrice;
      if (sortBy === 'quantity') return a.quantity - b.quantity;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Gestión de Productos
        </h2>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <button
              onClick={() => setShowCostPrice(!showCostPrice)}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors"
              title={showCostPrice ? "Ocultar Precio Costo" : "Mostrar Precio Costo"}
            >
              {showCostPrice ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showCostPrice ? "Ocultar Costo" : "Mostrar Costo"}
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm(initialProductForm);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="quantity">Ordenar por cantidad</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talles y Cantidades</th>
                  {user.role === 'admin' && showCostPrice && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Costo</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Contado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Lista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <select
                          value={product.category}
                          onChange={(e) => updateProductField(product.id, 'category', e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-primary">
                          {product.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editMode[product.id] ? (
                        <input
                          type="text"
                          value={product.detail}
                          onChange={(e) => updateProductField(product.id, 'detail', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{product.detail}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <div className="space-y-1">
                          {product.sizes.map((sizeObj, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs font-medium w-6">{sizeObj.size}:</span>
                              <input
                                type="number"
                                min="0"
                                value={sizeObj.quantity}
                                onChange={(e) => updateProductSize(product.id, idx, e.target.value)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                          ))}
                          <div className="text-xs font-semibold text-gray-700 mt-1">
                            Total: {product.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0)}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {product.sizes && product.sizes.length > 0 ? (
                            <>
                              {product.sizes.map((sizeObj, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                  <span className="font-medium">{sizeObj.size}:</span> {sizeObj.quantity}
                                </div>
                              ))}
                              <div className="text-sm font-semibold text-gray-700 mt-1">
                                Total: {product.quantity}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-gray-700">{product.quantity}</span>
                          )}
                        </div>
                      )}
                    </td>
                    {user.role === 'admin' && showCostPrice && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editMode[product.id] ? (
                          <input
                            type="number"
                            value={product.costPrice}
                            onChange={(e) => updateProductField(product.id, 'costPrice', e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">${product.costPrice}</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <input
                          type="number"
                          value={product.cashPrice}
                          onChange={(e) => updateProductField(product.id, 'cashPrice', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">${product.cashPrice}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <input
                          type="number"
                          value={product.listPrice}
                          onChange={(e) => updateProductField(product.id, 'listPrice', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">${product.listPrice}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {editMode[product.id] ? (
                          <>
                            <button
                              onClick={() => confirmEdit(product.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirmar cambios"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleEditMode(product.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleEditMode(product.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Habilitar edición"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal Agregar/Editar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setProductForm(initialProductForm);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalle</label>
                <textarea
                  value={productForm.detail}
                  onChange={(e) => setProductForm({...productForm, detail: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  rows="3"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Talles y Cantidades</label>
                <div className="grid grid-cols-2 gap-3">
                  {productForm.sizes.map((sizeObj, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-600 w-8">{sizeObj.size}</label>
                      <input
                        type="number"
                        min="0"
                        value={sizeObj.quantity}
                        onChange={(e) => {
                          const newSizes = [...productForm.sizes];
                          newSizes[index].quantity = Number(e.target.value || 0);
                          setProductForm({...productForm, sizes: newSizes});
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {productForm.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0)} unidades
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {user.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Costo</label>
                    <input
                      type="number"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Contado</label>
                  <input
                    type="number"
                    value={productForm.cashPrice}
                    onChange={(e) => setProductForm({...productForm, cashPrice: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen (URL)</label>
                <input
                  type="text"
                  value={productForm.image || ''}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  {editingProduct ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                    setProductForm(initialProductForm);
                  }}
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

export default Products;