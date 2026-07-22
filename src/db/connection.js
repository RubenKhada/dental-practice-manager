// Capa de datos: conexión a SQLite usando el módulo nativo de Node (node:sqlite).
// No requiere compilación nativa: funciona en Node 22+ sin instalar nada extra.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, '../../data/dental.db');

// Archivos del expediente clínico y fotos de perfil: nunca en la BD.
export const UPLOADS_DIR = path.join(__dirname, '../../data/uploads');

// Asegura que existan las carpetas /data y /data/uploads
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);
// Claves foráneas activas: borrar un paciente no deja citas huérfanas.
db.exec('PRAGMA foreign_keys = ON;');

export function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  migrate();
}

// Migraciones ligeras para bases de datos creadas antes de agregar una
// columna nueva (CREATE TABLE IF NOT EXISTS no altera tablas existentes).
function migrate() {
  const patientCols = db.prepare('PRAGMA table_info(patients)').all().map((c) => c.name);
  if (!patientCols.includes('photo_path')) {
    db.exec('ALTER TABLE patients ADD COLUMN photo_path TEXT');
  }
}
