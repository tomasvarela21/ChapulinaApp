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
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  // Sidebar cerrada por defecto en móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6',
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #D4AF37',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #fecaca',
            },
          },
        }}
      />
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Contenido principal que se ajusta dinámicamente */}
      {/* ml-16 da espacio para el botón toggle (~64px) */}
      <div className={`p-4 md:p-8 pl-16 md:pl-14 pt-4 md:pt-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
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