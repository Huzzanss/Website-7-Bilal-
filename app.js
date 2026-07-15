/* =========================================================
   Kelas VII Bilal bin Rabbah — app.js
   Tanpa login. Data disimpan di Firebase (Firestore + Storage)
   sehingga pengumuman, tugas, jadwal, dan foto yang ditambahkan
   satu orang langsung terlihat oleh semua orang lain.
   Pastikan firebase-config.js sudah diisi sebelum file ini jalan.
   ========================================================= */

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

/* ===== Local mirror of cloud data (diisi otomatis oleh listener Firestore) ===== */
let announcements = [];
let tasks = [];
let schedule = { Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [] };
let gallery = [];

let activeDay = DAYS[(new Date().getDay() >= 1 && new Date().getDay() <= 5) ? new Date().getDay() - 1 : 0];
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
function closeModal(){ modalBackdrop.classList.remove("open"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });

/* =========================================================
   FIRESTORE: PENGUMUMAN  (collection: "announcements")
   ========================================================= */
db.collection("announcements").orderBy("createdAt", "desc")
  .onSnapshot((snap) => {
    announcements = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAnnouncements();
  }, () => showToast("Gagal memuat pengumuman: cek konfigurasi Firebase"));

function renderAnnouncements(){
  const list = document.getElementById("announcementList");
  if (!announcements.length){
    list.innerHTML = `<p class="empty-note">Belum ada pengumuman. Jadilah yang pertama menambahkan!</p>`;
    return;
  }
  list.innerHTML = announcements.map(a => `
    <div class="announcement-item">
      <div class="a-body">
        <strong>${escapeHTML(a.title)}</strong>
        <p>${escapeHTML(a.body || "")}</p>
      </div>
      <div class="item-actions">
        <span class="a-date">${escapeHTML(a.date || "")}</span>
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
    body.querySelector("#fSave").addEventListener("click", async () => {
      const title = body.querySelector("#fTitle").value.trim();
      const text = body.querySelector("#fBody").value.trim();
      if (!title){ showToast("Judul pengumuman wajib diisi"); return; }
      try{
        await db.collection("announcements").add({
          title, body: text, date: todayLabel(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        closeModal();
        showToast("Pengumuman berhasil ditambahkan");
      }catch(e){ showToast("Gagal menyimpan. Cek konfigurasi Firebase"); }
    });
  });
}

document.getElementById("announcementList").addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-del-announcement");
  if (!id) return;
  await db.collection("announcements").doc(id).delete();
});
document.getElementById("btnAddAnnouncement").addEventListener("click", openAnnouncementForm);

/* =========================================================
   FIRESTORE: JADWAL  (collection: "schedule", 1 dokumen per hari)
   Dokumen kosong sampai ada yang menambahkan jam pelajaran.
   ========================================================= */
DAYS.forEach(day => {
  db.collection("schedule").doc(day).onSnapshot((doc) => {
    schedule[day] = doc.exists ? (doc.data().rows || []) : [];
    if (day === activeDay) renderSchedule();
  }, () => showToast("Gagal memuat jadwal: cek konfigurasi Firebase"));
});

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
  const rows = schedule[activeDay] || [];
  if (!rows.length){
    wrap.innerHTML = `<p class="empty-note" style="padding:1rem;">Jadwal hari ${activeDay} masih kosong. Klik "+ Tambah Jam Pelajaran" untuk mengisinya.</p>`;
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
    btn.addEventListener("click", () => openScheduleForm({ index: Number(btn.getAttribute("data-edit")) }));
  });
}

async function saveScheduleRows(rows){
  await db.collection("schedule").doc(activeDay).set({ rows });
}

function openScheduleForm({ index = null } = {}){
  const editing = index !== null;
  const row = editing ? schedule[activeDay][index] : { time: "", subject: "" };
  openModal(editing ? `Ubah Jadwal — ${activeDay}` : `Tambah Jam Pelajaran — ${activeDay}`, `
    <div class="form-group">
      <label>Jam Pelajaran</label>
      <input type="text" id="fTime" value="${escapeAttr(row.time)}" placeholder="Contoh: 07.00–08.20">
    </div>
    <div class="form-group">
      <label>Mata Pelajaran</label>
      <input type="text" id="fSubject" value="${escapeAttr(row.subject)}" placeholder="Contoh: Matematika">
    </div>
    <div class="modal-actions">
      ${editing ? `<button class="btn btn-secondary" id="fDelete">Hapus Baris</button>` : `<button class="btn btn-secondary" id="fCancel">Batal</button>`}
      <button class="btn btn-primary" id="fSave">Simpan</button>
    </div>
  `, (body) => {
    if (body.querySelector("#fCancel")) body.querySelector("#fCancel").addEventListener("click", closeModal);
    body.querySelector("#fSave").addEventListener("click", async () => {
      const time = body.querySelector("#fTime").value.trim();
      const subject = body.querySelector("#fSubject").value.trim();
      if (!time || !subject){ showToast("Jam dan mata pelajaran wajib diisi"); return; }
      const rows = (schedule[activeDay] || []).slice();
      if (editing) rows[index] = { time, subject };
      else rows.push({ time, subject });
      try{
        await saveScheduleRows(rows);
        closeModal();
        showToast(editing ? "Jadwal diperbarui" : "Jam pelajaran ditambahkan");
      }catch(e){ showToast("Gagal menyimpan. Cek konfigurasi Firebase"); }
    });
    if (body.querySelector("#fDelete")){
      body.querySelector("#fDelete").addEventListener("click", async () => {
        const rows = (schedule[activeDay] || []).slice();
        rows.splice(index, 1);
        await saveScheduleRows(rows);
        closeModal();
        showToast("Baris jadwal dihapus");
      });
    }
  });
}

document.getElementById("btnAddSchedule").addEventListener("click", () => openScheduleForm({}));

/* =========================================================
   FIRESTORE: TUGAS & UJIAN  (collection: "tasks")
   ========================================================= */
db.collection("tasks").orderBy("deadline", "asc")
  .onSnapshot((snap) => {
    tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTasks();
  }, () => showToast("Gagal memuat tugas: cek konfigurasi Firebase"));

function renderTasks(){
  const list = document.getElementById("taskList");
  let items = tasks.slice();
  if (activeFilter !== "semua") items = items.filter(t => t.status === activeFilter);

  if (!items.length){
    list.innerHTML = `<p class="empty-note">Tidak ada tugas untuk filter ini.</p>`;
    return;
  }

  list.innerHTML = items.map(t => `
    <div class="task-card">
      <div class="task-top">
        <span class="task-subject">${escapeHTML(t.subject)}</span>
        <span class="status-pill ${t.status}">${t.status === "selesai" ? "Selesai" : "Berjalan"}</span>
      </div>
      <div class="task-title">${escapeHTML(t.title)}</div>
      <div class="task-desc">${escapeHTML(t.desc || "")}</div>
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
    body.querySelector("#fSave").addEventListener("click", async () => {
      const subject = body.querySelector("#fSubject").value.trim();
      const title = body.querySelector("#fTitle").value.trim();
      const desc = body.querySelector("#fDesc").value.trim();
      const deadline = body.querySelector("#fDeadline").value;
      if (!subject || !title || !deadline){ showToast("Mata pelajaran, nama tugas, dan tenggat wajib diisi"); return; }
      try{
        await db.collection("tasks").add({ subject, title, desc, deadline, status: "berjalan" });
        closeModal();
        showToast("Tugas berhasil ditambahkan");
      }catch(e){ showToast("Gagal menyimpan. Cek konfigurasi Firebase"); }
    });
  });
}

document.getElementById("taskList").addEventListener("click", async (e) => {
  const toggleId = e.target.getAttribute("data-toggle");
  const delId = e.target.getAttribute("data-del-task");
  if (toggleId){
    const t = tasks.find(x => x.id === toggleId);
    await db.collection("tasks").doc(toggleId).update({ status: t.status === "selesai" ? "berjalan" : "selesai" });
  }
  if (delId){
    await db.collection("tasks").doc(delId).delete();
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
   DAFTAR SISWA (statis, sesuai PRD — tidak perlu database)
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
function initials(name){ return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function toTitleCase(str){ return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

/* =========================================================
   FIRESTORE + STORAGE: GALERI  (collection: "gallery", file di Storage)
   ========================================================= */
db.collection("gallery").orderBy("createdAt", "desc")
  .onSnapshot((snap) => {
    gallery = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGallery();
  }, () => showToast("Gagal memuat galeri: cek konfigurasi Firebase"));

function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  if (!gallery.length){
    grid.innerHTML = `<div class="gallery-empty">Belum ada foto. Unggah momen kegiatan kelas pertama!</div>`;
    return;
  }
  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item">
      <img src="${g.url}" alt="Dokumentasi kelas" loading="lazy">
      <button class="gallery-remove" data-del-photo="${g.id}" data-path="${escapeAttr(g.path || "")}" title="Hapus">✕</button>
    </div>
  `).join("");
}

document.getElementById("galleryInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  showToast(`Mengunggah ${files.length} foto...`);
  for (const file of files){
    try{
      const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${file.name}`;
      const ref = storage.ref(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await db.collection("gallery").add({
        url, path,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){
      showToast("Gagal mengunggah salah satu foto. Cek konfigurasi Firebase Storage");
    }
  }
  e.target.value = "";
  showToast("Unggah foto selesai");
});

document.getElementById("galleryGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-del-photo]");
  if (!btn) return;
  const id = btn.getAttribute("data-del-photo");
  const path = btn.getAttribute("data-path");
  try{
    if (path) await storage.ref(path).delete();
    await db.collection("gallery").doc(id).delete();
  }catch(e){ showToast("Gagal menghapus foto"); }
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
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(str = ""){ return escapeHTML(str); }

/* ===== Init (bagian yang tidak butuh data cloud) ===== */
renderScheduleTabs();
renderStudents();
