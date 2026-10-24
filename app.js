/**
 * TecmiGYM Survey — EJENEX × Universidad Tecmilenio
 * Desarrollado y diseñado por Atoms Technologies (https://atomstech.info)
 */

const STORAGE_KEY = 'tecmigym_ejenex_responses_v1';
const ADMIN_PIN = '2026';

const QUESTIONS_SCHEMA = [
  {
    id: 'q1',
    number: '01',
    title: '¿Te han puesto en lista de espera para entrar al gym?',
    type: 'single',
    options: ['Sí', 'No']
  },
  {
    id: 'q2',
    number: '02',
    title: '¿Has perdido tu turno para entrar al Gym?',
    type: 'single',
    options: ['Sí', 'No']
  },
  {
    id: 'q3',
    number: '03',
    title: '¿Te gustaría tener una aplicación para saber la disponibilidad del Gimnasio?',
    type: 'single',
    options: ['Sí', 'No']
  },
  {
    id: 'q4',
    number: '04',
    title: '¿Qué preferirías: descargar una App o acceder por una Web para tu TecmiGym?',
    type: 'single',
    options: ['App', 'Web']
  },
  {
    id: 'q5',
    number: '05',
    title: 'Horarios de mayor demanda: ¿En qué momento del día sueles intentar ir al gimnasio?',
    type: 'multiple',
    options: [
      'Mañana antes de clases',
      'Al mediodía / Entre clases',
      'En la tarde / Noche'
    ]
  },
  {
    id: 'q6',
    number: '06',
    title: 'Interés en gamificación: ¿Qué tipo de dinámica te motivaría más a mantener tus visitas al gimnasio?',
    type: 'single',
    options: [
      'Competir en un ranking con amigos',
      'Ganar insignias digitales por rachas de asistencia',
      'Ninguna / Prefiero entrenar solo'
    ]
  },
  {
    id: 'q7',
    number: '07',
    title: 'Tolerancia de espera: ¿Cuánto tiempo estarías dispuesto a esperar por tu turno si la aplicación te notifica que el gimnasio está lleno?',
    type: 'single',
    options: [
      'Menos de 10 minutos',
      'Entre 10 y 20 minutos',
      'Más de 20 minutos',
      'Prefiero cancelar mi visita'
    ]
  },
  {
    id: 'q8',
    number: '08',
    title: 'Funcionalidades clave: Además de conocer el aforo en tiempo real, ¿qué otra función consideras indispensable?',
    type: 'multiple',
    options: [
      'Reservar aparatos o áreas específicas',
      'Recibir notificaciones push cuando se libere un lugar',
      'Crear y guardar rutinas'
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let isPinUnlocked = false;

  const form = document.getElementById('tecmiGymForm');
  const inputNombre = document.getElementById('inputNombre');
  const inputCorreo = document.getElementById('inputCorreo');
  const groupNombre = document.getElementById('group-nombre');
  const groupCorreo = document.getElementById('group-correo');
  const cardIdentity = document.getElementById('card-identity');

  const topProgressFill = document.getElementById('topProgressFill');
  const topProgressBarContainer = document.getElementById('topProgressBarContainer');
  const progressCountText = document.getElementById('progressCountText');
  const totalResponsesBadge = document.getElementById('totalResponsesBadge');
  const kpiTotalCount = document.getElementById('kpiTotalCount');
  const successStateCard = document.getElementById('successStateCard');
  const submittedSummaryBox = document.getElementById('submittedSummaryBox');
  const participantsTableBody = document.getElementById('participantsTableBody');

  const btnViewForm = document.getElementById('btnViewForm');
  const btnViewDashboard = document.getElementById('btnViewDashboard');
  const formView = document.getElementById('formView');
  const dashboardView = document.getElementById('dashboardView');

  const btnClearForm = document.getElementById('btnClearForm');
  const btnNewResponse = document.getElementById('btnNewResponse');
  const btnGoToDashboard = document.getElementById('btnGoToDashboard');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnSeedDemoData = document.getElementById('btnSeedDemoData');
  const btnResetAllData = document.getElementById('btnResetAllData');
  const btnLockSession = document.getElementById('btnLockSession');

  // Elementos del Modal PIN
  const pinModalBackdrop = document.getElementById('pinModalBackdrop');
  const pinModalCard = document.getElementById('pinModalCard');
  const btnClosePinModal = document.getElementById('btnClosePinModal');
  const pinForm = document.getElementById('pinForm');
  const pinDigits = Array.from(document.querySelectorAll('.pin-digit'));
  const pinErrorMsg = document.getElementById('pinErrorMsg');

  // --- Almacenamiento Local ---
  function getStoredResponses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredResponses(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    updateBadgeCount();
  }

  function updateBadgeCount() {
    const count = getStoredResponses().length;
    totalResponsesBadge.textContent = count;
    kpiTotalCount.textContent = count;
  }

  // --- Validación de Nombre y Correo Institucional ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isIdentityComplete() {
    const hasName = inputNombre.value.trim().length >= 2;
    const hasEmail = isValidEmail(inputCorreo.value);
    return hasName && hasEmail;
  }

  // --- Progreso y Lectura de Respuestas ---
  function getQuestionAnswer(qSchema) {
    if (qSchema.type === 'single') {
      const checked = form.querySelector(`input[name="${qSchema.id}"]:checked`);
      return checked ? checked.value : null;
    } else {
      const checkedList = Array.from(form.querySelectorAll(`input[name="${qSchema.id}"]:checked`));
      return checkedList.map((el) => el.value);
    }
  }

  function isQuestionAnswered(qSchema) {
    const ans = getQuestionAnswer(qSchema);
    if (qSchema.type === 'single') return Boolean(ans);
    return Array.isArray(ans) && ans.length > 0;
  }

  function updateLiveProgress() {
    let answeredCount = 0;

    if (isIdentityComplete()) {
      cardIdentity.classList.add('is-answered');
      cardIdentity.classList.remove('has-error');
    } else {
      cardIdentity.classList.remove('is-answered');
    }

    QUESTIONS_SCHEMA.forEach((q) => {
      const card = document.getElementById(`card-${q.id}`);
      const answered = isQuestionAnswered(q);
      if (answered) {
        answeredCount++;
        card.classList.add('is-answered');
        card.classList.remove('has-error');
      } else {
        card.classList.remove('is-answered');
      }
    });

    const total = QUESTIONS_SCHEMA.length;
    const totalSteps = total + 1;
    const completedSteps = answeredCount + (isIdentityComplete() ? 1 : 0);
    const pct = Math.round((completedSteps / totalSteps) * 100);
    topProgressFill.style.width = `${pct}%`;
    topProgressBarContainer.setAttribute('aria-valuenow', String(pct));
    progressCountText.textContent = `${answeredCount} de ${total}`;
  }

  form.addEventListener('change', updateLiveProgress);
  inputNombre.addEventListener('input', () => {
    if (inputNombre.value.trim().length >= 2) {
      groupNombre.classList.remove('has-error');
    }
    updateLiveProgress();
  });
  inputCorreo.addEventListener('input', () => {
    if (isValidEmail(inputCorreo.value)) {
      groupCorreo.classList.remove('has-error');
    }
    updateLiveProgress();
  });

  // --- Envío del Formulario ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalidCard = null;

    const nombreVal = inputNombre.value.trim();
    const correoVal = inputCorreo.value.trim();

    if (nombreVal.length < 2) {
      groupNombre.classList.add('has-error');
      cardIdentity.classList.add('has-error');
      firstInvalidCard = cardIdentity;
    } else {
      groupNombre.classList.remove('has-error');
    }

    if (!isValidEmail(correoVal)) {
      groupCorreo.classList.add('has-error');
      cardIdentity.classList.add('has-error');
      if (!firstInvalidCard) firstInvalidCard = cardIdentity;
    } else {
      groupCorreo.classList.remove('has-error');
    }

    if (nombreVal.length >= 2 && isValidEmail(correoVal)) {
      cardIdentity.classList.remove('has-error');
    }

    const submissionPayload = {
      id: 'resp_' + Date.now(),
      timestamp: new Date().toISOString(),
      nombre: nombreVal,
      correo: correoVal
    };

    QUESTIONS_SCHEMA.forEach((q) => {
      const card = document.getElementById(`card-${q.id}`);
      const answered = isQuestionAnswered(q);
      if (!answered) {
        card.classList.add('has-error');
        if (!firstInvalidCard) firstInvalidCard = card;
      } else {
        card.classList.remove('has-error');
        submissionPayload[q.id] = getQuestionAnswer(q);
      }
    });

    if (firstInvalidCard) {
      firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Completa tus datos y todas las preguntas obligatorias');
      return;
    }

    const allResponses = getStoredResponses();
    allResponses.push(submissionPayload);
    saveStoredResponses(allResponses);

    renderSubmissionSummary(submissionPayload);
    form.classList.add('hidden');
    successStateCard.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Respuesta guardada correctamente');
  });

  function renderSubmissionSummary(payload) {
    const identityRows = `
      <div class="summary-row">
        <span class="summary-q">Nombre completo</span>
        <span class="summary-a">${escapeHtml(payload.nombre)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-q">Correo institucional</span>
        <span class="summary-a">${escapeHtml(payload.correo)}</span>
      </div>
    `;

    const questionRows = QUESTIONS_SCHEMA.map((q) => {
      const val = payload[q.id];
      const formatted = Array.isArray(val) ? val.join(', ') : val;
      return `
        <div class="summary-row">
          <span class="summary-q">${q.number}. ${q.title}</span>
          <span class="summary-a">${escapeHtml(formatted)}</span>
        </div>
      `;
    }).join('');

    submittedSummaryBox.innerHTML = identityRows + questionRows;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  btnClearForm.addEventListener('click', () => {
    form.reset();
    cardIdentity.classList.remove('has-error', 'is-answered');
    groupNombre.classList.remove('has-error');
    groupCorreo.classList.remove('has-error');
    QUESTIONS_SCHEMA.forEach((q) => {
      const card = document.getElementById(`card-${q.id}`);
      card.classList.remove('has-error', 'is-answered');
    });
    updateLiveProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Formulario limpio');
  });

  btnNewResponse.addEventListener('click', () => {
    form.reset();
    updateLiveProgress();
    successStateCard.classList.add('hidden');
    form.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Sistema de Bloqueo por PIN (2026) ---
  function openPinModal() {
    pinErrorMsg.classList.add('hidden');
    pinDigits.forEach((input) => { input.value = ''; });
    pinModalBackdrop.classList.remove('hidden');
    setTimeout(() => {
      pinDigits[0].focus();
    }, 40);
  }

  function closePinModal() {
    pinModalBackdrop.classList.add('hidden');
    pinDigits.forEach((input) => { input.value = ''; });
  }

  function verifyEnteredPin() {
    const code = pinDigits.map((input) => input.value.trim()).join('');
    if (code === ADMIN_PIN) {
      isPinUnlocked = true;
      closePinModal();
      activateDashboardView();
      showToast('Acceso concedido');
    } else {
      pinErrorMsg.classList.remove('hidden');
      pinModalCard.classList.remove('shake');
      void pinModalCard.offsetWidth; // reflow
      pinModalCard.classList.add('shake');
      pinDigits.forEach((input) => { input.value = ''; });
      pinDigits[0].focus();
    }
  }

  pinDigits.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(-1);
      pinErrorMsg.classList.add('hidden');

      if (e.target.value && idx < pinDigits.length - 1) {
        pinDigits[idx + 1].focus();
      }

      const fullCode = pinDigits.map((el) => el.value).join('');
      if (fullCode.length === 4) {
        verifyEnteredPin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        pinDigits[idx - 1].focus();
      } else if (e.key === 'Escape') {
        closePinModal();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
      pasted.split('').forEach((char, i) => {
        if (pinDigits[i]) pinDigits[i].value = char;
      });
      if (pasted.length === 4) {
        verifyEnteredPin();
      } else if (pinDigits[pasted.length]) {
        pinDigits[pasted.length].focus();
      }
    });
  });

  pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    verifyEnteredPin();
  });

  btnClosePinModal.addEventListener('click', closePinModal);
  pinModalBackdrop.addEventListener('click', (e) => {
    if (e.target === pinModalBackdrop) closePinModal();
  });

  // --- Cambio de Vistas ---
  function activateDashboardView() {
    formView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    btnViewForm.classList.remove('active');
    btnViewForm.setAttribute('aria-selected', 'false');
    btnViewDashboard.classList.add('active');
    btnViewDashboard.setAttribute('aria-selected', 'true');
    renderDashboardCharts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function activateFormView() {
    dashboardView.classList.add('hidden');
    formView.classList.remove('hidden');
    btnViewDashboard.classList.remove('active');
    btnViewDashboard.setAttribute('aria-selected', 'false');
    btnViewForm.classList.add('active');
    btnViewForm.setAttribute('aria-selected', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function requestDashboardAccess() {
    if (isPinUnlocked) {
      activateDashboardView();
    } else {
      openPinModal();
    }
  }

  btnViewForm.addEventListener('click', activateFormView);
  btnViewDashboard.addEventListener('click', requestDashboardAccess);
  btnGoToDashboard.addEventListener('click', requestDashboardAccess);

  btnLockSession.addEventListener('click', () => {
    isPinUnlocked = false;
    activateFormView();
    showToast('Sesión de administrador bloqueada');
  });

  // --- Gráficas de Resultados y Tabla de Participantes ---
  function renderDashboardCharts() {
    const responses = getStoredResponses();
    const total = responses.length;
    updateBadgeCount();

    const container = document.getElementById('chartsContainer');
    container.innerHTML = QUESTIONS_SCHEMA.map((q) => {
      const counts = {};
      q.options.forEach((opt) => { counts[opt] = 0; });

      responses.forEach((resp) => {
        const ans = resp[q.id];
        if (Array.isArray(ans)) {
          ans.forEach((item) => {
            if (counts[item] !== undefined) counts[item]++;
          });
        } else if (ans && counts[ans] !== undefined) {
          counts[ans]++;
        }
      });

      const barsHtml = q.options.map((opt) => {
        const count = counts[opt] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-option-name">${opt}</span>
              <span class="bar-option-stats">${count} (${pct}%)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="chart-card">
          <h3 class="chart-card-title">${q.number}. ${q.title}</h3>
          ${barsHtml}
        </article>
      `;
    }).join('');

    // Renderizar tabla de estudiantes
    if (responses.length === 0) {
      participantsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-msg">Aún no hay respuestas registradas.</td>
        </tr>
      `;
    } else {
      participantsTableBody.innerHTML = responses
        .slice()
        .reverse()
        .map((r, index) => {
          const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-';
          return `
            <tr>
              <td class="td-muted">${responses.length - index}</td>
              <td>${escapeHtml(r.nombre || 'Anónimo')}</td>
              <td class="td-email">${escapeHtml(r.correo || '-')}</td>
              <td>${escapeHtml(r.q4 || '-')}</td>
              <td class="td-muted">${dateStr}</td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // --- Exportar CSV ---
  btnExportCSV.addEventListener('click', () => {
    const responses = getStoredResponses();
    if (responses.length === 0) {
      showToast('No hay respuestas para exportar');
      return;
    }

    const headers = [
      'ID',
      'Fecha_ISO',
      'Nombre_Completo',
      'Correo_Institucional',
      ...QUESTIONS_SCHEMA.map((q) => `${q.number}_${q.title}`)
    ];
    const rows = responses.map((r) => {
      const cols = [
        r.id,
        r.timestamp,
        r.nombre || '',
        r.correo || '',
        ...QUESTIONS_SCHEMA.map((q) => {
          const val = r[q.id];
          return Array.isArray(val) ? val.join(' | ') : (val || '');
        })
      ];
      return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `TecmiGYM_Resultados_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exportado');
  });

  // --- Datos de Prueba ---
  btnSeedDemoData.addEventListener('click', () => {
    const current = getStoredResponses();
    const demoStudents = [
      { nombre: 'Mauricio Torres Gutiérrez', correo: 'al02984512@tecmilenio.mx' },
      { nombre: 'Rafael Carbajal Sánchez', correo: 'al02981104@tecmilenio.mx' },
      { nombre: 'Valeria González Sota', correo: 'al02993218@tecmilenio.mx' },
      { nombre: 'Diego Hernández Ruiz', correo: 'al03014420@tecmilenio.mx' },
      { nombre: 'Sofía Martínez López', correo: 'al02976541@tecmilenio.mx' },
      { nombre: 'Alejandro Ramírez Vega', correo: 'al03028819@tecmilenio.mx' },
      { nombre: 'Camila Flores Mendoza', correo: 'al02989032@tecmilenio.mx' },
      { nombre: 'Sebastián Morales Castro', correo: 'al03001928@tecmilenio.mx' },
      { nombre: 'Fernanda Reyes Ortega', correo: 'al02965490@tecmilenio.mx' },
      { nombre: 'Emilio Vargas Silva', correo: 'al03017763@tecmilenio.mx' }
    ];

    const pickWeighted = (arr, weights) => {
      const totalW = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalW;
      for (let i = 0; i < arr.length; i++) {
        if (r < weights[i]) return arr[i];
        r -= weights[i];
      }
      return arr[0];
    };

    demoStudents.forEach((student, i) => {
      const q5Options = QUESTIONS_SCHEMA[4].options.filter(() => Math.random() > 0.42);
      if (q5Options.length === 0) q5Options.push('Al mediodía / Entre clases');

      const q8Options = QUESTIONS_SCHEMA[7].options.filter(() => Math.random() > 0.38);
      if (q8Options.length === 0) q8Options.push('Recibir notificaciones push cuando se libere un lugar');

      current.push({
        id: `demo_${Date.now()}_${i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        nombre: student.nombre,
        correo: student.correo,
        q1: pickWeighted(['Sí', 'No'], [0.78, 0.22]),
        q2: pickWeighted(['Sí', 'No'], [0.68, 0.32]),
        q3: pickWeighted(['Sí', 'No'], [0.94, 0.06]),
        q4: pickWeighted(['App', 'Web'], [0.72, 0.28]),
        q5: q5Options,
        q6: pickWeighted(QUESTIONS_SCHEMA[5].options, [0.42, 0.44, 0.14]),
        q7: pickWeighted(QUESTIONS_SCHEMA[6].options, [0.32, 0.48, 0.12, 0.08]),
        q8: q8Options
      });
    });

    saveStoredResponses(current);
    renderDashboardCharts();
    showToast('10 respuestas de prueba agregadas');
  });

  btnResetAllData.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderDashboardCharts();
    showToast('Base de datos reiniciada');
  });

  // --- Toast ---
  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  updateBadgeCount();
  updateLiveProgress();
});
