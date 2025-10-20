import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Sales from './components/Sales';
import Catalog from './components/Catalog';
import Settings from './components/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user] = useState({ role: 'admin', name: 'Admin' });
  const [priceMarkup, setPriceMarkup] = useState(30);
  const [categories, setCategories] = useState(['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios']);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Vestido Floral',
      category: 'Vestidos',
      detail: 'Vestido largo con estampado floral',
      sizes: [
        { size: 'S', quantity: 3 },
        { size: 'M', quantity: 5 },
        { size: 'L', quantity: 2 },
        { size: 'XL', quantity: 1 }
      ],
      quantity: 11,
      costPrice: 2500,
      cashPrice: 4500,
      listPrice: 5850,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Blusa Romántica',
      category: 'Blusas',
      detail: 'Blusa con volados y encaje',
      sizes: [
        { size: 'S', quantity: 4 },
        { size: 'M', quantity: 3 },
        { size: 'L', quantity: 3 },
        { size: 'XL', quantity: 2 }
      ],
      quantity: 12,
      costPrice: 1800,
      cashPrice: 3200,
      listPrice: 4160,
      image: 'https://images.unsplash.com/photo-1564257577-620ffc3b38d8?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Pantalón Palazzo',
      category: 'Pantalones',
      detail: 'Pantalón ancho tiro alto',
      sizes: [
        { size: 'S', quantity: 2 },
        { size: 'M', quantity: 4 },
        { size: 'L', quantity: 3 },
        { size: 'XL', quantity: 1 }
      ],
      quantity: 10,
      costPrice: 2200,
      cashPrice: 3800,
      listPrice: 4940,
      image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=100&h=100&fit=crop'
    }
  ]);

  const [sales, setSales] = useState([
    { id: 1, customer: 'María González', product: 'Vestido Floral', date: '2025-10-15', amount: 4500, status: 'vendida' },
    { id: 2, customer: 'Laura Pérez', product: 'Blusa Romántica', date: '2025-10-16', amount: 3200, status: 'reservada' },
    { id: 3, customer: 'Ana Rodríguez', product: 'Pantalón Palazzo', date: '2025-10-17', amount: 3800, status: 'vendida' }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
      />
      
      <div className="ml-64 p-8">
        {currentView === 'dashboard' && (
          <Dashboard products={products} sales={sales} />
        )}
        {currentView === 'products' && (
          <Products 
            products={products}
            setProducts={setProducts}
            categories={categories}
            user={user}
            priceMarkup={priceMarkup}
          />
        )}
        {currentView === 'categories' && (
          <Categories 
            categories={categories}
            setCategories={setCategories}
          />
        )}
        {currentView === 'sales' && (
          <Sales sales={sales} />
        )}
        {currentView === 'catalog' && (
          <Catalog 
            products={products}
            categories={categories}
          />
        )}
        {currentView === 'settings' && (
          <Settings 
            priceMarkup={priceMarkup}
            setPriceMarkup={setPriceMarkup}
          />
        )}
      </div>
    </div>
  );
}

export default App;