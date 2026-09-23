(() => {
  'use strict';

  const STORAGE_KEY = 'ecoalerta-tehuacan-reportes';
  const coloniasTehuacan = [
    'Centro',
    'Agua Blanca',
    'Aeropuerto',
    'Ampliación Moctezuma',
    'Benito Juárez',
    'Constituyentes',
    'El Riego',
    'La Purísima',
    'Las Palmas',
    'Los Reyes',
    'México Sur',
    'San Diego Chalma',
    'San Lorenzo Teotipilco',
    'San Nicolás Tetitzintla',
    'Santa Cecilia',
    'Santiago Tula',
    'Tepeyac',
    'Villa Verde'
  ];

  const reportForm = document.querySelector('#reportForm');
  const colonySelect = document.querySelector('#reportLocation');
  const colonyFilter = document.querySelector('#colonyFilter');
  const reportsList = document.querySelector('#reportsList');
  const reportsEmpty = document.querySelector('#reportsEmpty');
  const reportsCount = document.querySelector('#reportsCount');
  const reportFeedback = document.querySelector('#reportFeedback');

  function readReports() {
    try {
      const storedReports = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(storedReports) ? storedReports : [];
    } catch (error) {
      console.warn('No fue posible leer los reportes locales.', error);
      return [];
    }
  }

  function saveReports(reports) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.warn('No fue posible guardar el reporte localmente.', error);
      return false;
    }
  }

  function populateColonySelects() {
    if (colonySelect) {
      colonySelect.innerHTML = '<option value="" selected disabled>Selecciona una colonia</option>';
      coloniasTehuacan.forEach((colonia) => {
        colonySelect.add(new Option(colonia, colonia));
      });
    }

    if (colonyFilter) {
      colonyFilter.innerHTML = '<option value="">Todas las colonias</option>';
      coloniasTehuacan.forEach((colonia) => {
        colonyFilter.add(new Option(colonia, colonia));
      });
    }
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;'
    }[character]));
  }

  function renderReports(colonia = '') {
    if (!reportsList) {
      return;
    }

    const reports = readReports()
      .filter((report) => !colonia || report.colonia === colonia)
      .sort((firstReport, secondReport) => new Date(secondReport.fecha) - new Date(firstReport.fecha));

    if (reportsCount) {
      reportsCount.textContent = `${reports.length} ${reports.length === 1 ? 'reporte' : 'reportes'}`;
    }

    if (reportsEmpty) {
      reportsEmpty.hidden = reports.length > 0;
    }

    reportsList.innerHTML = reports.map((report) => `
      <article class="saved-report">
        <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
          <strong>${escapeHtml(report.tipo)}</strong>
          <span class="badge badge-soft">${escapeHtml(report.colonia)}</span>
        </div>
        <p class="mb-2">${escapeHtml(report.descripcion)}</p>
        <time class="small text-secondary" datetime="${escapeHtml(report.fecha)}">${formatDate(report.fecha)}</time>
      </article>
    `).join('');
  }

  function showFeedback(message, type = 'success') {
    if (!reportFeedback) {
      return;
    }

    reportFeedback.className = `alert alert-${type} mt-3 mb-0`;
    reportFeedback.textContent = message;
    reportFeedback.hidden = false;
  }

  function handleReportSubmit(event) {
    event.preventDefault();

    if (!reportForm || !reportForm.checkValidity()) {
      reportForm?.classList.add('was-validated');
      return;
    }

    const formData = new FormData(reportForm);
    const newReport = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      tipo: formData.get('reportType'),
      colonia: formData.get('reportLocation'),
      descripcion: formData.get('reportDetails').trim(),
      fecha: new Date().toISOString()
    };
    const reports = readReports();

    if (!saveReports([...reports, newReport])) {
      showFeedback('No se pudo guardar el reporte en este dispositivo.', 'danger');
      return;
    }

    reportForm.reset();
    reportForm.classList.remove('was-validated');
    showFeedback('Reporte guardado localmente en este dispositivo.', 'success');
    renderReports(colonyFilter?.value || '');
  }

  function filterReportsByColony(event) {
    renderReports(event.target.value);
  }

  function initialize() {
    populateColonySelects();
    renderReports();
    reportForm?.addEventListener('submit', handleReportSubmit);
    colonyFilter?.addEventListener('change', filterReportsByColony);
  }

  window.EcoAlerta = {
    coloniasTehuacan,
    readReports,
    saveReports,
    renderReports
  };

  document.addEventListener('DOMContentLoaded', initialize);
})();
