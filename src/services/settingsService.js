// ============================================================
// Capa de servicios: CONFIGURACIÓN (settings)
// Almacena preferencias del consultorio en la tabla clave/valor
// `settings`. Algunas de estas preferencias (horario, recordatorios)
// son informativas por ahora: aún no se validan ni se envían
// automáticamente (ver docs/product-scope.md, decisiones pendientes).
// ============================================================
import { db } from '../db/connection.js';

const DEFAULTS = {
  business_name: '',
  business_phone: '',
  business_email: '',
  opening_time: '09:00',
  closing_time: '18:00',
  default_duration_min: '30',
  reminder_channel: 'whatsapp',
  reminder_lead_hours: '24',
  reminder_confirm_enabled: 'true',
};

export const settingsService = {
  getAll() {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...stored };
  },

  update(partial) {
    const upsert = db.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    );
    for (const key of Object.keys(DEFAULTS)) {
      if (partial[key] === undefined) continue;
      upsert.run(key, String(partial[key]));
    }
    return settingsService.getAll();
  },
};
