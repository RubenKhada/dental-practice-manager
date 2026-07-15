// Rutas de Citas (capa de transporte HTTP)
import express from 'express';
import { appointmentService } from '../services/appointmentService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(appointmentService.list());
});

// Crear cita
router.post('/', (req, res) => {
  const a = appointmentService.create(req.body);
  res.status(201).json(a);
});

// Reprogramar (nueva fecha/hora)
router.patch('/:id/reschedule', (req, res) => {
  const a = appointmentService.reschedule(Number(req.params.id), req.body);
  res.json(a);
});

// Cambiar estado (confirmada | atendida | no_asistio | cancelada ...)
router.patch('/:id/status', (req, res) => {
  const a = appointmentService.setStatus(Number(req.params.id), req.body.status);
  res.json(a);
});

// Cancelar (mantiene historial)
router.post('/:id/cancel', (req, res) => {
  const a = appointmentService.cancel(Number(req.params.id));
  res.json(a);
});

export default router;
