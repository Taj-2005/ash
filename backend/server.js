const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRouter = require('./src/routes/auth');
const menuRouter = require('./src/routes/menu');
const orderRouter = require('./src/routes/orders');
const userRouter = require('./src/routes/users');
const uploadRouter = require('./src/routes/upload');
const storeRouter = require('./src/routes/store');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://campus-bites-web.vercel.app',
  'https://campus-bites-server.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('[CORS] Blocked origin:', origin);
    return callback(new Error('CORS policy violation'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const { sendOrderUpdate, sendVendorOrderAlert, broadcastStoreStatus } = require('./src/utils/pusher');

global.sendOrderUpdate = sendOrderUpdate;
global.sendVendorOrderAlert = sendVendorOrderAlert;
global.broadcastStoreStatus = broadcastStoreStatus;

app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRouter);
app.use('/api/users', userRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/store', storeRouter);

app.get('/api/status', (req, res) => {
  res.json({
    message: 'Campus Bites API is running smoothly!',
    service: 'Backend',
    realtimeProvider: 'Pusher',
    features: ['Customer Notifications', 'Vendor Alerts', 'Store Status'],
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Bites API',
    version: '2.0.0',
    provider: 'Pusher',
  });
});

// Only start listening when this file is run directly (not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
