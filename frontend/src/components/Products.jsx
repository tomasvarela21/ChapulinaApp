import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import settingsService from '../services/settingsService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceMarkup, setPriceMarkup] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // Recuperar estado de localStorage o usar true por defecto
  const [showCostPrice, setShowCostPrice] = useState(() => {
    const saved = localStorage.getItem('showCostPrice');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

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
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Guardar en localStorage cuando cambie el estado de showCostPrice
  const toggleShowCostPrice = () => {
    setShowCostPrice(prev => {
      const newValue = !prev;
      localStorage.setItem('showCostPrice', JSON.stringify(newValue));
      return newValue;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsResponse, categoriesResponse, settingsResponse] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        settingsService.get().catch(() => ({ data: { priceMarkup: 0 } }))
      ]);
      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setPriceMarkup(settingsResponse.data?.priceMarkup || 0);
    } catch (err) {
      console.error('Error fetching products data:', err);
      setError('Error al cargar los datos de productos');
    } finally {
      setLoading(false);
    }
  };

  const calculateListPrice = (cashPrice) => {
    return Math.round(Number(cashPrice) * (1 + priceMarkup / 100));
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.category) return;

    try {
      const totalQuantity = productForm.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

      const newProduct = {
        ...productForm,
        quantity: totalQuantity,
        listPrice: calculateListPrice(productForm.cashPrice),
        image: productForm.image || 'https://via.placeholder.com/100'
      };

      const response = await productService.create(newProduct);
      setProducts([...products, response.data]);
      setProductForm(initialProductForm);
      setShowAddModal(false);
      toast.success('Producto agregado exitosamente');
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Error al agregar el producto');
    }
  };

  const handleUpdateProduct = async () => {
    if (!productForm.name || !productForm.category) return;

    try {
      const totalQuantity = productForm.sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

      const updatedProduct = {
        ...productForm,
        quantity: totalQuantity,
        listPrice: calculateListPrice(productForm.cashPrice)
      };

      const response = await productService.update(editingProduct._id, updatedProduct);
      setProducts(products.map(p =>
        p._id === editingProduct._id ? response.data : p
      ));
      setProductForm(initialProductForm);
      setEditingProduct(null);
      setShowAddModal(false);
      toast.success('Producto actualizado exitosamente');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleProductImageUpload = async (event) => {
    const input = event.target;
    const file = input?.files?.[0];
    if (!file) return;

    const isValidType = file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/webp';

    if (!isValidType) {
      toast.error('Solo se permiten imágenes PNG o JPG');
      if (input) input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await productService.uploadImage(formData);
      const uploadedUrl = response?.data?.imageUrl || response?.data?.path;
      if (!uploadedUrl) {
        throw new Error('No se pudo obtener la URL de la imagen');
      }
      setProductForm(prev => ({
        ...prev,
        image: uploadedUrl
      }));
      toast.success('Imagen subida correctamente');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      if (input) input.value = '';
    }
  };

  const handleDeleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar producto?',
      message: 'Esta acción no se puede deshacer. ¿Estás segura de que deseas eliminar este producto del inventario?',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Eliminando producto...');
        try {
          await productService.delete(id);
          setProducts(products.filter(p => p._id !== id));
          toast.success('Producto eliminado exitosamente', { id: loadingToast });
        } catch (err) {
          console.error('Error deleting product:', err);
          toast.error('Error al eliminar el producto', { id: loadingToast });
        }
      }
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      detail: product.detail || '',
      sizes: product.sizes && product.sizes.length
        ? product.sizes.map(size => ({ ...size }))
        : initialProductForm.sizes,
      costPrice: product.costPrice,
      cashPrice: product.cashPrice,
      image: product.image || ''
    });
    setShowAddModal(true);
  };

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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Gestión de Productos
        </h2>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {user.role === 'admin' && (
            <button
              onClick={toggleShowCostPrice}
              className="flex items-center gap-2 bg-gray-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm md:text-base"
              title={showCostPrice ? "Ocultar Precio Costo" : "Mostrar Precio Costo"}
            >
              {showCostPrice ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="hidden sm:inline">{showCostPrice ? "Ocultar Costo" : "Mostrar Costo"}</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm(initialProductForm);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Agregar</span> Producto
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
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
              className="px-3 md:px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm md:text-base"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm md:text-base"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="quantity">Ordenar por cantidad</option>
            </select>
          </div>
          
          <div className="-mx-2 md:mx-0">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Detalle</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talles</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precios</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <img
                        src={product.image || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-100"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                      />
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="px-2 md:px-3 py-1 text-xs font-medium rounded-full bg-secondary text-primary inline-flex">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{product.detail || '—'}</span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="space-y-1 text-xs text-gray-600">
                        {product.sizes && product.sizes.length > 0 ? (
                          <>
                            {product.sizes.map((sizeObj, idx) => (
                              <div key={idx}>
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
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="space-y-1 text-sm">
                        {user.role === 'admin' && showCostPrice && (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-800">Costo:</span> ${product.costPrice}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-primary">
                          Contado: ${product.cashPrice}
                        </div>
                        <div className="text-sm text-gray-700">
                          Lista: ${product.listPrice}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/40 text-primary font-medium text-sm hover:bg-primary/5 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleProductImageUpload}
                      />
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <span>Subir archivo</span>
                          <span className="text-xs text-gray-500">(PNG, JPG, máx 5MB)</span>
                        </>
                      )}
                    </label>
                    {productForm.image && (
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {productForm.image}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={productForm.image || ''}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg o /uploads/archivo.png"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
                  />
                  {productForm.image && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                      <img
                        src={productForm.image}
                        alt="Vista previa del producto"
                        className="w-28 h-28 rounded-xl object-cover border border-gray-200 bg-gray-50"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100'; }}
                      />
                    </div>
                  )}
                </div>
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

export default Products;
