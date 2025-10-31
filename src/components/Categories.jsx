import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import categoryService from '../services/categoryService';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await categoryService.create({ name: newCategory.trim() });
        setCategories([...categories, response.data]);
        setNewCategory('');
        toast.success('Categoría agregada exitosamente');
      } catch (err) {
        console.error('Error adding category:', err);
        toast.error('Error al agregar la categoría');
      }
    }
  };

  const handleDeleteCategory = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar categoría?',
      message: 'Esta acción no se puede deshacer. Los productos con esta categoría no se verán afectados.',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Eliminando...');
        try {
          await categoryService.delete(id);
          setCategories(categories.filter(cat => cat._id !== id));
          toast.success('Categoría eliminada exitosamente', { id: loadingToast });
        } catch (err) {
          console.error('Error deleting category:', err);
          toast.error('Error al eliminar la categoría', { id: loadingToast });
        }
      }
    });
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

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Categorías
      </h2>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="Nueva categoría..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAddCategory}
            className="bg-primary text-white px-4 md:px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors text-sm md:text-base whitespace-nowrap"
          >
            Agregar
          </button>
        </div>
        
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:shadow-sm transition-shadow">
              <span className="font-medium text-gray-700">{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat._id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

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

export default Categories;