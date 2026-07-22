// ============================================================
// PUNTO DE ENTRADA - Dental Practice Manager
// Ensambla las capas: datos -> servicios -> rutas -> HTTP
// ============================================================
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initSchema, UPLOADS_DIR } from './db/connection.js';
import patientsRouter from './routes/patients.js';
import appointmentsRouter from './routes/appointments.js';
import settingsRouter from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';

// Inicializa la base de datos (crea tablas si no existen)
initSchema();

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware: entender JSON en el body
app.use(express.json());

// API REST (capa de rutas)
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/settings', settingsRouter);

// Frontend estático (HTML/JS vanilla en /public)
app.use(express.static(path.join(__dirname, '../public')));

// Archivos del expediente clínico (recetas, radiografías) y fotos de
// perfil. Local, un solo usuario: sin autenticación adicional, igual que
// el resto de la API.
app.use('/uploads', express.static(UPLOADS_DIR));

// Manejo central de errores (debe ir al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  Dental Practice Manager corriendo en http://localhost:${PORT}\n`);
});
