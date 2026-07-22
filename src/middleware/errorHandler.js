// Middleware de errores: convierte ValidationError en respuesta 400 limpia.
import multer from 'multer';
import { ValidationError } from '../services/patientService.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode || 400).json({ error: err.message });
  }
  if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Ese horario acaba de ocuparse. Elige otro.' });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo es demasiado grande (máx. 15MB).'
      : 'Error al subir el archivo.';
    return res.status(400).json({ error: msg });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
