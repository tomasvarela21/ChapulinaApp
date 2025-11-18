import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Cargar variables de entorno lo antes posible
dotenv.config();

// Importar rutas (después de cargar dotenv para que usen las env vars)
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userRoutes from './routes/users.js';

// Conectar a la base de datos
connectDB();

// Inicializar Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chapulina API is running...'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Puerto
// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor solo en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Manejar rechazos de promesas no manejadas
  process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
  });
}

// Exportar para que index.js pueda usarlo
export default app;
