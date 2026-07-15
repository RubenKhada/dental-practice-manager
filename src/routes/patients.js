// Rutas de Pacientes (capa de transporte HTTP)
// Las rutas NO contienen reglas de negocio: solo llaman a patientService.
import express from 'express';
import { patientService, ValidationError } from '../services/patientService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(patientService.list({ search: req.query.search }));
});

router.get('/:id', (req, res) => {
  const p = patientService.getById(Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Paciente no encontrado.' });
  res.json(p);
});

router.post('/', (req, res) => {
  const p = patientService.create(req.body);
  res.status(201).json(p);
});

router.put('/:id', (req, res) => {
  const p = patientService.update(Number(req.params.id), req.body);
  res.json(p);
});

router.delete('/:id', (req, res) => {
  patientService.remove(Number(req.params.id));
  res.status(204).end();
});

export default router;
