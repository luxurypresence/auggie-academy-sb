import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/todos', todosRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server running' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
