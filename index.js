import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ragRoutes } from './src/Modules/Rag/ragRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

app.use('/rag', ragRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});
