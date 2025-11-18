import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Package, ShoppingBag, Loader2 } from 'lucide-react';
import productService from '../services/productService';
import saleService from '../services/saleService';

const COMPLETED_STATUSES = ['vendida', 'retirada'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const LOW_STOCK_THRESHOLD = 2;

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsResponse, salesResponse, lowStockResponse] = await Promise.all([
          productService.getAll(),
          saleService.getAll(),
          productService.getLowStock(LOW_STOCK_THRESHOLD)
        ]);
        // Extract the data array from the API response
        setProducts(productsResponse.data || []);
        setSales(salesResponse.data || []);
        setLowStockProducts(lowStockResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const monthlySalesData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: MONTH_LABELS[date.getMonth()],
        year: date.getFullYear(),
        month: date.getMonth(),
        total: 0
      });
    }

    const monthIndex = new Map(months.map((month, idx) => [`${month.year}-${month.month}`, idx]));

    sales.forEach(sale => {
      if (!COMPLETED_STATUSES.includes(sale.status)) return;
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : null;
      if (!saleDate || Number.isNaN(saleDate.getTime())) return;
      const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
      const idx = monthIndex.get(key);
      if (idx === undefined) return;
      const amount = typeof sale.amount === 'number' ? sale.amount : parseFloat(sale.amount) || 0;
      months[idx].total += amount;
    });

    return months;
  }, [sales]);

  const currentMonthSales = monthlySalesData.length
    ? monthlySalesData[monthlySalesData.length - 1].total
    : 0;

  const maxMonthlySale = monthlySalesData.reduce((max, month) => Math.max(max, month.total), 0);

  const lowStockCount = lowStockProducts.length;
  const lowStockTooltip = lowStockCount
    ? lowStockProducts.map(product => {
        const sizeInfo = product.lowStockSizes && product.lowStockSizes.length
          ? ` (${product.lowStockSizes.map(size => `${size.size}: ${size.quantity}`).join(', ')})`
          : '';
        return `${product.name}${sizeInfo}`;
      }).join('\n')
    : 'Sin productos con stock bajo';
  const lowStockPreview = useMemo(() => lowStockProducts.slice(0, 3), [lowStockProducts]);

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
        Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ventas del Mes</p>
              <p className="text-3xl font-bold text-gray-800">${currentMonthSales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div
          className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-red-100 bg-gradient-to-br from-rose-50 via-white to-white"
          title={lowStockTooltip}
        >
          <div className="absolute inset-y-0 right-0 w-32 bg-rose-100 blur-3xl opacity-40 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 mb-2">
                Alertas de stock
              </span>
              <p className="text-xs uppercase tracking-wide text-rose-900/70 mb-1">Productos con bajo stock</p>
              <p className="text-3xl font-bold text-rose-900">{lowStockCount}</p>
            </div>
            <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
              <Package className="w-7 h-7" />
            </div>
          </div>
          {lowStockCount > 0 ? (
            <ul className="relative space-y-2 text-sm text-rose-900/80">
              {lowStockPreview.map(product => (
                <li key={product._id || product.name} className="flex items-center justify-between rounded-xl bg-white/70 border border-rose-100 px-3 py-2">
                  <span className="font-medium truncate">{product.name}</span>
                  <span className="text-xs text-rose-600">
                    {product.lowStockSizes && product.lowStockSizes.length
                      ? product.lowStockSizes.map(size => `${size.size}:${size.quantity}`).join(' · ')
                      : `${product.quantity || 0} uds`}
                  </span>
                </li>
              ))}
              {lowStockCount > lowStockPreview.length && (
                <li className="text-xs text-rose-600/80 italic text-right">
                  +{lowStockCount - lowStockPreview.length} productos más
                </li>
              )}
            </ul>
          ) : (
            <p className="relative text-sm text-rose-900/70">Todo el stock luce saludable 🎉</p>
          )}
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
          {monthlySalesData.map(month => {
            const heightPercentage = maxMonthlySale > 0 ? (month.total / maxMonthlySale) * 100 : 0;
            return (
              <div key={month.key} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 flex items-end justify-center text-white text-xs font-medium"
                  style={{ height: `${heightPercentage}%` }}
                >
                  {month.total > 0 && (
                    <span className="pb-2">${month.total.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{month.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
