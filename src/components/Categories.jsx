import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const Categories = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState('');
  
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (index) => {
    if (window.confirm('¿Estás segura de eliminar esta categoría?')) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Categorías
      </h2>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex gap-4 mb-6">
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
            className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Agregar
          </button>
        </div>
        
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:shadow-sm transition-shadow">
              <span className="font-medium text-gray-700">{cat}</span>
              <button
                onClick={() => handleDeleteCategory(index)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;