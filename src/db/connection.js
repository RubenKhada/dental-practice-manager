// Capa de datos: conexión a SQLite usando el módulo nativo de Node (node:sqlite).
// No requiere compilación nativa: funciona en Node 22+ sin instalar nada extra.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, '../../data/dental.db');

// Asegura que exista la carpeta /data
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
// Claves foráneas activas: borrar un paciente no deja citas huérfanas.
db.exec('PRAGMA foreign_keys = ON;');

export function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}
