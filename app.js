const toast = document.getElementById('toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}
const titles = {
  dashboard: ["Vue d'ensemble", "Bonjour Aminata ✳", "Voici ce qui se passe dans vos établissements cette semaine."],
  locations: ["Établissements", "Vos établissements", "Suivez les retours et la qualité de service, site par site."],
  feedback: ["Retours clients", "La voix de vos clients", "Retrouvez les retours partagés dans tout votre réseau."],
  codes: ["Mes QR codes", "Vos QR codes", "Gérez les points d'écoute liés à vos emplacements."],
  analytics: ["Analyses", "Vos analyses", "Comparez les tendances et identifiez les points d'amélioration."],
  team: ["Équipe", "Votre équipe", "Gérez les personnes qui accèdent à votre espace."],
  settings: ["Paramètres", "Paramètres de l'espace", "Personnalisez votre organisation et vos notifications."]
};
function setView(view) {
  const data = titles[view] || titles.dashboard;
  document.getElementById('crumbPage').textContent = data[0];
  const heading = document.getElementById('pageTitle');
  heading.textContent = data[1];
  if (view === 'dashboard') heading.innerHTML = 'Bonjour Aminata <span class="wave">✳</span>';
  document.getElementById('pageSubtitle').textContent = data[2];
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === view));
  document.getElementById('sidebar').classList.remove('open');
  if (view !== 'dashboard') notify(`Section « ${data[0]} » — aperçu de démonstration`);
}
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  setView(link.dataset.view);
}));
document.querySelectorAll('[data-open-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.openView)));
document.getElementById('mobileMenu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('dateRange').addEventListener('change', event => {
  const factor = Number(event.target.value) / 7;
  const scans = Math.round(2847 * factor);
  const feedback = Math.round(1926 * factor);
  document.getElementById('scansValue').textContent = scans.toLocaleString('fr-FR');
  document.getElementById('feedbackValue').textContent = feedback.toLocaleString('fr-FR');
  notify(`Période mise à jour : ${event.target.options[event.target.selectedIndex].text}`);
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const csv = [
    ['Établissement', 'Ville', 'Scans', 'Satisfaction'],
    ['Agence Dakar Plateau', 'Dakar', '684', '4.8'],
    ['Boutique Almadies', 'Dakar', '512', '4.7'],
    ['Agence Thiès', 'Thiès', '396', '4.3']
  ].map(row => row.join(';')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'empreinte-rapport-sites.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  notify('Rapport CSV téléchargé.');
});
const qrModal = document.getElementById('qrModal');
const qrResult = document.getElementById('qrResult');
document.getElementById('addQrBtn').addEventListener('click', () => qrModal.showModal());
document.querySelectorAll('.close-modal').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelector('.result-done').addEventListener('click', () => qrResult.close());
document.getElementById('qrForm').addEventListener('submit', event => {
  if (event.submitter && event.submitter.value === 'cancel') return;
  event.preventDefault();
  const name = document.getElementById('qrName').value.trim();
  if (!name) return;
  document.getElementById('createdQrName').textContent = name;
  document.getElementById('qrId').textContent = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
  qrModal.close();
  qrResult.showModal();
  event.currentTarget.reset();
});
[qrModal, qrResult].forEach(dialog => dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));
