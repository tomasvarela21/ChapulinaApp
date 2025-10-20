import React from 'react';
import { DollarSign, Package, ShoppingBag } from 'lucide-react';

const Dashboard = ({ products, sales }) => {
  const totalSales = sales.filter(s => s.status === 'vendida').reduce((sum, s) => sum + s.amount, 0);
  const lowStock = products.filter(p => p.quantity < 5).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ventas del Mes</p>
              <p className="text-3xl font-bold text-gray-800">${totalSales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Stock Bajo</p>
              <p className="text-3xl font-bold text-gray-800">{lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Productos</p>
              <p className="text-3xl font-bold text-gray-800">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Mensuales</h3>
        <div className="h-64 flex items-end justify-around gap-4">
          {[3200, 4500, 3800, 5200, 4100, 6800].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                style={{ height: `${(value / 7000) * 100}%` }}
              ></div>
              <p className="text-xs text-gray-500 mt-2">Sem {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;