// ============================================================
// Capa de servicios: EXPEDIENTE CLÍNICO (documents)
// Notas, recetas y radiografías por paciente. El archivo binario
// (imagen/PDF) se guarda en data/uploads/, NUNCA en la base de datos;
// aquí solo se guarda la metadata (tipo, texto, nombre de archivo).
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db/connection.js';
import { ValidationError } from './patientService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '../../data/uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const VALID_TYPES = ['nota', 'receta', 'radiografia'];

function removeFile(filePath) {
  if (!filePath) return;
  fs.rmSync(path.join(UPLOADS_DIR, filePath), { force: true });
}

export const documentService = {
  listByPatient(patientId) {
    return db
      .prepare('SELECT * FROM documents WHERE patient_id = ? ORDER BY created_at DESC')
      .all(patientId);
  },

  getById(id) {
    return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  },

  create({ patient_id, type, note_text, file }) {
    if (!patient_id) {
      throw new ValidationError('El documento debe estar asociado a un paciente.');
    }
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      throw new ValidationError('El paciente indicado no existe.');
    }
    if (!VALID_TYPES.includes(type)) {
      throw new ValidationError(`Tipo de documento no válido: ${type}`);
    }
    if (!note_text?.trim() && !file) {
      throw new ValidationError('Agrega una nota o adjunta un archivo.');
    }

    const info = db
      .prepare(
        `INSERT INTO documents (patient_id, type, note_text, file_path, original_name, mime_type)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        patient_id,
        type,
        note_text?.trim() || null,
        file ? file.filename : null,
        file ? file.originalname : null,
        file ? file.mimetype : null
      );
    return documentService.getById(info.lastInsertRowid);
  },

  remove(id) {
    const doc = documentService.getById(id);
    if (!doc) throw new ValidationError('Documento no encontrado.');
    removeFile(doc.file_path);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    return { id };
  },

  // Se llama al eliminar un paciente: limpia sus archivos en disco antes
  // de que el ON DELETE CASCADE se lleve las filas de la BD.
  removeAllForPatient(patientId) {
    for (const doc of documentService.listByPatient(patientId)) {
      removeFile(doc.file_path);
    }
  },
};
