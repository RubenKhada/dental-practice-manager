// Rutas de Pacientes (capa de transporte HTTP)
// Las rutas NO contienen reglas de negocio: solo llaman a patientService.
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { patientService, ValidationError } from '../services/patientService.js';
import { appointmentService } from '../services/appointmentService.js';
import { documentService, UPLOADS_DIR } from '../services/documentService.js';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new ValidationError('Tipo de archivo no permitido. Usa imagen (JPG/PNG/WEBP) o PDF.'));
    }
    cb(null, true);
  },
});

router.get('/', (req, res) => {
  res.json(patientService.list({ search: req.query.search }));
});

router.get('/:id', (req, res) => {
  const p = patientService.getById(Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Paciente no encontrado.' });
  res.json(p);
});

// Historial de citas del paciente (pasadas y futuras).
router.get('/:id/appointments', (req, res) => {
  res.json(appointmentService.listByPatient(Number(req.params.id)));
});

// Expediente clínico: notas, recetas y radiografías.
router.get('/:id/documents', (req, res) => {
  res.json(documentService.listByPatient(Number(req.params.id)));
});

router.post('/:id/documents', upload.single('file'), (req, res) => {
  const doc = documentService.create({
    patient_id: Number(req.params.id),
    type: req.body.type,
    note_text: req.body.note_text,
    file: req.file,
  });
  res.status(201).json(doc);
});

router.delete('/:id/documents/:docId', (req, res) => {
  documentService.remove(Number(req.params.docId));
  res.status(204).end();
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
  const id = Number(req.params.id);
  documentService.removeAllForPatient(id); // limpia archivos en disco antes del CASCADE
  patientService.remove(id);
  res.status(204).end();
});

export default router;
