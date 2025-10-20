import React from 'react';

const Settings = ({ priceMarkup, setPriceMarkup }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Configuración
      </h2>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Precios</h3>
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
            Este porcentaje se aplicará sobre el precio de contado para calcular el precio de lista.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;