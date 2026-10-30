(function () {
  "use strict";

  function showPlaceholder(imgEl, text) {
    if (!imgEl) return;
    function applyPlaceholder() {
      if (imgEl.dataset.placeholderApplied === "1") return;
      imgEl.dataset.placeholderApplied = "1";
      imgEl.classList.add("d-none");
      var parent = imgEl.parentElement;
      if (!parent) return;
      if (parent.querySelector(".img-placeholder")) return;
      var ph = document.createElement("div");
      ph.className =
        "img-placeholder bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center rounded-3";
      ph.style.minHeight = imgEl.style.height || "200px";
      ph.textContent = text || "Foto belum tersedia";
      parent.appendChild(ph);
    }
    imgEl.addEventListener("error", applyPlaceholder);
    imgEl.addEventListener("load", function () {
      imgEl.dataset.placeholderApplied = "0";
    });
    // Cek jika gambar sudah selesai dimuat dan gagal (naturalWidth = 0)
    if (imgEl.complete && imgEl.naturalWidth === 0) {
      applyPlaceholder();
    }
  }

  function attachImageFallback(selector, text) {
    document.querySelectorAll(selector).forEach(function (img) {
      showPlaceholder(img, text || img.alt || "Foto belum tersedia");
    });
  }

  function renderNavbarActive() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-nav .nav-link").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === path) link.classList.add("active");
      else link.classList.remove("active");
    });
  }

  function loadSettings() {
    return DB.getSettings();
  }

  function renderRoomCard(room, options) {
    options = options || {};
    const isSubfolder = options.isSubfolder || false;
    const showDetail = options.showDetail !== false;
    const showDaftar = options.showDaftar || false;
    const foto = DB.getImagePathRelative(room.foto, isSubfolder);
    const tersedia = DB.statusPublic(room) === "Tersedia";
    const badgeClass = tersedia ? "bg-success" : "bg-secondary";
    const fasilitas = (room.fasilitas || [])
      .slice(0, 3)
      .map(function (f) {
        const text = f.length > 20 ? f.substring(0, 20) + "..." : f;
        return (
          '<span class="badge bg-light text-dark border me-1 mb-1 text-wrap text-start">' +
          escapeHtml(text) +
          "</span>"
        );
      })
      .join("");
    let daftarBtn = "";
    if (showDaftar && tersedia) {
      daftarBtn =
        '<a href="' +
        (isSubfolder ? "../pendaftaran.html" : "pendaftaran.html") +
        "?room=" +
        encodeURIComponent(room.id) +
        '" class="btn btn-sm btn-primary w-100">Daftar</a>';
    }
    let detailBtn = "";
    if (showDetail) {
      detailBtn =
        '<button type="button" class="btn btn-sm btn-outline-primary w-100 btn-detail" data-room-id="' +
        escapeHtml(room.id) +
        '">Detail Kamar</button>';
    }
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML =
      '<div class="card h-100 shadow-sm">' +
      '<div class="card-img-wrapper position-relative">' +
      '<img src="' +
      foto +
      '" class="card-img-top object-fit-cover" alt="Kamar ' +
      escapeHtml(room.nomorKamar) +
      '" style="height:180px">' +
      '<span class="badge ' +
      badgeClass +
      ' position-absolute top-0 end-0 m-2">' +
      escapeHtml(DB.statusPublic(room)) +
      "</span>" +
      "</div>" +
      '<div class="card-body d-flex flex-column">' +
      '<div class="d-flex justify-content-between align-items-start mb-2">' +
      '<h5 class="card-title mb-0">' +
      escapeHtml(room.nomorKamar) +
      "</h5>" +
      '<span class="badge bg-primary">' +
      escapeHtml(room.kategori) +
      "</span>" +
      "</div>" +
      '<p class="text-muted small mb-2">Lantai ' +
      room.lantai +
      " &middot; " +
      escapeHtml(room.tipe || "Standar") +
      "</p>" +
      '<div class="mb-2">' +
      fasilitas +
      "</div>" +
      '<p class="fw-bold text-primary mb-3">' +
      DB.formatRupiah(room.hargaTahunan) +
      " / tahun</p>" +
      '<div class="mt-auto d-grid gap-2">' +
      detailBtn +
      daftarBtn +
      "</div>" +
      "</div>" +
      "</div>";
    showPlaceholder(card.querySelector("img"), "Foto kamar " + room.nomorKamar);
    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function showRoomDetail(roomId, options) {
    options = options || {};
    const isSubfolder = options.isSubfolder || false;
    const room = DB.getRoomById(roomId);
    if (!room) return;
    const modalEl = document.getElementById("roomDetailModal");
    if (!modalEl) return;
    const foto = DB.getImagePathRelative(room.foto, isSubfolder);
    const tersedia = DB.statusPublic(room) === "Tersedia";
    const setText = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText("detailNomor", room.nomorKamar);
    setText("detailLantai", "Lantai " + room.lantai);
    setText("detailKategori", room.kategori);
    setText("detailTipe", room.tipe || "Standar");
    setText("detailHarga", DB.formatRupiah(room.hargaTahunan) + " / tahun");
    setText("detailStatus", DB.statusPublic(room));
    setText(
      "detailDeskripsi",
      room.deskripsi ||
        "Kamar " +
          room.nomorKamar +
          " berada di lantai " +
          room.lantai +
          " khusus " +
          room.kategori +
          ".",
    );
    const imgEl = document.getElementById("detailFoto");
    if (imgEl) {
      imgEl.src = foto;
      imgEl.classList.remove("d-none");
      showPlaceholder(imgEl, "Foto kamar " + room.nomorKamar);
    }
    const fasList = document.getElementById("detailFasilitas");
    if (fasList) {
      fasList.innerHTML = "";
      (room.fasilitas || []).forEach(function (f) {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = f;
        fasList.appendChild(li);
      });
    }
    const statusBadge = document.getElementById("detailStatusBadge");
    if (statusBadge) {
      statusBadge.className =
        "badge " + (tersedia ? "bg-success" : "bg-secondary");
      statusBadge.textContent = DB.statusPublic(room);
    }
    const daftarBtn = document.getElementById("detailDaftarBtn");
    if (daftarBtn) {
      if (tersedia) {
        daftarBtn.classList.remove("d-none");
        daftarBtn.href =
          (isSubfolder ? "../pendaftaran.html" : "pendaftaran.html") +
          "?room=" +
          encodeURIComponent(room.id);
      } else {
        daftarBtn.classList.add("d-none");
      }
    }
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  function bindRoomDetailButtons(container, options) {
    container = container || document;
    options = options || {};
    container.querySelectorAll(".btn-detail").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showRoomDetail(btn.getAttribute("data-room-id"), options);
      });
    });
  }

  function renderFooter() {
    const footerEl = document.getElementById("siteFooter");
    if (!footerEl) return;
    const s = DB.getSettings();
    const year = new Date().getFullYear();
    footerEl.innerHTML =
      '<footer class="bg-dark text-white-50 py-2 mt-5">' +
      '<div class="container">' +
      '<div class="row g-2">' +
      '<div class="col-md-4">' +
      '<h5 class="text-white">' +
      escapeHtml(s.namaKost || "Kost-Heaven-Gunungsitoli") +
      "</h5>" +
      '<p class="small mb-0">' +
      escapeHtml(s.deskripsi || "") +
      "</p>" +
      "</div>" +
      '<div class="col-md-4">' +
      '<h6 class="text-white">Kontak</h6>' +
      '<ul class="list-unstyled small mb-0">' +
      '<li><i class="bi bi-geo-alt"></i> ' +
      escapeHtml(s.alamat || "-") +
      "</li>" +
      '<li><i class="bi bi-telephone"></i> ' +
      escapeHtml(s.telepon || "-") +
      "</li>" +
      '<li><i class="bi bi-envelope"></i> ' +
      escapeHtml(s.email || "-") +
      "</li>" +
      "</ul>" +
      "</div>" +
      '<div class="col-md-4">' +
      '<h6 class="text-white">Menu</h6>' +
      '<ul class="list-unstyled small mb-0">' +
      '<li><a href="index.html" class="text-white-50 text-decoration-none">Beranda</a></li>' +
      '<li><a href="kamar.html" class="text-white-50 text-decoration-none">Kamar</a></li>' +
      '<li><a href="tentang.html" class="text-white-50 text-decoration-none">Tentang</a></li>' +
      '<li><a href="kontak.html" class="text-white-50 text-decoration-none">Kontak</a></li>' +
      '<li><a href="login.html" class="text-white-50 text-decoration-none">Login</a></li>' +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<hr class="border-secondary my-2">' +
      '<p class="text-center small mb-0">&copy; ' +
      year +
      " " +
      escapeHtml(s.namaKost || "Kost-Heaven-Gunungsitoli") +
      ". Hak Cipta Dilindungi .</p>" +
      "</div>" +
      "</footer>";
  }

  function renderFounders() {
    const container = document.getElementById("foundersContainer");
    if (!container) return;
    const founders = [
      {
        nama: "DERMAWANDA LASE",
        usia: "19 tahun",
        agama: "Kristen Katolik",
        alamat:
          "Hiliserangkai, Kec. Idanotae, Kab. Nias Selatan, Provinsi Sumatera Utara",
        motto:
          "Bukan pewaris, tetapi perintis. Membangun aset dalam diam, menciptakan peluang dengan visi, dan menjadikan kebebasan finansial sebagai tujuan.",
        foto: DB.getImagePath("images/pendiri", "pendiri-1"),
      },
      {
        nama: "IMJAR FIRLENTA ZEGA",
        usia: "21 tahun",
        agama: "Kristen Protestan",
        alamat:
          "Hilimbosi, Kec. Sitolu Ori, Kab. Nias Utara, Provinsi Sumatera Utara",
        motto:
          "Lebih baik mencoba apapun sebab laki-laki jangankan menang imbang pun tak sudi.",
        foto: DB.getImagePath("images/pendiri", "pendiri-2"),
      },
      {
        nama: "KRISMAN JAYA ZENDRATO",
        usia: "20 tahun",
        agama: "Kristen Protestan",
        alamat:
          "Lasara, Kec. Namohalu Esiwa, Kab. Nias Utara, Provinsi Sumatera Utara",
        motto:
          "Jadi anak pertama itu bukan tentang jadi yang paling sempurna, tapi jadi yang paling berani jatuh duluan.",
        foto: DB.getImagePath("images/pendiri", "pendiri-3"),
      },
    ];
    container.innerHTML = "";
    founders.forEach(function (f, idx) {
      const row = document.createElement("div");
      row.className =
        "row align-items-center g-4 mb-4" +
        (idx < founders.length - 1 ? " pb-4 border-bottom" : "");
      row.innerHTML =
        '<div class="col-md-4 text-center">' +
        '<img src="' +
        f.foto +
        '" class="img-fluid rounded-3 shadow-sm object-fit-cover w-100" alt="Foto ' +
        escapeHtml(f.nama) +
        '" style="height: 320px; object-position: center 50%;">' +
        "</div>" +
        '<div class="col-md-8">' +
        '<h4 class="mb-1">' +
        escapeHtml(f.nama) +
        "</h4>" +
        '<p class="text-muted mb-2">Pendiri Kost-Heaven</p>' +
        '<ul class="list-unstyled mb-3">' +
        '<li class="mb-1"><strong>Usia:</strong> ' +
        escapeHtml(f.usia) +
        "</li>" +
        '<li class="mb-1"><strong>Agama:</strong> ' +
        escapeHtml(f.agama) +
        "</li>" +
        '<li class="mb-1"><strong>Alamat:</strong> ' +
        escapeHtml(f.alamat) +
        "</li>" +
        '<li class="mb-1"><strong>Kewarganegaraan:</strong> WNI</li>' +
        "</ul>" +
        '<div class="alert alert-primary mb-0"><em>&ldquo;' +
        escapeHtml(f.motto) +
        "&rdquo;</em></div>" +
        "</div>";
      const img = row.querySelector("img");
      showPlaceholder(img, "Foto " + f.nama);
      container.appendChild(row);
    });
  }

  function renderPublicRooms() {
    const grid = document.getElementById("roomGrid");
    if (!grid) return;
    const search = (document.getElementById("filterSearch") || {}).value || "";
    const lantai = (document.getElementById("filterLantai") || {}).value || "";
    const kategori =
      (document.getElementById("filterKategori") || {}).value || "";
    const status = (document.getElementById("filterStatus") || {}).value || "";
    const tipe = (document.getElementById("filterTipe") || {}).value || "";

    let rooms = DB.getRooms();
    if (search)
      rooms = rooms.filter(function (r) {
        return r.nomorKamar.toLowerCase().indexOf(search.toLowerCase()) !== -1;
      });
    if (lantai)
      rooms = rooms.filter(function (r) {
        return String(r.lantai) === lantai;
      });
    if (kategori)
      rooms = rooms.filter(function (r) {
        return r.kategori === kategori;
      });
    if (status)
      rooms = rooms.filter(function (r) {
        return DB.statusPublic(r) === status;
      });
    if (tipe)
      rooms = rooms.filter(function (r) {
        return (r.tipe || "Standar") === tipe;
      });

    grid.innerHTML = "";
    if (!rooms.length) {
      grid.innerHTML =
        '<div class="col-12"><div class="alert alert-warning mb-0">Tidak ada kamar yang sesuai filter.</div></div>';
      return;
    }
    rooms.forEach(function (room) {
      grid.appendChild(
        renderRoomCard(room, { showDetail: true, showDaftar: true }),
      );
    });
    bindRoomDetailButtons(grid);
  }

  function renderRoomPreview() {
    const grid = document.getElementById("roomPreviewGrid");
    if (!grid) return;
    const rooms = DB.getRooms().slice(0, 3);
    grid.innerHTML = "";
    rooms.forEach(function (room) {
      grid.appendChild(
        renderRoomCard(room, { showDetail: true, showDaftar: false }),
      );
    });
    bindRoomDetailButtons(grid);
  }

  function initKamarFilters() {
    const ids = [
      "filterSearch",
      "filterLantai",
      "filterKategori",
      "filterStatus",
      "filterTipe",
    ];
    ids.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", renderPublicRooms);
        el.addEventListener("change", renderPublicRooms);
      }
    });
    const resetBtn = document.getElementById("resetFilter");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        ids.forEach(function (id) {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
        renderPublicRooms();
      });
    }
    const quickPutra = document.getElementById("quickPutra");
    const quickPutri = document.getElementById("quickPutri");
    const quickL1 = document.getElementById("quickLantai1");
    const quickL2 = document.getElementById("quickLantai2");
    if (quickPutra)
      quickPutra.addEventListener("click", function () {
        const k = document.getElementById("filterKategori");
        if (k) k.value = "Putra";
        renderPublicRooms();
      });
    if (quickPutri)
      quickPutri.addEventListener("click", function () {
        const k = document.getElementById("filterKategori");
        if (k) k.value = "Putri";
        renderPublicRooms();
      });
    if (quickL1)
      quickL1.addEventListener("click", function () {
        const k = document.getElementById("filterLantai");
        if (k) k.value = "1";
        renderPublicRooms();
      });
    if (quickL2)
      quickL2.addEventListener("click", function () {
        const k = document.getElementById("filterLantai");
        if (k) k.value = "2";
        renderPublicRooms();
      });
  }

  function initPendaftaranForm() {
    const form = document.getElementById("pendaftaranForm");
    if (!form) return;
    const kategoriSel = document.getElementById("regKategori");
    const kamarSel = document.getElementById("regKamar");
    const alertBox = document.getElementById("regAlert");
    const successBox = document.getElementById("regSuccess");

    function populateKamar() {
      const kat = kategoriSel.value;
      const rooms = DB.getRooms().filter(function (r) {
        return (
          (!kat || r.kategori === kat) && DB.statusPublic(r) === "Tersedia"
        );
      });
      kamarSel.innerHTML = '<option value="">-- Pilih Kamar --</option>';
      rooms.forEach(function (r) {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent =
          r.nomorKamar + " (Lantai " + r.lantai + " - " + r.kategori + ")";
        kamarSel.appendChild(opt);
      });
    }

    kategoriSel.addEventListener("change", populateKamar);
    populateKamar();

    const params = new URLSearchParams(window.location.search);
    const preRoom = params.get("room");
    if (preRoom) {
      const room = DB.getRoomById(preRoom);
      if (room) {
        kategoriSel.value = room.kategori;
        populateKamar();
        kamarSel.value = room.id;
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alertBox.classList.add("d-none");
      successBox.classList.add("d-none");

      const data = {
        nama: document.getElementById("regNama").value.trim(),
        nomorHP: document.getElementById("regHP").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        alamatAsal: document.getElementById("regAlamat").value.trim(),
        kategori: kategoriSel.value,
        roomId: kamarSel.value,
        tanggalRencanaMasuk: document.getElementById("regTanggal").value,
        catatan: document.getElementById("regCatatan").value.trim(),
      };

      if (
        !data.nama ||
        !data.nomorHP ||
        !data.email ||
        !data.alamatAsal ||
        !data.kategori ||
        !data.roomId
      ) {
        showRegAlert("Lengkapi seluruh data wajib.");
        return;
      }
      const room = DB.getRoomById(data.roomId);
      if (!room) {
        showRegAlert("Kamar tidak valid.");
        return;
      }
      if (room.kategori !== data.kategori) {
        showRegAlert("Kategori kamar tidak sesuai dengan pilihan.");
        return;
      }
      if (DB.statusPublic(room) !== "Tersedia") {
        showRegAlert("Kamar tidak tersedia.");
        return;
      }

      const regs = DB.getRegistrations();
      const id = DB.generateId("REG");
      const record = {
        id: id,
        nama: data.nama,
        kategori: data.kategori,
        nomorHP: data.nomorHP,
        email: data.email,
        alamatAsal: data.alamatAsal,
        roomId: data.roomId,
        tanggalPendaftaran: new Date().toISOString(),
        tanggalRencanaMasuk: data.tanggalRencanaMasuk,
        catatan: data.catatan,
        status: "Menunggu Persetujuan",
        alasanPenolakan: "",
      };
      regs.push(record);
      if (!DB.saveRegistrations(regs)) {
        showRegAlert("Gagal menyimpan data. Penyimpanan penuh.");
        return;
      }
      Auth.notifyAdmin(
        "Pendaftaran Baru",
        "Pendaftaran dari " +
          data.nama +
          " untuk kamar " +
          room.nomorKamar +
          ".",
        "pendaftaran",
        id,
        "pendaftaran.html",
      );

      form.reset();
      populateKamar();
      successBox.innerHTML =
        "<strong>Pendaftaran berhasil!</strong> Nomor pendaftaran Anda: <code>" +
        id +
        '</code>. Simpan nomor ini untuk mengecek status. Status awal: <span class="badge bg-warning text-dark">Menunggu Persetujuan</span>.';
      successBox.classList.remove("d-none");
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    function showRegAlert(msg) {
      alertBox.textContent = msg;
      alertBox.classList.remove("d-none");
    }

    const cekForm = document.getElementById("cekStatusForm");
    if (cekForm) {
      cekForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = document.getElementById("cekId").value.trim();
        const resultBox = document.getElementById("cekResult");
        const reg = DB.getRegistrations().find(function (r) {
          return r.id === id;
        });
        resultBox.classList.remove("d-none");
        if (!reg) {
          resultBox.className = "alert alert-danger";
          resultBox.textContent = "Nomor pendaftaran tidak ditemukan.";
          return;
        }
        const room = DB.getRoomById(reg.roomId);
        let badge = "bg-warning text-dark";
        if (reg.status === "Diterima") badge = "bg-success";
        if (reg.status === "Ditolak") badge = "bg-danger";
        resultBox.className = "alert alert-info";
        resultBox.innerHTML =
          '<p class="mb-1"><strong>Nomor:</strong> ' +
          escapeHtml(reg.id) +
          "</p>" +
          '<p class="mb-1"><strong>Nama:</strong> ' +
          escapeHtml(reg.nama) +
          "</p>" +
          '<p class="mb-1"><strong>Kamar:</strong> ' +
          escapeHtml(room ? room.nomorKamar : "-") +
          "</p>" +
          '<p class="mb-1"><strong>Status:</strong> <span class="badge ' +
          badge +
          '">' +
          escapeHtml(reg.status) +
          "</span></p>" +
          (reg.alasanPenolakan
            ? '<p class="mb-0"><strong>Alasan:</strong> ' +
              escapeHtml(reg.alasanPenolakan) +
              "</p>"
            : "");
      });
    }
  }

  function initKontakForm() {
    const form = document.getElementById("kontakForm");
    if (!form) return;
    const alertBox = document.getElementById("kontakAlert");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = {
        nama: document.getElementById("kontakNama").value.trim(),
        email: document.getElementById("kontakEmail").value.trim(),
        nomorHP: document.getElementById("kontakHP").value.trim(),
        subjek: document.getElementById("kontakSubjek").value.trim(),
        pesan: document.getElementById("kontakPesan").value.trim(),
      };
      if (!data.nama || !data.email || !data.subjek || !data.pesan) {
        alertBox.className = "alert alert-danger";
        alertBox.textContent = "Lengkapi data wajib.";
        alertBox.classList.remove("d-none");
        return;
      }
      const msgs = DB.getMessages();
      const id = DB.generateId("MSG");
      msgs.push({
        id: id,
        nama: data.nama,
        email: data.email,
        nomorHP: data.nomorHP,
        subjek: data.subjek,
        pesan: data.pesan,
        tanggal: new Date().toISOString(),
        status: "Baru",
      });
      if (!DB.saveMessages(msgs)) {
        alertBox.className = "alert alert-danger";
        alertBox.textContent = "Gagal menyimpan pesan.";
        alertBox.classList.remove("d-none");
        return;
      }
      Auth.notifyAdmin(
        "Pesan Baru",
        "Pesan dari " + data.nama + ": " + data.subjek,
        "pesan",
        id,
        "pesan.html",
      );
      form.reset();
      alertBox.className = "alert alert-success";
      alertBox.textContent =
        "Pesan berhasil dikirim (simulasi). Admin dapat membacanya di menu Pesan Masuk.";
      alertBox.classList.remove("d-none");
    });
  }

  function renderSettingsPublic() {
    const s = DB.getSettings();
    document.querySelectorAll("[data-setting]").forEach(function (el) {
      const key = el.getAttribute("data-setting");
      if (s[key] !== undefined) {
        if (el.tagName === "IMG") el.src = s[key];
        else el.textContent = s[key];
      }
    });
  }

  function renderHeroImage() {
    const heroImg = document.getElementById("heroKostImage");
    if (heroImg) {
      const s = DB.getSettings();
      heroImg.src = s.fotoUtama || DB.getImagePath("images/kost", "kost-depan");
      showPlaceholder(heroImg, "Foto bangunan Kost-Heaven");
    }
  }

  function initPublicPage() {
    renderNavbarActive();
    Auth.updateNavbar();
    renderHeroImage();
    renderRoomPreview();
    renderPublicRooms();
    initKamarFilters();
    initPendaftaranForm();
    initKontakForm();
    renderFounders();
    renderSettingsPublic();
    renderFooter();
  }

  document.addEventListener("DOMContentLoaded", initPublicPage);

  window.Public = {
    escapeHtml: escapeHtml,
    showPlaceholder: showPlaceholder,
    attachImageFallback: attachImageFallback,
    renderRoomCard: renderRoomCard,
    renderPublicRooms: renderPublicRooms,
    showRoomDetail: showRoomDetail,
    initPublicPage: initPublicPage,
  };
})();
