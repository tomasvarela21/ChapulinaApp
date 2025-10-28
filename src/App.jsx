import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Sales from './components/Sales';
import Catalog from './components/Catalog';
import Settings from './components/Settings';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Contenido principal que se ajusta dinámicamente */}
      <div className={`p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'products' && <Products />}
        {currentView === 'categories' && <Categories />}
        {currentView === 'sales' && <Sales />}
        {currentView === 'catalog' && <Catalog />}
        {currentView === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;