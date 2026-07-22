// ============================================================
// Capa de servicios: CITAS (appointments)
// Implementa las reglas de validación de docs/appointment-workflow.md:
//   - Evitar cruces por solapamiento de horario (considera duration_min)
//   - Paciente requerido
//   - Fecha válida (no en el pasado)
//   - Estado controlado (solo los 6 definidos)
//   - Historial (no se borra; se cancela)
// ============================================================
import { db } from '../db/connection.js';
import { ValidationError } from './patientService.js';

const VALID_STATUSES = [
  'programada',
  'confirmada',
  'reprogramada',
  'cancelada',
  'atendida',
  'no_asistio',
];

function getDefaultDuration() {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'default_duration_min'")
    .get();
  return row ? Number(row.value) : 30;
}

// Convierte 'YYYY-MM-DDTHH:mm' (del input datetime-local) a 'YYYY-MM-DD HH:mm'
function toSqlDateTime(value) {
  return value.replace('T', ' ').slice(0, 16);
}

function toDate(sql) {
  return new Date(sql.replace(' ', 'T'));
}

// Dos citas se cruzan si sus rangos [inicio, inicio+duración) se traslapan.
// Una cita que empieza justo cuando otra termina NO se considera cruce.
function rangesOverlap(startA, durA, startB, durB) {
  const endA = startA.getTime() + durA * 60000;
  const endB = startB.getTime() + durB * 60000;
  return startA.getTime() < endB && startB.getTime() < endA;
}

// Busca, entre las citas activas (no canceladas), alguna que se cruce con
// el rango [startsSql, startsSql + durationMin). Excluye excludeId al
// reprogramar, para no chocar contra sí misma.
function findOverlap(startsSql, durationMin, excludeId) {
  const active = db
    .prepare(
      `SELECT id, starts_at, duration_min FROM appointments
       WHERE status <> 'cancelada' AND id <> ?`
    )
    .all(excludeId ?? -1);
  const newStart = toDate(startsSql);
  return active.find((a) =>
    rangesOverlap(newStart, durationMin, toDate(a.starts_at), a.duration_min)
  );
}

export const appointmentService = {
  list() {
    return db
      .prepare(
        `SELECT a.*, p.name AS patient_name
         FROM appointments a
         LEFT JOIN patients p ON p.id = a.patient_id
         ORDER BY a.starts_at ASC`
      )
      .all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  },

  create({ patient_id, title, starts_at, duration_min, status }) {
    // Regla: paciente requerido
    if (!patient_id) {
      throw new ValidationError('Una cita debe estar asociada a un paciente.');
    }
    const patient = db
      .prepare('SELECT id FROM patients WHERE id = ?')
      .get(patient_id);
    if (!patient) {
      throw new ValidationError('El paciente indicado no existe.');
    }
    if (!title || !title.trim()) {
      throw new ValidationError('El título/motivo de la cita es obligatorio.');
    }
    if (!starts_at) {
      throw new ValidationError('Debe indicar fecha y hora de la cita.');
    }

    const startsSql = toSqlDateTime(starts_at);

    // Regla: fecha válida (no en el pasado)
    const nowRow = db.prepare("SELECT datetime('now','localtime') AS now").get();
    if (startsSql < nowRow.now) {
      throw new ValidationError('No se puede agendar una cita en una fecha u hora pasada.');
    }

    const dur = duration_min ? Number(duration_min) : getDefaultDuration();
    const st = status || 'programada';
    if (!VALID_STATUSES.includes(st)) {
      throw new ValidationError(`Estado de cita no válido: ${st}`);
    }

    // Regla: evitar cruces (compara rangos [inicio, inicio+duración), no solo el instante exacto).
    const clash = findOverlap(startsSql, dur);
    if (clash) {
      throw new ValidationError('Ese horario se cruza con otra cita. Elige otro horario.');
    }

    const info = db
      .prepare(
        `INSERT INTO appointments (patient_id, title, starts_at, duration_min, status)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(patient_id, title.trim(), startsSql, dur, st);
    return appointmentService.getById(info.lastInsertRowid);
  },

  // Reprogramar: cambia fecha/hora y pasa a estado 'reprogramada'.
  reschedule(id, { starts_at }) {
    const appt = appointmentService.getById(id);
    if (!appt) throw new ValidationError('Cita no encontrada.');
    if (appt.status === 'cancelada') {
      throw new ValidationError('No se puede reprogramar una cita cancelada.');
    }
    if (!starts_at) {
      throw new ValidationError('Debe indicar la nueva fecha y hora.');
    }
    const startsSql = toSqlDateTime(starts_at);
    const nowRow = db.prepare("SELECT datetime('now','localtime') AS now").get();
    if (startsSql < nowRow.now) {
      throw new ValidationError('La nueva fecha no puede estar en el pasado.');
    }
    const clash = findOverlap(startsSql, appt.duration_min, id);
    if (clash) {
      throw new ValidationError('Ese horario se cruza con otra cita. Elige otro horario.');
    }
    db.prepare(
      `UPDATE appointments SET starts_at = ?, status = 'reprogramada' WHERE id = ?`
    ).run(startsSql, id);
    return appointmentService.getById(id);
  },

  setStatus(id, status) {
    const appt = appointmentService.getById(id);
    if (!appt) throw new ValidationError('Cita no encontrada.');
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(`Estado de cita no válido: ${status}`);
    }
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    return appointmentService.getById(id);
  },

  // Cancelar: NO se borra (regla de historial), solo cambia de estado.
  cancel(id) {
    const appt = appointmentService.getById(id);
    if (!appt) throw new ValidationError('Cita no encontrada.');
    db.prepare("UPDATE appointments SET status = 'cancelada' WHERE id = ?").run(id);
    return appointmentService.getById(id);
  },

  // Eliminación física: fuera de alcance del MVP. Se conserva el historial.
  remove(id) {
    throw new ValidationError(
      'Las citas no se eliminan: usa cancelar para mantener el historial.'
    );
  },
};
