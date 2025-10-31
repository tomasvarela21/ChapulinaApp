import React, { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingBag, Loader2 } from 'lucide-react';
import productService from '../services/productService';
import saleService from '../services/saleService';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsResponse, salesResponse] = await Promise.all([
          productService.getAll(),
          saleService.getAll()
        ]);
        // Extract the data array from the API response
        setProducts(productsResponse.data || []);
        setSales(salesResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
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

  const totalSales = sales.filter(s => s.status === 'vendida').reduce((sum, s) => sum + s.amount, 0);
  const lowStock = products.filter(p => p.quantity < 5).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
        Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
      
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Ventas Mensuales</h3>
        <div className="h-48 md:h-64 flex items-end justify-around gap-2 md:gap-4">
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