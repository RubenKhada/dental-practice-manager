// Middleware de errores: convierte ValidationError en respuesta 400 limpia.
import { ValidationError } from '../services/patientService.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode || 400).json({ error: err.message });
  }
  if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Ese horario acaba de ocuparse. Elige otro.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
