import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// import path from 'path';
// import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import billingRoutes from './src/routes/billingRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

import {
  errorHandler,
  notFound,
} from './src/middleware/errorMiddleware.js';

import {
  logError,
} from './src/middleware/errorLogger.js';

import debugRoutes from './src/routes/debugRoutes.js';

import {
  initSocket,
} from './src/sockets/socketHandler.js';


/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

dotenv.config();


/*
|--------------------------------------------------------------------------
| Express App
|--------------------------------------------------------------------------
*/

const app = express();


/*
|--------------------------------------------------------------------------
| HTTP Server
|--------------------------------------------------------------------------
*/

const server = http.createServer(app);


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const clientUrl = process.env.CLIENT_URL;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an origin
    // Example: Postman, curl, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    // Production/client URL
    if (clientUrl && origin === clientUrl) {
      return callback(null, true);
    }

    // Local development frontend
    if (
      !clientUrl &&
      process.env.NODE_ENV !== 'production' &&
      origin === 'http://localhost:5173'
    ) {
      return callback(null, true);
    }

    callback(
      new Error('CORS policy: origin not allowed')
    );
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ],
};


/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io = new Server(server, {
  cors: corsOptions,
});

initSocket(io);


/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors(corsOptions));

app.use(morgan('dev'));


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/tables',
  tableRoutes
);

app.use(
  '/api/categories',
  categoryRoutes
);


/*
|--------------------------------------------------------------------------
| Menu Test Route
|--------------------------------------------------------------------------
|
| This route is useful for quickly checking whether
| server.js itself is responding.
|
*/

app.get('/api/menu-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Menu route is working from server.js',
  });
});


app.use(
  '/api/menu',
  menuRoutes
);

app.use(
  '/api/orders',
  orderRoutes
);

app.use(
  '/api/payments',
  paymentRoutes
);

app.use(
  '/api/reviews',
  reviewRoutes
);

app.use(
  '/api/billing',
  billingRoutes
);

app.use(
  '/api/reports',
  reportRoutes
);

app.use(
  '/api/notifications',
  notificationRoutes
);


/*
|--------------------------------------------------------------------------
| DEBUG ROUTES
|--------------------------------------------------------------------------
|
| GET    /api/debug/health
| GET    /api/debug/errors
| DELETE /api/debug/errors
|
*/

app.use(
  '/api/debug',
  debugRoutes
);


/*
|--------------------------------------------------------------------------
| Production Frontend
|--------------------------------------------------------------------------
*/

// if (process.env.NODE_ENV === 'production') {
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = path.dirname(__filename);
//
//   app.use(
//     express.static(
//       path.join(__dirname, '../client/dist')
//     )
//   );
//
//   app.get('*', (req, res) => {
//     res.sendFile(
//       path.join(
//         __dirname,
//         '../client/dist/index.html'
//       )
//     );
//   });
// }


/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant Management API is running',
  });
});


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);


/*
|--------------------------------------------------------------------------
| Global Express Error Handler
|--------------------------------------------------------------------------
|
| This catches errors passed through next(error)
| inside API controllers/routes.
|
*/

app.use((err, req, res, next) => {
  console.error('\n GLOBAL EXPRESS ERROR');

  const errorEntry = logError({
    error: err,
    req,
    statusCode: err.statusCode || 500,
    type: 'EXPRESS_ERROR',
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errorId: errorEntry.id,
  });
});


/*
|--------------------------------------------------------------------------
| Process-Level Error Handling
|--------------------------------------------------------------------------
|
| These catch errors that happen outside Express,
| including unexpected startup/runtime errors.
|
*/

process.on('uncaughtException', (error) => {
  logError({
    error,
    type: 'UNCAUGHT_EXCEPTION',
  });

  console.error(
    ' UNCAUGHT EXCEPTION detected.'
  );

  console.error(
    'The error has been logged above.'
  );

  /*
   * We intentionally do not immediately call
   * process.exit() here so we can inspect the
   * error during development.
   */
});


process.on('unhandledRejection', (reason) => {
  const error =
    reason instanceof Error
      ? reason
      : new Error(String(reason));

  logError({
    error,
    type: 'UNHANDLED_REJECTION',
  });

  console.error(
    ' UNHANDLED PROMISE REJECTION detected.'
  );
});


/*
|--------------------------------------------------------------------------
| Server Port
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    console.log('\n========================================');
    console.log(' Starting Restaurant Management API');
    console.log('========================================');

    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Port:', PORT);

    console.log('\nConnecting to MongoDB...');

    await connectDB();

    console.log(' MongoDB connection successful');

    server.listen(PORT, () => {
      console.log('\n========================================');
      console.log(` Server running on port ${PORT}`);
      console.log(` http://localhost:${PORT}`);
      console.log(` http://localhost:${PORT}/api/debug/health`);
      console.log('========================================\n');
    });

  } catch (error) {

    logError({
      error,
      type: 'SERVER_STARTUP_ERROR',
    });

    console.error(
      '\n Failed to start server.'
    );

    console.error(
      'Error:',
      error.message
    );

    console.error(
      '\nFull stack trace:'
    );

    console.error(
      error.stack
    );

    /*
     * Keep the existing behavior of stopping
     * the application when the initial startup
     * process fails.
     */
    process.exit(1);
  }
};


/*
|--------------------------------------------------------------------------
| Start Application
|--------------------------------------------------------------------------
*/

startServer();


/*
|--------------------------------------------------------------------------
| Export Socket.IO
|--------------------------------------------------------------------------
*/

export {
  io,
};