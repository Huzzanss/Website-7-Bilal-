/* =========================================================
   Kelas VII Bilal bin Rabbah — app.js
   Tanpa login: semua orang bisa lihat & tambah data.
   Data disimpan di localStorage browser masing-masing perangkat.
   ========================================================= */

const STORAGE_KEY = "kelas7bilal_v1";

const STUDENTS = [
  "Chaerul Risyad Ferdiansyah",
  "Ahmad Abdullah Hafi Munaji",
  "Ahmad Faeyza Rafa",
  "Al Ghazali Fahran",
  "Alkhaliifi Hasyimi",
  "Almer Abrisam Dzaky Noor",
  "Faalih Arkaan",
  "Hafidz Alfatih Hermanto",
  "Handanu Indrafaza Styawan",
  "Muhammad Abdurrahman Dzaki",
  "Muhammad Alfindra Auvar Rahardja",
  "Muhammad Asyraf Al Farisi",
  "Muhammad El Junot Razqal",
  "Muhammad Faqih Ramadhan",
  "Muhammad Hafidz Setiadi",
  "Muhammad Zharif Syatir",
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const DEFAULT_SCHEDULE = {
  Senin: [
    { time: "07.00–08.20", subject: "Upacara & Tahfidz" },
    { time: "08.20–09.40", subject: "Matematika" },
    { time: "09.55–11.15", subject: "Bahasa Indonesia" },
    { time: "12.45–14.05", subject: "IPA" },
  ],
  Selasa: [
    { time: "07.00–08.20", subject: "PAI" },
    { time: "08.20–09.40", subject: "Bahasa Inggris" },
    { time: "09.55–11.15", subject: "IPS" },
    { time: "12.45–14.05", subject: "PJOK" },
  ],
  Rabu: [
    { time: "07.00–08.20", subject: "Matematika" },
    { time: "08.20–09.40", subject: "IPA" },
    { time: "09.55–11.15", subject: "Bahasa Arab" },
    { time: "12.45–14.05", subject: "Seni Budaya" },
  ],
  Kamis: [
    { time: "07.00–08.20", subject: "Bahasa Indonesia" },
    { time: "08.20–09.40", subject: "Matematika" },
    { time: "09.55–11.15", subject: "PAI" },
    { time: "12.45–14.05", subject: "Prakarya" },
  ],
  Jumat: [
    { time: "07.00–08.20", subject: "Tahfidz & Muhadatsah" },
    { time: "08.20–09.40", subject: "PPKn" },
    { time: "09.55–11.15", subject: "IPS" },
  ],
};

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Selamat Datang di Website Kelas!",
    body: "Semua siswa, guru, dan wali murid bisa langsung menambahkan pengumuman, tugas, jadwal, maupun foto di sini tanpa perlu login.",
    date: todayLabel(),
  },
];

const DEFAULT_TASKS = [
  {
    id: "t1",
    subject: "Matematika",
    title: "Latihan Soal Bilangan Bulat",
    desc: "Kerjakan halaman 24–26, dikumpulkan lewat buku tugas.",
    deadline: addDays(5),
    status: "berjalan",
  },
  {
    id: "t2",
    subject: "IPA",
    title: "Laporan Praktikum Ekosistem",
    desc: "Tulis tangan, minimal 2 halaman.",
    deadline: addDays(2),
    status: "berjalan",
  },
];

function todayLabel(){
  return new Date().toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
}
function addDays(n){
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
}
function formatDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}
function daysLeftLabel(iso){
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(iso + "T00:00:00");
  const diff = Math.round((target - today) / 86400000);
  if (diff < 0) return "Lewat tenggat";
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Besok";
  return `${diff} hari lagi`;
}
function uid(){ return Math.random().toString(36).slice(2, 9); }

/* ===== State & persistence ===== */
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }catch(e){ console.warn("Gagal memuat data lokal", e); }
  return {
    announcements: DEFAULT_ANNOUNCEMENTS,
    tasks: DEFAULT_TASKS,
    schedule: DEFAULT_SCHEDULE,
    gallery: [],
  };
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let activeDay = DAYS[new Date().getDay() >= 1 && new Date().getDay() <= 5 ? new Date().getDay() - 1 : 0];
let activeFilter = "semua";

/* ===== Toast ===== */
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ===== Modal helper ===== */
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

function openModal(title, bodyHTML, onMount){
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalBackdrop.classList.add("open");
  if (onMount) onMount(modalBody);
}
function closeModal(){
  modalBackdrop.classList.remove("open");
}
document.getElementById("modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });

/* =========================================================
   PENGUMUMAN
   ========================================================= */
function renderAnnouncements(){
  const list = document.getElementById("announcementList");
  if (!state.announcements.length){
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman. Jadilah yang pertama menambahkan!</p>`;
    return;
  }
  list.innerHTML = state.announcements
    .slice()
    .reverse()
    .map(a => `
      <div class="announcement-item">
        <div class="a-body">
          <strong>${escapeHTML(a.title)}</strong>
          <p>${escapeHTML(a.body)}</p>
        </div>
        <div class="item-actions">
          <span class="a-date">${a.date}</span>
          <button class="icon-btn" data-del-announcement="${a.id}" title="Hapus">✕</button>
        </div>
      </div>
    `).join("");
}

function openAnnouncementForm(){
  openModal("Buat Pengumuman", `
    <div class="form-group">
      <label>Judul Pengumuman</label>
      <input type="text" id="fTitle" placeholder="Contoh: Libur Sekolah">
    </div>
    <div class="form-group">
      <label>Isi Pengumuman</label>
      <textarea id="fBody" placeholder="Tulis detail pengumuman di sini..."></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="fCancel">Batal</button>
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    body.querySelector("#fCancel").addEventListener("click", closeModal);
    body.querySelector("#fSave").addEventListener("click", () => {
      const title = body.querySelector("#fTitle").value.trim();
      const text = body.querySelector("#fBody").value.trim();
      if (!title){ showToast("Judul pengumuman wajib diisi"); return; }
      state.announcements.push({ id: uid(), title, body: text, date: todayLabel() });
      saveState(); renderAnnouncements(); closeModal();
      showToast("Pengumuman berhasil ditambahkan");
    });
  });
}

document.getElementById("announcementList").addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-del-announcement");
  if (!id) return;
  state.announcements = state.announcements.filter(a => a.id !== id);
  saveState(); renderAnnouncements();
});
document.getElementById("btnAddAnnouncement").addEventListener("click", openAnnouncementForm);

/* =========================================================
   JADWAL PELAJARAN
   ========================================================= */
function renderScheduleTabs(){
  const tabs = document.getElementById("scheduleTabs");
  tabs.innerHTML = DAYS.map(d => `
    <button class="${d === activeDay ? "active" : ""}" data-day="${d}">${d}</button>
  `).join("");
  tabs.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeDay = btn.getAttribute("data-day");
      renderScheduleTabs();
      renderSchedule();
    });
  });
}

function renderSchedule(){
  const wrap = document.getElementById("scheduleWrap");
  const rows = state.schedule[activeDay] || [];
  if (!rows.length){
    wrap.innerHTML = `<p class="empty-note" style="padding:1rem;">Belum ada jadwal untuk hari ${activeDay}.</p>`;
    return;
  }
  wrap.innerHTML = rows.map((r, i) => `
    <div class="schedule-row">
      <span class="schedule-time">${escapeHTML(r.time)}</span>
      <span class="schedule-subject">${escapeHTML(r.subject)}</span>
      <button class="schedule-edit" data-edit="${i}" title="Ubah">✏️</button>
    </div>
  `).join("");
  wrap.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openScheduleEditForm(Number(btn.getAttribute("data-edit"))));
  });
}

function openScheduleEditForm(index){
  const row = state.schedule[activeDay][index];
  openModal(`Ubah Jadwal — ${activeDay}`, `
    <div class="form-group">
      <label>Jam Pelajaran</label>
      <input type="text" id="fTime" value="${escapeAttr(row.time)}" placeholder="Contoh: 07.00–08.20">
    </div>
    <div class="form-group">
      <label>Mata Pelajaran</label>
      <input type="text" id="fSubject" value="${escapeAttr(row.subject)}" placeholder="Contoh: Matematika">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="fDelete">Hapus Baris</button>
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    body.querySelector("#fSave").addEventListener("click", () => {
      const time = body.querySelector("#fTime").value.trim();
      const subject = body.querySelector("#fSubject").value.trim();
      if (!time || !subject){ showToast("Jam dan mata pelajaran wajib diisi"); return; }
      state.schedule[activeDay][index] = { time, subject };
      saveState(); renderSchedule(); closeModal();
      showToast("Jadwal diperbarui");
    });
    body.querySelector("#fDelete").addEventListener("click", () => {
      state.schedule[activeDay].splice(index, 1);
      saveState(); renderSchedule(); closeModal();
      showToast("Baris jadwal dihapus");
    });
  });
}

document.getElementById("btnResetJadwal").addEventListener("click", () => {
  if (!confirm("Kembalikan jadwal hari ini ke pengaturan awal?")) return;
  state.schedule[activeDay] = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE[activeDay] || []));
  saveState(); renderSchedule();
  showToast("Jadwal dikembalikan ke awal");
});

/* =========================================================
   TUGAS & UJIAN
   ========================================================= */
function renderTasks(){
  const list = document.getElementById("taskList");
  let tasks = state.tasks.slice();
  if (activeFilter !== "semua") tasks = tasks.filter(t => t.status === activeFilter);
  tasks.sort((a,b) => a.deadline.localeCompare(b.deadline));

  if (!tasks.length){
    list.innerHTML = `<p class="empty-note">Tidak ada tugas untuk filter ini.</p>`;
    return;
  }

  list.innerHTML = tasks.map(t => `
    <div class="task-card">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc)}</div>
      <div class="task-foot">
        <span class="deadline ${t.status === "selesai" ? "done" : ""}">
          ${formatDate(t.deadline)} · ${t.status === "selesai" ? "Selesai" : daysLeftLabel(t.deadline)}
        </span>
        <div class="task-actions">
          <button class="icon-btn" data-toggle="${t.id}" title="Tandai selesai/berjalan">🔁</button>
          <button class="icon-btn" data-del-task="${t.id}" title="Hapus">✕</button>
        </div>
      </div>
    </div>
  `).join("");
}

function openTaskForm(){
  openModal("Tambah Tugas / Ujian", `
    <div class="form-group">
      <label>Mata Pelajaran</label>
      <input type="text" id="fSubject" placeholder="Contoh: Bahasa Inggris">
    </div>
    <div class="form-group">
      <label>Nama Tugas / Ujian</label>
      <input type="text" id="fTitle" placeholder="Contoh: Ulangan Harian Bab 3">
    </div>
    <div class="form-group">
      <label>Deskripsi</label>
      <textarea id="fDesc" placeholder="Detail tugas, halaman, format pengumpulan, dll."></textarea>
    </div>
    <div class="form-group">
      <label>Tenggat Waktu</label>
      <input type="date" id="fDeadline" value="${addDays(3)}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="fCancel">Batal</button>
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    body.querySelector("#fCancel").addEventListener("click", closeModal);
    body.querySelector("#fSave").addEventListener("click", () => {
      const subject = body.querySelector("#fSubject").value.trim();
      const title = body.querySelector("#fTitle").value.trim();
      const desc = body.querySelector("#fDesc").value.trim();
      const deadline = body.querySelector("#fDeadline").value;
      if (!subject || !title || !deadline){ showToast("Mata pelajaran, nama tugas, dan tenggat wajib diisi"); return; }
      state.tasks.push({ id: uid(), subject, title, desc, deadline, status: "berjalan" });
      saveState(); renderTasks(); closeModal();
      showToast("Tugas berhasil ditambahkan");
    });
  });
}

document.getElementById("taskList").addEventListener("click", (e) => {
  const toggleId = e.target.getAttribute("data-toggle");
  const delId = e.target.getAttribute("data-del-task");
  if (toggleId){
    const t = state.tasks.find(x => x.id === toggleId);
    t.status = t.status === "selesai" ? "berjalan" : "selesai";
    saveState(); renderTasks();
  }
  if (delId){
    state.tasks = state.tasks.filter(t => t.id !== delId);
    saveState(); renderTasks();
  }
});

document.getElementById("btnAddTask").addEventListener("click", openTaskForm);

document.getElementById("filterRow").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  activeFilter = btn.getAttribute("data-filter");
  document.querySelectorAll("#filterRow .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderTasks();
});

/* =========================================================
   DAFTAR SISWA
   ========================================================= */
function renderStudents(){
  const list = document.getElementById("studentList");
  list.innerHTML = STUDENTS.map((name, i) => `
    <div class="student-item">
      <span class="student-no">${i + 1}.</span>
      <span class="avatar avatar-student">${initials(name)}</span>
      <span class="student-name">${escapeHTML(toTitleCase(name))}</span>
    </div>
  `).join("");
}
function initials(name){
  return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
}
function toTitleCase(str){
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/* =========================================================
   GALERI
   ========================================================= */
function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  if (!state.gallery.length){
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto. Unggah momen kegiatan kelas pertama!</div>`;
    return;
  }
  grid.innerHTML = state.gallery.map(g => `
    <div class="gallery-item">
      <img src="${g.src}" alt="Dokumentasi kelas">
      <button class="gallery-remove" data-del-photo="${g.id}" title="Hapus">✕</button>
    </div>
  `).join("");
}

document.getElementById("galleryInput").addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  let pending = files.length;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      state.gallery.push({ id: uid(), src: reader.result });
      pending--;
      if (pending === 0){ saveState(); renderGallery(); showToast("Foto berhasil diunggah"); }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
});

document.getElementById("galleryGrid").addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-del-photo");
  if (!id) return;
  state.gallery = state.gallery.filter(g => g.id !== id);
  saveState(); renderGallery();
});

/* =========================================================
   NAV, FAB, UTIL
   ========================================================= */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

const sections = document.querySelectorAll(".section[id]");
window.addEventListener("scroll", () => {
  let current = sections[0]?.id;
  sections.forEach(sec => {
    if (window.scrollY + 90 >= sec.offsetTop) current = sec.id;
  });
  document.querySelectorAll(".main-nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
});

const fab = document.getElementById("fab");
const fabMenu = document.getElementById("fabMenu");
fab.addEventListener("click", () => fabMenu.classList.toggle("open"));
fabMenu.addEventListener("click", (e) => {
  const action = e.target.getAttribute("data-action");
  if (!action) return;
  fabMenu.classList.remove("open");
  if (action === "announcement"){ document.getElementById("beranda").scrollIntoView(); openAnnouncementForm(); }
  if (action === "task"){ document.getElementById("tugas").scrollIntoView(); openTaskForm(); }
  if (action === "gallery"){ document.getElementById("galeri").scrollIntoView(); document.getElementById("galleryInput").click(); }
});

function escapeHTML(str = ""){
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(str = ""){ return escapeHTML(str); }

/* ===== Init ===== */
function init(){
  renderAnnouncements();
  renderScheduleTabs();
  renderSchedule();
  renderTasks();
  renderStudents();
  renderGallery();
}
init();
