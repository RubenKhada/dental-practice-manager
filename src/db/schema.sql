-- ============================================================
-- DENTAL PRACTICE MANAGER - Schema
-- Basado en docs/product-scope.md y docs/appointment-workflow.md
-- ============================================================

-- Pacientes (alcance MVP: registrar, editar, buscar)
CREATE TABLE IF NOT EXISTS patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Citas
-- Estados según appointment-workflow.md:
--   programada | confirmada | reprogramada | cancelada | atendida | no_asistio
-- Una cita cancelada NO se borra (se conserva para historial).
CREATE TABLE IF NOT EXISTS appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  starts_at    TEXT NOT NULL,            -- ISO 8601, ej. '2026-07-20 10:00'
  duration_min INTEGER DEFAULT 30,       -- duración predeterminada de la cita
  status       TEXT NOT NULL DEFAULT 'programada'
                 CHECK (status IN ('programada','confirmada','reprogramada','cancelada','atendida','no_asistio')),
  created_at   TEXT DEFAULT (datetime('now'))
);

-- Índice único parcial: evita cruces de horario.
-- Dos citas "activas" (todo excepto cancelada) no pueden ocupar el mismo
-- instante. Si dos pacientes agendan al mismo segundo, la BD rechaza el segundo.
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_overlap
  ON appointments (starts_at)
  WHERE status <> 'cancelada';

-- Regla de negocio documentada: duración predeterminada de la cita.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_duration_min', '30');
INSERT OR IGNORE INTO settings (key, value) VALUES ('business_timezone', 'America/Mexico_City');
