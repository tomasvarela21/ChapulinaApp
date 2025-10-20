import React, { useState } from 'react';

const Catalog = ({ products, categories }) => {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(p => 
    categoryFilter === 'all' || p.category === categoryFilter
  );

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
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Contado:</span>
                  <span className="text-lg font-bold text-primary">${product.cashPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Lista:</span>
                  <span className="text-sm text-gray-600">${product.listPrice}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;