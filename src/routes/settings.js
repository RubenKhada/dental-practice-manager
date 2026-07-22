// Rutas de Configuración (capa de transporte HTTP)
import express from 'express';
import { settingsService } from '../services/settingsService.js';
import { DB_PATH } from '../db/connection.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(settingsService.getAll());
});

router.put('/', (req, res) => {
  res.json(settingsService.update(req.body));
});

// Respaldo: descarga el archivo SQLite tal cual (todo vive local).
router.get('/backup', (req, res) => {
  const stamp = new Date().toISOString().slice(0, 10);
  res.download(DB_PATH, `dental-backup-${stamp}.db`);
});

export default router;
