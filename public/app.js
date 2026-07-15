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

function fmt(dt) {
  const d = new Date(dt.replace(' ', 'T'));
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ---------- navegación entre vistas ----------
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const view = tab.dataset.view;
    document.getElementById('view-patients').classList.toggle('hidden', view !== 'patients');
    document.getElementById('view-appointments').classList.toggle('hidden', view !== 'appointments');
    if (view === 'appointments') loadAppointments();
  });
});

// ---------- PACIENTES ----------
async function loadPatients(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const patients = await api('GET', `/api/patients${qs}`);
  const tbody = document.querySelector('#patients-table tbody');
  tbody.innerHTML = patients
    .map(
      (p) => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.phone || '')}</td>
        <td>${esc(p.email || '')}</td>
        <td>${esc(p.notes || '')}</td>
        <td><button data-del="${p.id}">Eliminar</button></td>
      </tr>`
    )
    .join('');
}

document.getElementById('search').addEventListener('input', (e) => loadPatients(e.target.value));

document.getElementById('patient-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('patient-msg');
  const f = e.target;
  try {
    await api('POST', '/api/patients', {
      name: f.name.value,
      phone: f.phone.value,
      email: f.email.value,
      notes: f.notes.value,
    });
    f.reset();
    msg.textContent = 'Paciente registrado ✓';
    msg.className = 'msg ok';
    loadPatients();
    loadPatientOptions();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'msg err';
  }
});

document.querySelector('#patients-table').addEventListener('click', async (e) => {
  const id = e.target.dataset.del;
  if (!id) return;
  await api('DELETE', `/api/patients/${id}`);
  loadPatients();
  loadPatientOptions();
});

// ---------- AGENDA ----------
async function loadPatientOptions() {
  const patients = await api('GET', '/api/patients');
  const sel = document.querySelector('#appointment-form select[name="patient_id"]');
  sel.innerHTML =
    '<option value="">Selecciona un paciente *</option>' +
    patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
}

async function loadAppointments() {
  const appts = await api('GET', '/api/appointments');
  const tbody = document.querySelector('#appointments-table tbody');
  tbody.innerHTML = appts
    .map(
      (a) => `
      <tr>
        <td>${fmt(a.starts_at)}</td>
        <td>${esc(a.patient_name || '(sin paciente)')}</td>
        <td>${esc(a.title)}</td>
        <td><span class="badge ${a.status}">${STATUS_LABELS[a.status] || a.status}</span></td>
        <td>
          <button data-confirm="${a.id}">Confirmar</button>
          <button data-attended="${a.id}">Atendida</button>
          <button data-cancel="${a.id}">Cancelar</button>
        </td>
      </tr>`
    )
    .join('');
}

document.getElementById('appointment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('appointment-msg');
  const f = e.target;
  try {
    await api('POST', '/api/appointments', {
      patient_id: Number(f.patient_id.value),
      title: f.title.value,
      starts_at: f.starts_at.value, // datetime-local -> 'YYYY-MM-DDTHH:mm'
      duration_min: f.duration_min.value || undefined,
    });
    f.reset();
    f.duration_min.value = 30;
    msg.textContent = 'Cita agendada ✓';
    msg.className = 'msg ok';
    loadAppointments();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'msg err';
  }
});

document.querySelector('#appointments-table').addEventListener('click', async (e) => {
  const id = e.target.dataset.confirm || e.target.dataset.attended || e.target.dataset.cancel;
  if (!id) return;
  try {
    if (e.target.dataset.confirm) await api('PATCH', `/api/appointments/${id}/status`, { status: 'confirmada' });
    if (e.target.dataset.attended) await api('PATCH', `/api/appointments/${id}/status`, { status: 'atendida' });
    if (e.target.dataset.cancel) await api('POST', `/api/appointments/${id}/cancel`);
    loadAppointments();
  } catch (err) {
    alert(err.message);
  }
});

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---------- arranque ----------
loadPatients();
loadPatientOptions();
