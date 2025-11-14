import React from 'react';
import { BarChart3, Package, ShoppingBag, Users, Tag, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ currentView, setCurrentView, user, isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  return (
    <>
      {/* Overlay para cerrar sidebar en móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenedor de Sidebar + Botón Toggle */}
      <div className={`fixed left-0 top-0 h-screen transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-64'
      }`}>
        {/* Sidebar */}
        <div className="w-64 bg-white h-full shadow-lg border-r border-gray-100 float-left">
          <div className="p-6 pt-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
              Chapulina
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de Stock</p>
          </div>
        
        <nav className="mt-6">
          <button
            onClick={() => {
              setCurrentView('dashboard');
              // Cerrar sidebar en móviles al seleccionar
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === 'dashboard' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('products');
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === 'products' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Productos</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('categories');
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === 'categories' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="font-medium">Categorías</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('sales');
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === 'sales' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">Ventas</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('catalog');
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === 'catalog' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Catálogo</span>
          </button>

          {user.role === 'admin' && (
            <button
              onClick={() => {
                setCurrentView('settings');
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                currentView === 'settings' ? 'bg-secondary text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configuración</span>
            </button>
          )}
        </nav>
        
          <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Botón Toggle - Fuera de la sidebar, se mueve con ella */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 left-64 ml-2 p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
      </div>
    </>
  );
};

export default Sidebar;