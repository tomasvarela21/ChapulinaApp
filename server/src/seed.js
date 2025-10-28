import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Sale from './models/Sale.js';
import Settings from './models/Settings.js';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Datos de seed
const users = [
  {
    name: 'Admin',
    email: 'admin@chapulina.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Vendedora',
    email: 'vendedora@chapulina.com',
    password: 'vendedora123',
    role: 'vendedor'
  }
];

const categories = [
  { name: 'Vestidos', description: 'Vestidos de diferentes estilos' },
  { name: 'Blusas', description: 'Blusas casuales y elegantes' },
  { name: 'Pantalones', description: 'Pantalones de diversos cortes' },
  { name: 'Faldas', description: 'Faldas para toda ocasión' },
  { name: 'Accesorios', description: 'Complementos y accesorios' }
];

const products = [
  {
    name: 'Vestido Floral',
    category: 'Vestidos',
    detail: 'Vestido largo con estampado floral',
    sizes: [
      { size: 'S', quantity: 3 },
      { size: 'M', quantity: 5 },
      { size: 'L', quantity: 2 },
      { size: 'XL', quantity: 1 }
    ],
    costPrice: 2500,
    cashPrice: 4500,
    listPrice: 5850,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
  },
  {
    name: 'Blusa Romántica',
    category: 'Blusas',
    detail: 'Blusa con volados y encaje',
    sizes: [
      { size: 'S', quantity: 4 },
      { size: 'M', quantity: 3 },
      { size: 'L', quantity: 3 },
      { size: 'XL', quantity: 2 }
    ],
    costPrice: 1800,
    cashPrice: 3200,
    listPrice: 4160,
    image: 'https://images.unsplash.com/photo-1564257577-620ffc3b38d8?w=100&h=100&fit=crop'
  },
  {
    name: 'Pantalón Palazzo',
    category: 'Pantalones',
    detail: 'Pantalón ancho tiro alto',
    sizes: [
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 4 },
      { size: 'L', quantity: 3 },
      { size: 'XL', quantity: 1 }
    ],
    costPrice: 2200,
    cashPrice: 3800,
    listPrice: 4940,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=100&h=100&fit=crop'
  }
];

const settings = {
  priceMarkup: 30,
  businessName: 'Chapulina',
  businessPhone: '',
  businessEmail: 'info@chapulina.com',
  businessAddress: ''
};

// Funciones de seed
const importData = async () => {
  try {
    // Limpiar base de datos
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Sale.deleteMany();
    await Settings.deleteMany();

    console.log('🗑️  Base de datos limpiada');

    // Crear usuarios
    const createdUsers = await User.create(users);
    console.log('✅ Usuarios creados');

    // Crear categorías
    await Category.create(categories);
    console.log('✅ Categorías creadas');

    // Crear productos
    await Product.create(products);
    console.log('✅ Productos creados');

    // Crear configuración
    await Settings.create(settings);
    console.log('✅ Configuración creada');

    console.log('\n🎉 Datos de seed importados exitosamente!');
    console.log('\n📧 Credenciales de acceso:');
    console.log('   Admin: admin@chapulina.com / admin123');
    console.log('   Vendedora: vendedora@chapulina.com / vendedora123');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Sale.deleteMany();
    await Settings.deleteMany();

    console.log('🗑️  Datos eliminados exitosamente');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Ejecutar según el argumento
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
