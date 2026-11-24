import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB, getDbStatus } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { realtimeBus } from './services/realtimeBus';

// Route imports
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import expenseRoutes from './routes/expenseRoutes';
import materialRoutes from './routes/materialRoutes';
import customerRoutes from './routes/customerRoutes';
import bookingRoutes from './routes/bookingRoutes';
import progressRoutes from './routes/progressRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { memStore } from './data/inMemoryStore';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path normalization: ensure requests forwarded without /api prefix match /api/* routes
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  next();
});

// Friendly Root & /api route with visual status dashboard for browsers
app.get(['/', '/api', '/api/docs'], (req, res) => {
  const dbStatus = getDbStatus();

  // If requested in browser, display a clean status UI
  if (req.accepts('html') && !req.query.json) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>BuildNex API - Live & Healthy</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 650px; width: 100%; background: #1e293b; border-radius: 18px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #059669; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
    h1 { margin: 18px 0 8px; font-size: 26px; font-weight: 800; color: #fff; }
    p { color: #94a3b8; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
    .meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; padding: 14px 18px; background: #0f172a; border-radius: 12px; border: 1px solid #334155; font-size: 12px; color: #cbd5e1; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
    a.link-card { display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #334155; padding: 12px 16px; border-radius: 10px; color: #38bdf8; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s; }
    a.link-card:hover { border-color: #38bdf8; background: #1e293b; transform: translateY(-2px); color: #7dd3fc; }
    .frontend-btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; margin-top: 24px; background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px; border-radius: 12px; transition: background 0.2s; }
    .frontend-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="dot"></div> REAL-TIME API ONLINE & HEALTHY</div>
    <h1>BuildNex Platform Backend</h1>
    <p>The Express REST API and Real-Time EventBus are active on port 5000 with disk persistence enabled.</p>
    
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Status</span><span style="color:#10b981; font-weight:700;">Online (Port 5000)</span></div>
      <div class="meta-item"><span class="meta-label">Storage Mode</span><span style="color:#f59e0b; font-weight:700;">${dbStatus.mode.toUpperCase()}</span></div>
      <div class="meta-item"><span class="meta-label">Real-Time</span><span style="color:#06b6d4; font-weight:700;">SSE Stream Active</span></div>
    </div>

    <div class="grid">
      <a class="link-card" href="/api/health" target="_blank"><span>🩺 Health Check</span><span>→</span></a>
      <a class="link-card" href="/api/projects" target="_blank"><span>🏗️ Projects</span><span>→</span></a>
      <a class="link-card" href="/api/tasks" target="_blank"><span>📋 Tasks</span><span>→</span></a>
      <a class="link-card" href="/api/expenses" target="_blank"><span>💰 Expenses</span><span>→</span></a>
      <a class="link-card" href="/api/materials" target="_blank"><span>📦 Materials</span><span>→</span></a>
      <a class="link-card" href="/api/customers" target="_blank"><span>👥 Customers</span><span>→</span></a>
      <a class="link-card" href="/api/bookings" target="_blank"><span>🏠 Bookings</span><span>→</span></a>
      <a class="link-card" href="/api/progress" target="_blank"><span>📈 Progress</span><span>→</span></a>
      <a class="link-card" href="/api/analytics/dashboard" target="_blank"><span>📊 Dashboard KPI</span><span>→</span></a>
      <a class="link-card" href="/api/notifications" target="_blank"><span>🔔 Notifications</span><span>→</span></a>
    </div>

    <a class="frontend-btn" href="http://localhost:5173" target="_blank">Launch BuildNex Frontend Web App (localhost:5173) &rarr;</a>
  </div>
</body>
</html>`);
  }

  res.json({
    status: 'online',
    platform: 'BuildNex – Smart Construction Management Platform API',
    version: '1.0.0',
    mode: dbStatus.mode,
    health: `http://localhost:${ENV.PORT}/api/health`,
    docs: {
      health: `http://localhost:${ENV.PORT}/api/health`,
      projects: `http://localhost:${ENV.PORT}/api/projects`,
      tasks: `http://localhost:${ENV.PORT}/api/tasks`,
      expenses: `http://localhost:${ENV.PORT}/api/expenses`,
      materials: `http://localhost:${ENV.PORT}/api/materials`,
      customers: `http://localhost:${ENV.PORT}/api/customers`,
      bookings: `http://localhost:${ENV.PORT}/api/bookings`,
      progress: `http://localhost:${ENV.PORT}/api/progress`,
      analytics: `http://localhost:${ENV.PORT}/api/analytics/dashboard`,
      ai: `http://localhost:${ENV.PORT}/api/ai/chat`,
      events: `http://localhost:${ENV.PORT}/api/events`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Health and DB status check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'online',
    platform: 'BuildNex Construction Management API',
    version: '1.0.0',
    mode: dbStatus.mode,
    timestamp: new Date().toISOString(),
  });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');
  realtimeBus.addClient(res);

  req.on('close', () => {
    realtimeBus.removeClient(res);
  });
});

// Restore database baseline
app.post(['/api/database/reset', '/api/demo/reset'], (req, res) => {
  memStore.reset();
  res.json({ success: true, message: 'Database restored to initial production baseline' });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: memStore.notifications });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = memStore.notifications.find((n: any) => n.id === req.params.id);
  if (notif) notif.unread = false;
  res.json({ success: true, data: notif });
});

// Mount Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  const port = Number(ENV.PORT) || 5000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 BuildNex Backend Server running on port ${port}`);
    console.log(`📍 Environment: ${ENV.NODE_ENV}`);
    console.log(`💾 Database Mode: ${getDbStatus().mode.toUpperCase()}`);
    console.log(`📡 Base URL: http://localhost:${port}/api`);
    console.log(`🩺 Health URL: http://localhost:${port}/api/health`);
    console.log(`=======================================================`);
  });

  // Attempt MongoDB connection asynchronously
  connectDB().catch((e) => {
    console.warn(`[MongoDB] Running in In-Memory Demo Mode`);
  });
};

// Only bind port in standalone Node environments; Vercel Serverless handles invocations directly
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
} else {
  // In serverless environment, connect DB asynchronously on cold start
  connectDB().catch(() => {
    console.log(`[MongoDB] Running in serverless storage mode`);
  });
}

export default app;
