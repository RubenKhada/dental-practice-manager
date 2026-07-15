// ============================================================
// Capa de servicios: PACIENTES
// Aquí vive la lógica de negocio. Las rutas solo llaman a estas
// funciones; no escriben SQL directo. (Separación de responsabilidades)
// ============================================================
import { db } from '../db/connection.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export const patientService = {
  list({ search } = {}) {
    if (search) {
      const like = `%${search}%`;
      return db
        .prepare(
          `SELECT * FROM patients
           WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
           ORDER BY name COLLATE NOCASE`
        )
        .all(like, like, like);
    }
    return db
      .prepare('SELECT * FROM patients ORDER BY name COLLATE NOCASE')
      .all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  },

  create({ name, phone, email, notes }) {
    if (!name || !name.trim()) {
      throw new ValidationError('El nombre del paciente es obligatorio.');
    }
    const info = db
      .prepare(
        `INSERT INTO patients (name, phone, email, notes)
         VALUES (?, ?, ?, ?)`
      )
      .run(name.trim(), phone || null, email || null, notes || null);
    return patientService.getById(info.lastInsertRowid);
  },

  update(id, { name, phone, email, notes }) {
    const existing = patientService.getById(id);
    if (!existing) throw new ValidationError('Paciente no encontrado.');
    if (name !== undefined && !name.trim()) {
      throw new ValidationError('El nombre no puede quedar vacío.');
    }
    db.prepare(
      `UPDATE patients
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           notes = COALESCE(?, notes)
       WHERE id = ?`
    ).run(
      name ?? null,
      phone ?? null,
      email ?? null,
      notes ?? null,
      id
    );
    return patientService.getById(id);
  },

  remove(id) {
    const existing = patientService.getById(id);
    if (!existing) throw new ValidationError('Paciente no encontrado.');
    db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    return { id };
  },
};
