// ============================================================
// Frontend vanilla: consume la API REST del backend.
// Ninguna regla de negocio vive aquí: solo pide datos al servidor
// y los muestra. La validación (cruces, fechas pasadas) está en el
// servicio del backend.
// ============================================================

const STATUS_LABELS = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  reprogramada: 'Reprogramada',
  cancelada: 'Cancelada',
  atendida: 'Atendida',
  no_asistio: 'No asistió',
};

// Estados en los que una cita todavía admite acciones (no es historial cerrado).
const ACTIVE_STATUSES = ['programada', 'confirmada', 'reprogramada'];

// ---------- utilidades ----------
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ocurrió un error.');
  return data;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function toDate(dt) {
  return new Date(dt.replace(' ', 'T'));
}

function fmtTime(dt) {
  return toDate(dt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateHeading(dt) {
  return toDate(dt).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' });
}

function fmtDateShort(dt) {
  return toDate(dt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// 'YYYY-MM-DD HH:mm' (SQL) -> 'YYYY-MM-DDTHH:mm' (input datetime-local)
function toInputDateTime(sql) {
  return sql.replace(' ', 'T').slice(0, 16);
}

// ---------- navegación entre vistas ----------
function showView(view) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  document.getElementById('view-agenda').classList.toggle('hidden', view !== 'agenda');
  document.getElementById('view-patients').classList.toggle('hidden', view !== 'patients');
  document.getElementById('view-settings').classList.toggle('hidden', view !== 'settings');
  if (view === 'agenda') loadAppointments();
  if (view === 'patients') loadPatients();
  if (view === 'settings') loadSettings();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
});
document.querySelectorAll('[data-view-link]').forEach((el) => {
  el.addEventListener('click', () => showView(el.dataset.viewLink));
});

// ---------- modales ----------
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.querySelectorAll('[data-close-modal]').forEach((el) => {
  el.addEventListener('click', () => closeModal(el.dataset.closeModal));
});
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ---------- PACIENTES ----------
let patientsCache = [];

async function loadPatients(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const patients = await api('GET', `/api/patients${qs}`);
  patientsCache = patients;
  const list = document.getElementById('patients-list');

  if (patients.length === 0) {
    list.innerHTML = '<p class="empty-state">No hay pacientes registrados todavía.</p>';
    return;
  }

  list.innerHTML = patients
    .map(
      (p) => `
      <article class="patient-card">
        <div class="patient-info">
          <div class="patient-avatar">${esc(initials(p.name))}</div>
          <div>
            <span class="patient-name">${esc(p.name)}</span>
            <span class="patient-meta">${esc(p.phone || p.email || 'Sin contacto registrado')}</span>
          </div>
        </div>
        <div class="patient-actions">
          <button class="btn-link" data-view-patient="${p.id}">Ver</button>
          <button class="btn-link primary" data-schedule="${p.id}">Agendar</button>
          <button class="btn-link" data-edit="${p.id}">Editar</button>
          <button class="btn-link danger" data-del="${p.id}">Eliminar</button>
        </div>
      </article>`
    )
    .join('');
}

document.getElementById('search').addEventListener('input', (e) => loadPatients(e.target.value));

function openPatientModal(patient) {
  const form = document.getElementById('patient-form');
  form.reset();
  form.id.value = patient?.id || '';
  if (patient) {
    form.name.value = patient.name || '';
    form.phone.value = patient.phone || '';
    form.email.value = patient.email || '';
    form.notes.value = patient.notes || '';
  }
  document.getElementById('patient-modal-title').textContent = patient ? 'Editar paciente' : 'Nuevo paciente';
  document.getElementById('patient-submit').textContent = patient ? 'Guardar cambios' : 'Registrar';
  document.getElementById('patient-msg').textContent = '';
  openModal('modal-patient');
}

document.getElementById('btn-new-patient').addEventListener('click', () => openPatientModal(null));

document.getElementById('patient-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('patient-msg');
  const f = e.target;
  const payload = {
    name: f.name.value,
    phone: f.phone.value,
    email: f.email.value,
    notes: f.notes.value,
  };
  try {
    if (f.id.value) {
      await api('PUT', `/api/patients/${f.id.value}`, payload);
    } else {
      await api('POST', '/api/patients', payload);
    }
    closeModal('modal-patient');
    loadPatients();
    loadPatientOptions();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-msg err';
  }
});

document.getElementById('patients-list').addEventListener('click', async (e) => {
  const delId = e.target.dataset.del;
  const scheduleId = e.target.dataset.schedule;
  const editId = e.target.dataset.edit;
  const viewId = e.target.dataset.viewPatient;

  if (delId) {
    if (!confirm('¿Eliminar este paciente? Esta acción no se puede deshacer.')) return;
    await api('DELETE', `/api/patients/${delId}`);
    loadPatients();
    loadPatientOptions();
    return;
  }

  if (editId) {
    const patient = patientsCache.find((p) => String(p.id) === editId);
    if (patient) openPatientModal(patient);
    return;
  }

  if (scheduleId) {
    await openNewAppointmentModal(scheduleId);
    return;
  }

  if (viewId) {
    await openPatientDetailModal(viewId);
  }
});

// ---------- FICHA DEL PACIENTE (detalle + historial) ----------
async function openPatientDetailModal(patientId) {
  const patient = patientsCache.find((p) => String(p.id) === String(patientId))
    || (await api('GET', `/api/patients/${patientId}`));

  document.getElementById('patient-detail-name').textContent = patient.name;
  document.getElementById('patient-detail-info').innerHTML = `
    <span class="patient-detail-line"><strong>Teléfono:</strong> ${esc(patient.phone || '—')}</span>
    <span class="patient-detail-line"><strong>Correo:</strong> ${esc(patient.email || '—')}</span>
    ${patient.notes ? `<span class="patient-detail-line"><strong>Notas:</strong> ${esc(patient.notes)}</span>` : ''}
  `;
  document.getElementById('patient-detail-new-appointment').onclick = async () => {
    closeModal('modal-patient-detail');
    await openNewAppointmentModal(patientId);
  };

  const appts = await api('GET', `/api/patients/${patientId}/appointments`);
  const list = document.getElementById('patient-detail-appointments');
  if (appts.length === 0) {
    list.innerHTML = '<p class="empty-state">Este paciente aún no tiene citas.</p>';
  } else {
    const now = new Date();
    list.innerHTML = appts
      .map((a) => {
        const isPast = toDate(a.starts_at) < now;
        return `
        <article class="appointment-card history-card${isPast ? ' is-past' : ''}">
          <div class="appointment-main">
            <div class="appointment-when">
              <span class="appointment-time">${fmtDateShort(a.starts_at)}</span>
              <span class="appointment-duration">${fmtTime(a.starts_at)}</span>
            </div>
            <div class="appointment-divider"></div>
            <div>
              <span class="appointment-title">${esc(a.title)}</span>
            </div>
          </div>
          <span class="status-pill">
            <span class="status-dot ${a.status}"></span>
            ${esc(STATUS_LABELS[a.status] || a.status)}
          </span>
        </article>`;
      })
      .join('');
  }

  openModal('modal-patient-detail');
}

// ---------- AGENDA ----------
async function loadPatientOptions() {
  const patients = await api('GET', '/api/patients');
  const sel = document.getElementById('appointment-patient');
  const current = sel.value;
  sel.innerHTML =
    '<option value="">Selecciona un paciente</option>' +
    patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  if (current) sel.value = current;
}

async function openNewAppointmentModal(preselectPatientId) {
  await loadPatientOptions();
  document.getElementById('appointment-form').reset();
  document.getElementById('appointment-duration').value = 30;
  document.getElementById('appointment-msg').textContent = '';
  if (preselectPatientId) {
    document.getElementById('appointment-patient').value = preselectPatientId;
  }
  openModal('modal-appointment');
}

document.getElementById('btn-new-appointment').addEventListener('click', () => openNewAppointmentModal());

document.getElementById('appointment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('appointment-msg');
  const f = e.target;
  try {
    await api('POST', '/api/appointments', {
      patient_id: Number(f.patient_id.value),
      title: f.title.value,
      starts_at: f.starts_at.value,
      duration_min: f.duration_min.value || undefined,
    });
    closeModal('modal-appointment');
    loadAppointments();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-msg err';
  }
});

function actionsFor(a) {
  if (!ACTIVE_STATUSES.includes(a.status)) return '';
  const buttons = [];
  if (a.status !== 'confirmada') {
    buttons.push(`<button class="btn-link primary" data-status="confirmada" data-id="${a.id}">Confirmar</button>`);
  }
  buttons.push(`<button class="btn-link" data-reschedule="${a.id}" data-starts="${a.starts_at}">Reprogramar</button>`);
  buttons.push(`<button class="btn-link" data-status="atendida" data-id="${a.id}">Atendida</button>`);
  buttons.push(`<button class="btn-link" data-status="no_asistio" data-id="${a.id}">No asistió</button>`);
  buttons.push(`<button class="btn-link danger" data-cancel="${a.id}">Cancelar</button>`);
  return buttons.join('');
}

// Calcula, a partir de las citas ya cargadas, qué necesita atención hoy:
// citas de hoy sin confirmar y citas de mañana (recordatorio próximo).
// Es puramente informativo: el envío automático de recordatorios aún no
// está implementado (ver Configuración > Recordatorios).
function renderReminders(appts) {
  const section = document.getElementById('reminders-section');
  const list = document.getElementById('reminders-list');

  const today = new Date();
  const todayStr = today.toLocaleDateString('sv-SE'); // YYYY-MM-DD, invariante de idioma
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('sv-SE');

  const reminders = [];
  for (const a of appts) {
    const day = a.starts_at.slice(0, 10);
    const who = a.patient_name || 'Paciente sin nombre';
    if (day === todayStr && a.status === 'programada') {
      reminders.push({
        type: 'unconfirmed',
        icon: '⚠️',
        html: `<strong>${esc(who)}</strong> no ha confirmado su cita de hoy a las ${fmtTime(a.starts_at)}`,
      });
    } else if (day === tomorrowStr && ACTIVE_STATUSES.includes(a.status)) {
      reminders.push({
        type: 'upcoming',
        icon: '🔔',
        html: `Recordar a <strong>${esc(who)}</strong>: cita mañana a las ${fmtTime(a.starts_at)}`,
      });
    }
  }

  if (reminders.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  list.innerHTML = reminders
    .map(
      (r) => `
      <div class="reminder-card ${r.type}">
        <span class="reminder-icon">${r.icon}</span>
        <span class="reminder-text">${r.html}</span>
      </div>`
    )
    .join('');
}

// ---------- franja semanal (calendario no invasivo) ----------
let appointmentsCache = [];
let weekAnchor = new Date();
let selectedDate = null; // 'YYYY-MM-DD' o null (ver todas las citas)

function toDateKey(d) {
  return d.toLocaleDateString('sv-SE'); // YYYY-MM-DD, invariante de idioma
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=domingo..6=sábado
  date.setDate(date.getDate() + ((day === 0 ? -6 : 1) - day)); // retrocede a lunes
  date.setHours(0, 0, 0, 0);
  return date;
}

function renderWeekStrip() {
  const container = document.getElementById('week-days');
  const monday = startOfWeek(weekAnchor);
  const todayKey = toDateKey(new Date());

  const cells = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const label = d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
    const isToday = key === todayKey;
    const isSelected = key === selectedDate;
    cells.push(`
      <button type="button" class="day-pill${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}" data-day="${key}">
        <span class="day-pill-label">${esc(label)}</span>
        <span class="day-pill-num">${d.getDate()}</span>
      </button>`);
  }
  container.innerHTML = cells.join('');
}

document.getElementById('week-prev').addEventListener('click', () => {
  weekAnchor = new Date(weekAnchor);
  weekAnchor.setDate(weekAnchor.getDate() - 7);
  renderWeekStrip();
});
document.getElementById('week-next').addEventListener('click', () => {
  weekAnchor = new Date(weekAnchor);
  weekAnchor.setDate(weekAnchor.getDate() + 7);
  renderWeekStrip();
});
document.getElementById('week-days').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-day]');
  if (!btn) return;
  // Clic de nuevo sobre el día ya seleccionado = quitar el filtro (ver todas).
  selectedDate = selectedDate === btn.dataset.day ? null : btn.dataset.day;
  renderWeekStrip();
  renderAppointmentsList(appointmentsCache);
});

function renderAppointmentsList(appts) {
  const list = document.getElementById('appointments-list');
  const filtered = selectedDate
    ? appts.filter((a) => a.starts_at.slice(0, 10) === selectedDate)
    : appts;

  if (filtered.length === 0) {
    list.innerHTML = selectedDate
      ? '<p class="empty-state">No hay citas ese día.</p>'
      : '<p class="empty-state">No hay citas agendadas todavía.</p>';
    return;
  }

  let lastDay = null;
  const html = [];
  for (const a of filtered) {
    const day = a.starts_at.slice(0, 10);
    if (day !== lastDay) {
      if (!selectedDate) html.push(`<div class="date-divider">${esc(fmtDateHeading(a.starts_at))}</div>`);
      lastDay = day;
    }
    html.push(`
      <article class="appointment-card">
        <div class="appointment-main">
          <div class="appointment-when">
            <span class="appointment-time">${fmtTime(a.starts_at)}</span>
            <span class="appointment-duration">${a.duration_min} min</span>
          </div>
          <div class="appointment-divider"></div>
          <div>
            <span class="appointment-patient">${esc(a.patient_name || '(sin paciente)')}</span>
            <span class="appointment-title">${esc(a.title)}</span>
          </div>
        </div>
        <div class="appointment-right">
          <span class="status-pill">
            <span class="status-dot ${a.status}"></span>
            ${esc(STATUS_LABELS[a.status] || a.status)}
          </span>
          <div class="appointment-actions">${actionsFor(a)}</div>
        </div>
      </article>`);
  }
  list.innerHTML = html.join('');
}

async function loadAppointments() {
  const dateEl = document.getElementById('agenda-date');
  dateEl.textContent = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const appts = await api('GET', '/api/appointments');
  appointmentsCache = appts;
  renderReminders(appts);
  renderWeekStrip();
  renderAppointmentsList(appts);
}

document.getElementById('appointments-list').addEventListener('click', async (e) => {
  const t = e.target;
  try {
    if (t.dataset.status) {
      await api('PATCH', `/api/appointments/${t.dataset.id}/status`, { status: t.dataset.status });
      loadAppointments();
    } else if (t.dataset.cancel) {
      if (!confirm('¿Cancelar esta cita?')) return;
      await api('POST', `/api/appointments/${t.dataset.cancel}/cancel`);
      loadAppointments();
    } else if (t.dataset.reschedule) {
      const form = document.getElementById('reschedule-form');
      form.reset();
      form.appointment_id.value = t.dataset.reschedule;
      form.starts_at.value = toInputDateTime(t.dataset.starts);
      document.getElementById('reschedule-msg').textContent = '';
      openModal('modal-reschedule');
    }
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('reschedule-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('reschedule-msg');
  const f = e.target;
  try {
    await api('PATCH', `/api/appointments/${f.appointment_id.value}/reschedule`, {
      starts_at: f.starts_at.value,
    });
    closeModal('modal-reschedule');
    loadAppointments();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-msg err';
  }
});

// ---------- CONFIGURACIÓN ----------
document.querySelectorAll('#reminder-channel-select .pill-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#reminder-channel-select .pill-option').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('setting-reminder-channel').value = btn.dataset.channel;
  });
});

async function loadSettings() {
  const settings = await api('GET', '/api/settings');
  const f = document.getElementById('settings-form');
  f.business_name.value = settings.business_name;
  f.business_phone.value = settings.business_phone;
  f.business_email.value = settings.business_email;
  f.opening_time.value = settings.opening_time;
  f.closing_time.value = settings.closing_time;
  f.default_duration_min.value = settings.default_duration_min;
  f.reminder_lead_hours.value = settings.reminder_lead_hours;
  f.reminder_confirm_enabled.checked = settings.reminder_confirm_enabled === 'true';
  document.getElementById('setting-reminder-channel').value = settings.reminder_channel;
  document.querySelectorAll('#reminder-channel-select .pill-option').forEach((b) => {
    b.classList.toggle('selected', b.dataset.channel === settings.reminder_channel);
  });
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('settings-msg');
  const f = e.target;
  try {
    await api('PUT', '/api/settings', {
      business_name: f.business_name.value,
      business_phone: f.business_phone.value,
      business_email: f.business_email.value,
      opening_time: f.opening_time.value,
      closing_time: f.closing_time.value,
      default_duration_min: f.default_duration_min.value,
      reminder_channel: f.reminder_channel.value,
      reminder_lead_hours: f.reminder_lead_hours.value,
      reminder_confirm_enabled: f.reminder_confirm_enabled.checked,
    });
    msg.textContent = 'Configuración guardada ✓';
    msg.className = 'form-msg ok';
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'form-msg err';
  }
});

// ---------- arranque ----------
loadAppointments();
loadPatientOptions();
