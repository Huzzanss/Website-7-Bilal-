/* =========================================================
   Kelas VII Bilal bin Rabbah — app.js
   Tanpa login. Data disimpan di Firebase (Firestore + Storage)
   sehingga pengumuman, tugas, jadwal, dan foto yang ditambahkan
   satu orang langsung terlihat oleh semua orang lain.
   Pastikan firebase-config.js sudah diisi sebelum file ini jalan.
   ========================================================= */

/* =========================================================
   FOTO — DIATUR LEWAT SCRIPT INI SAJA
   Isi `photo` dengan URL foto (contoh: "foto/nama-file.jpg" atau
   link https://...). Kosongkan ("") kalau belum ada foto —
   otomatis akan ditampilkan inisial nama sebagai gantinya.
   ========================================================= */
/* =========================================================
   ICON / LOGO KELAS — DIATUR LEWAT SCRIPT INI SAJA
   Isi dengan nama file logo yang sudah Anda unggah ke folder yang
   sama dengan index.html (contoh: "logo-kelas.png"). Kosongkan ("")
   kalau belum ada logo — otomatis tampil tulisan "VII" sebagai gantinya.
   Untuk favicon (ikon tab browser), ubah juga baris
   <link rel="icon" ...> di index.html supaya nama filenya sama.
   ========================================================= */
const CLASS_ICON = "logo-kelas.png";

function renderBrandBadge(){
  const el = document.getElementById("brandBadge");
  if (CLASS_ICON && CLASS_ICON.trim()){
    el.innerHTML = `<img src="${CLASS_ICON}" alt="Logo Kelas VII Bilal bin Rabbah" onerror="this.parentElement.textContent='VII'">`;
  }
}

const TEACHER = {
  name: "Sugeng Riyadi, S.Kom., Gr.",
  role: "Wali Kelas",
  photo: "paksugeng.png",
};

const STUDENTS = [
  { name: "Chaerul Risyad Ferdiansyah", photo: "" },
  { name: "Ahmad Abdullah Hafi Munaji", photo: "" },
  { name: "Ahmad Faeyza Rafa", photo: "" },
  { name: "Al Ghazali Fahran", photo: "" },
  { name: "Alkhaliifi Hasyimi", photo: "" },
  { name: "Almer Abrisam Dzaky Noor", photo: "" },
  { name: "Faalih Arkaan", photo: "" },
  { name: "Hafidz Alfatih Hermanto", photo: "" },
  { name: "Handanu Indrafaza Styawan", photo: "" },
  { name: "Muhammad Abdurrahman Dzaki", photo: "" },
  { name: "Muhammad Alfindra Auvar Rahardja", photo: "" },
  { name: "Muhammad Asyraf Al Farisi", photo: "" },
  { name: "Muhammad El Junot Razqal", photo: "" },
  { name: "Muhammad Faqih Ramadhan", photo: "" },
  { name: "Muhammad Hafidz Setiadi", photo: "" },
  { name: "Muhammad Zharif Syatir", photo: "" },
];

/* =========================================================
   JADWAL PELAJARAN — DIATUR LEWAT SCRIPT INI SAJA
   Tidak ada tombol tambah/ubah di halaman; edit langsung di sini
   lalu upload ulang file app.js kalau ada perubahan jadwal.
   ========================================================= */
const SCHEDULE = {
  Senin: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.30", subject: "Upacara / Apel / Bina Pribadi Islam" },
    { time: "08.30–09.30", subject: "Bahasa Arab" },
    { time: "09.30–10.00", subject: "Istirahat" },
    { time: "10.00–11.00", subject: "Matematika" },
    { time: "11.00–12.00", subject: "Al Qur'an" },
    { time: "12.00–12.30", subject: "Istirahat" },
    { time: "12.30–13.15", subject: "Salat Dzuhur, Makan Siang" },
    { time: "13.15–14.15", subject: "Pendidikan Agama Islam" },
    { time: "14.15–15.15", subject: "Bahasa Indonesia" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Selasa: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Bahasa Indonesia" },
    { time: "09.00–10.00", subject: "Matematika" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Bahasa Inggris" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–14.30", subject: "English Speaking Coaching" },
    { time: "14.30–15.15", subject: "Karya Tulis Ilmiah" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Rabu: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Fisika" },
    { time: "09.00–10.00", subject: "Bimbingan Konseling" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–15.15", subject: "Bina Prestasi (Klub)" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Kamis: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Bina Pribadi Islam" },
    { time: "08.00–09.00", subject: "Public Speaking" },
    { time: "09.00–10.00", subject: "Seni Budaya dan Prakarya" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Al Qur'an" },
    { time: "11.30–12.30", subject: "Biologi" },
    { time: "12.30–13.00", subject: "Salat Dzuhur" },
    { time: "13.00–13.30", subject: "Makan Siang, Istirahat" },
    { time: "13.30–14.30", subject: "Pramuka" },
    { time: "14.30–15.15", subject: "Pembinaan Karakter dan Kepribadian" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
  Jumat: [
    { time: "07.15–07.30", subject: "Persiapan & Pembinaan Kedisiplinan" },
    { time: "07.30–08.00", subject: "Senam / Jalan Santai / Jumat Bersih" },
    { time: "08.00–09.00", subject: "Pendidikan Kewarganegaraan" },
    { time: "09.00–10.00", subject: "Informatika" },
    { time: "10.00–10.30", subject: "Istirahat" },
    { time: "10.30–11.30", subject: "Ilmu Pengetahuan Sosial" },
    { time: "11.30–12.00", subject: "Pembinaan Karakter dan Kepribadian" },
    { time: "12.00–12.50", subject: "Salat Jum'at / Keputrian - Salat Dzuhur" },
    { time: "12.50–13.30", subject: "Makan Siang" },
    { time: "13.30–15.15", subject: "Bina Prestasi (Ekstrakurikuler)" },
    { time: "15.15–16.00", subject: "Piket, Salat Ashar, Pemulangan" },
  ],
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/* ===== Icon set (SVG, bukan emoji) ===== */
const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 5.5 16 2.5 20.5 7 17.5 10.5"/><path d="M17.5 10.5 8 20H3.5v-4.5L13 6"/></svg>`;
const ICON_REFRESH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9M20.5 12a8.5 8.5 0 0 1-14.6 5.9"/><path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4"/></svg>`;

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
   REALTIME DATABASE: PENGUMUMAN  (path: "announcements")
   ========================================================= */
db.ref("announcements").on("value", (snap) => {
  const val = snap.val() || {};
  announcements = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
        <button class="icon-btn" data-del-announcement="${a.id}" title="Hapus">${ICON_CLOSE}</button>
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
        await db.ref("announcements").push({
          title, body: text, date: todayLabel(),
          createdAt: firebase.database.ServerValue.TIMESTAMP,
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
  await db.ref("announcements/" + id).remove();
});
document.getElementById("btnAddAnnouncement").addEventListener("click", openAnnouncementForm);

/* =========================================================
   FIRESTORE: JADWAL  (collection: "schedule", 1 dokumen per hari)
   Dokumen kosong sampai ada yang menambahkan jam pelajaran.
   ========================================================= */
/* =========================================================
   JADWAL PELAJARAN — render langsung dari konstanta SCHEDULE
   (tidak tersambung ke Firestore, hanya bisa diubah lewat kode)
   ========================================================= */
let schedule = SCHEDULE;

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
    wrap.innerHTML = `<p class="empty-note" style="padding:1rem;">Belum ada jadwal untuk hari ${activeDay}.</p>`;
    return;
  }
  wrap.innerHTML = rows.map(r => `
    <div class="schedule-row">
      <span class="schedule-time">${escapeHTML(r.time)}</span>
      <span class="schedule-subject">${escapeHTML(r.subject)}</span>
    </div>
  `).join("");
}

/* =========================================================
   REALTIME DATABASE: TUGAS & UJIAN  (path: "tasks")
   ========================================================= */
db.ref("tasks").on("value", (snap) => {
  const val = snap.val() || {};
  tasks = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
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
          <button class="icon-btn" data-toggle="${t.id}" title="Tandai selesai/berjalan">${ICON_REFRESH}</button>
          <button class="icon-btn" data-del-task="${t.id}" title="Hapus">${ICON_CLOSE}</button>
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
        await db.ref("tasks").push({ subject, title, desc, deadline, status: "berjalan" });
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
    await db.ref("tasks/" + toggleId).update({ status: t.status === "selesai" ? "berjalan" : "selesai" });
  }
  if (delId){
    await db.ref("tasks/" + delId).remove();
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
   WALI KELAS & DAFTAR SISWA (statis, sesuai PRD — foto diatur lewat script)
   ========================================================= */
function avatarInnerHTML(name, photo){
  if (photo && photo.trim()){
    return `<img src="${escapeAttr(photo)}" alt="Foto ${escapeAttr(name)}" onerror="this.parentElement.innerHTML='${initials(name)}'">`;
  }
  return initials(name);
}

function renderTeacher(){
  const el = document.getElementById("teacherCard");
  el.innerHTML = `
    <span class="avatar" style="width:64px;height:64px;font-size:1.15rem;">${avatarInnerHTML(TEACHER.name, TEACHER.photo)}</span>
    <div>
      <p class="label-sm">${escapeHTML(TEACHER.role)}</p>
      <h3>${escapeHTML(TEACHER.name)}</h3>
    </div>
  `;
}

function renderStudents(){
  const list = document.getElementById("studentList");
  list.innerHTML = STUDENTS.map((s, i) => `
    <div class="student-item">
      <span class="avatar-wrap">
        <span class="student-no">${i + 1}</span>
        <span class="avatar">${avatarInnerHTML(s.name, s.photo)}</span>
      </span>
      <span class="student-name">${escapeHTML(toTitleCase(s.name))}</span>
    </div>
  `).join("");
}
function initials(name){ return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function toTitleCase(str){ return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

/* =========================================================
   REALTIME DATABASE: GALERI  (path: "gallery", foto disimpan
   sebagai base64 langsung di database, tanpa Firebase Storage)
   ========================================================= */
db.ref("gallery").on("value", (snap) => {
  const val = snap.val() || {};
  gallery = Object.entries(val)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
      <button class="gallery-remove" data-del-photo="${g.id}" title="Hapus">${ICON_CLOSE}</button>
    </div>
  `).join("");
}

function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_PHOTO_KB = 700; // batas ukuran per foto (setelah dikompres) supaya database tetap ringan

function compressImage(file, maxWidth = 1000, quality = 0.72){
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("galleryInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  showToast(`Mengunggah ${files.length} foto...`);
  for (const file of files){
    try{
      const dataUrl = await compressImage(file);
      const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);
      if (sizeKb > MAX_PHOTO_KB * 3){
        showToast(`${file.name} terlalu besar, dilewati`);
        continue;
      }
      await db.ref("gallery").push({
        url: dataUrl,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    }catch(err){
      showToast("Gagal mengunggah salah satu foto");
    }
  }
  e.target.value = "";
  showToast("Unggah foto selesai");
});

document.getElementById("galleryGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-del-photo]");
  if (!btn) return;
  const id = btn.getAttribute("data-del-photo");
  try{
    await db.ref("gallery/" + id).remove();
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
renderSchedule();
renderTeacher();
renderStudents();
renderBrandBadge();
