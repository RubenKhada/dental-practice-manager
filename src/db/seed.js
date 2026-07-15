// Datos de ejemplo (semilla). Ejecuta con: npm run seed
import { initSchema, db } from './connection.js';
import { patientService } from '../services/patientService.js';
import { appointmentService } from '../services/appointmentService.js';

initSchema();

// Pacientes de ejemplo (datos ficticios, sin info real)
const ejemplos = [
  { name: 'Ana Pérez', phone: '555-0101', email: 'ana@example.com', notes: 'Limpieza cada 6 meses' },
  { name: 'Luis Gómez', phone: '555-0102', email: 'luis@example.com', notes: 'Sensibilidad en molar' },
  { name: 'María Torres', phone: '555-0103', email: 'maria@example.com', notes: '' },
];
const creados = ejemplos.map((p) => patientService.create(p));

// Una cita de ejemplo para mañana a las 10:00
const manana = new Date();
manana.setDate(manana.getDate() + 1);
manana.setHours(10, 0, 0, 0);
const iso = manana.toISOString().slice(0, 16);

appointmentService.create({
  patient_id: creados[0].id,
  title: 'Limpieza dental',
  starts_at: iso,
  status: 'confirmada',
});

console.log('Semilla cargada: 3 pacientes y 1 cita de ejemplo.');
console.log('Pacientes:', creados.map((p) => `#${p.id} ${p.name}`).join(', '));
