(function () {
  "use strict";

  var currentUser = null;
  var currentTenant = null;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function imgPath(foto) {
    if (!foto) return "";
    if (foto.indexOf("images/") === 0) return "../" + foto;
    return foto;
  }

  function renderSidebar(activePage) {
    var el = document.getElementById("penghuniSidebar");
    if (!el) return;
    var links = [
      { href: "dashboard.html", label: "Dashboard" },
      { href: "kamar.html", label: "Kamar Saya" },
      { href: "pembayaran.html", label: "Pembayaran" },
      { href: "kontrak.html", label: "Kontrak Sewa" },
      { href: "daftar-penghuni.html", label: "Daftar Penghuni" },
      { href: "keluhan.html", label: "Keluhan & Laporan" },
      { href: "pengumuman.html", label: "Pengumuman" },
      { href: "peraturan.html", label: "Peraturan Kost" },
      { href: "notifikasi.html", label: "Notifikasi" },
      { href: "profil.html", label: "Profil Saya" },
      { href: "#", label: "Logout", isLogout: true },
    ];
    var h = '<div class="list-group list-group-flush">';
    links.forEach(function (l) {
      var cls =
        "list-group-item list-group-item-action border-0" +
        (l.href === activePage ? " active" : "");
      h +=
        '<a href="' +
        l.href +
        '" class="' +
        cls +
        '"' +
        (l.isLogout ? ' data-logout="1"' : "") +
        ">" +
        escapeHtml(l.label) +
        "</a>";
    });
    h += "</div>";
    el.innerHTML = h;
    var lo = el.querySelector("[data-logout]");
    if (lo)
      lo.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.logout();
      });
  }

  function renderTopbar(title) {
    var el = document.getElementById("penghuniTopbar");
    if (!el) return;
    var foto =
      currentUser && currentUser.fotoProfil
        ? imgPath(currentUser.fotoProfil)
        : "";
    var imgHtml = foto
      ? '<img src="' +
        escapeHtml(foto) +
        '" alt="Profil" class="rounded-circle object-fit-cover" style="width:32px;height:32px">'
      : '<span class="badge bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style="width:32px;height:32px">' +
        escapeHtml(currentUser ? currentUser.nama.charAt(0) : "P") +
        "</span>";
    var unread = currentUser
      ? DB.getUnreadNotifications(currentUser.id).length
      : 0;
    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between w-100">' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#penghuniSidebarOffcanvas">&#9776;</button>' +
      '<h5 class="mb-0">' +
      escapeHtml(title) +
      "</h5>" +
      "</div>" +
      '<div class="d-flex align-items-center gap-2">' +
      '<a href="notifikasi.html" class="btn btn-outline-secondary btn-sm position-relative">Notifikasi' +
      (unread > 0
        ? ' <span class="badge bg-danger">' + unread + "</span>"
        : "") +
      "</a>" +
      imgHtml +
      '<span class="d-none d-md-inline small">' +
      escapeHtml(currentUser ? currentUser.nama : "") +
      "</span>" +
      "</div>" +
      "</div>";
  }

  function renderOffcanvas() {
    var el = document.getElementById("penghuniSidebarOffcanvasBody");
    if (!el) return;
    var sidebar = document.getElementById("penghuniSidebar");
    if (sidebar) el.innerHTML = sidebar.innerHTML;
    el.querySelectorAll("[data-logout]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.logout();
      });
    });
  }

  function initPenghuniPage(activePage, title) {
    currentUser = Auth.requirePenghuni();
    if (!currentUser) return null;
    currentTenant = DB.getTenantByUserId(currentUser.id);
    renderSidebar(activePage);
    renderTopbar(title);
    renderOffcanvas();
    return currentTenant;
  }

  function getRoom() {
    if (!currentTenant) return null;
    return DB.getRoomById(currentTenant.roomId);
  }

  function getActiveBill() {
    if (!currentTenant) return null;
    var bills = DB.getBillsByTenant(currentTenant.id);
    var active = bills.filter(function (b) {
      return b.status !== "Lunas";
    });
    active.sort(function (a, b) {
      return new Date(b.tanggalTerbit) - new Date(a.tanggalTerbit);
    });
    return active[0] || null;
  }

  function renderDashboard() {
    var content = document.getElementById("penghuniContent");
    if (!content || !currentTenant) return;
    var room = getRoom();
    var contract = DB.getActiveContract(currentTenant.id);
    var bill = getActiveBill();
    var announcements = DB.getAnnouncements()
      .filter(function (a) {
        return (
          a.status === "Publik" &&
          (a.targetPenghuni === "Semua" ||
            a.targetPenghuni === currentTenant.kategori)
        );
      })
      .slice(0, 3);
    var notifs = DB.getNotificationsByUser(currentUser.id).slice(0, 5);

    var foto = currentUser.fotoProfil ? imgPath(currentUser.fotoProfil) : "";

    var h =
      '<div class="row g-3 mb-4">' +
      '<div class="col-lg-4"><div class="card h-100"><div class="card-body text-center">' +
      (foto
        ? '<img src="' +
          escapeHtml(foto) +
          '" class="rounded-circle object-fit-cover mb-2" style="width:80px;height:80px" alt="Foto">'
        : '<div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2" style="width:80px;height:80px;font-size:2rem">' +
          escapeHtml(currentUser.nama.charAt(0)) +
          "</div>") +
      '<h5 class="mb-0">' +
      escapeHtml(currentTenant.nama) +
      "</h5>" +
      '<p class="text-muted mb-1">' +
      escapeHtml(currentTenant.kategori) +
      " · Kamar " +
      escapeHtml(room ? room.nomorKamar : "-") +
      "</p>" +
      '<span class="badge bg-success">' +
      escapeHtml(currentTenant.status) +
      "</span>" +
      "</div></div></div>" +
      '<div class="col-lg-4"><div class="card h-100"><div class="card-body">' +
      '<h6 class="text-muted">Informasi Kamar</h6>' +
      '<p class="mb-1"><strong>Kamar:</strong> ' +
      escapeHtml(room ? room.nomorKamar : "-") +
      "</p>" +
      '<p class="mb-1"><strong>Lantai:</strong> ' +
      (room ? room.lantai : "-") +
      "</p>" +
      '<p class="mb-1"><strong>Harga:</strong> ' +
      DB.formatRupiah(room ? room.hargaTahunan : 0) +
      "/tahun</p>" +
      '<p class="mb-0"><strong>Kontrak:</strong> ' +
      (contract
        ? DB.formatDateShort(contract.tanggalMulai) +
          " - " +
          DB.formatDateShort(contract.tanggalBerakhir)
        : "-") +
      "</p>" +
      "</div></div></div>" +
      '<div class="col-lg-4"><div class="card h-100"><div class="card-body">' +
      '<h6 class="text-muted">Tagihan Aktif</h6>' +
      (bill
        ? '<p class="mb-1"><strong>' +
          escapeHtml(bill.jenisTagihan) +
          "</strong> - " +
          escapeHtml(bill.periode) +
          "</p>" +
          '<p class="fw-bold text-primary mb-1">' +
          DB.formatRupiah(bill.nominal) +
          "</p>" +
          '<p class="mb-2 small">Jatuh tempo: ' +
          DB.formatDate(bill.jatuhTempo) +
          "</p>" +
          '<span class="badge ' +
          (bill.status === "Menunggu Verifikasi"
            ? "bg-warning text-dark"
            : bill.status === "Ditolak"
              ? "bg-danger"
              : "bg-secondary") +
          '">' +
          escapeHtml(bill.status) +
          "</span>"
        : '<p class="text-success mb-0">Tidak ada tagihan aktif.</p>') +
      "</div></div></div>" +
      "</div>";

    h +=
      '<div class="row g-3">' +
      '<div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Pengumuman Terbaru</div><div class="card-body">';
    if (!announcements.length)
      h += '<p class="text-muted mb-0">Belum ada pengumuman.</p>';
    else {
      h += '<ul class="list-group list-group-flush">';
      announcements.forEach(function (a) {
        h +=
          '<li class="list-group-item"><strong>' +
          escapeHtml(a.judul) +
          '</strong><br><small class="text-muted">' +
          DB.formatDate(a.tanggalPublikasi) +
          '</small><p class="small mb-0 mt-1">' +
          escapeHtml(a.isi.substring(0, 100)) +
          "...</p></li>";
      });
      h += "</ul>";
    }
    h += "</div></div></div>";
    h +=
      '<div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Notifikasi Terbaru</div><div class="card-body">';
    if (!notifs.length)
      h += '<p class="text-muted mb-0">Belum ada notifikasi.</p>';
    else {
      h += '<ul class="list-group list-group-flush">';
      notifs.forEach(function (n) {
        h +=
          '<li class="list-group-item' +
          (n.isRead ? "" : " bg-light") +
          '"><strong>' +
          escapeHtml(n.judul) +
          '</strong><br><small class="text-muted">' +
          escapeHtml(n.pesan) +
          "</small></li>";
      });
      h += "</ul>";
    }
    h += "</div></div></div></div>";

    h +=
      '<div class="d-flex flex-wrap gap-2 mt-4">' +
      '<a href="pembayaran.html" class="btn btn-primary">Bayar Sekarang</a>' +
      '<a href="kamar.html" class="btn btn-outline-primary">Kamar Saya</a>' +
      '<a href="kontrak.html" class="btn btn-outline-primary">Perpanjang Kontrak</a>' +
      '<a href="pengumuman.html" class="btn btn-outline-primary">Lihat Pengumuman</a>' +
      "</div>";

    content.innerHTML = h;
  }

  function renderKamarSaya() {
    var content = document.getElementById("penghuniContent");
    if (!content || !currentTenant) return;
    var room = getRoom();
    if (!room) {
      content.innerHTML =
        '<div class="alert alert-warning">Data kamar tidak ditemukan.</div>';
      return;
    }
    var contract = DB.getActiveContract(currentTenant.id);
    var foto = imgPath(room.foto);
    var fasilitas = (room.fasilitas || [])
      .map(function (f) {
        return '<li class="list-group-item">' + escapeHtml(f) + "</li>";
      })
      .join("");
    content.innerHTML =
      '<div class="row g-4">' +
      '<div class="col-md-6"><img src="' +
      escapeHtml(foto) +
      '" class="img-fluid rounded-3 shadow-sm" alt="Kamar ' +
      escapeHtml(room.nomorKamar) +
      '"></div>' +
      '<div class="col-md-6"><div class="card"><div class="card-body">' +
      "<h4>Kamar " +
      escapeHtml(room.nomorKamar) +
      "</h4>" +
      '<dl class="row mb-0">' +
      '<dt class="col-5">Lantai</dt><dd class="col-7">' +
      room.lantai +
      "</dd>" +
      '<dt class="col-5">Kategori</dt><dd class="col-7">' +
      escapeHtml(room.kategori) +
      "</dd>" +
      '<dt class="col-5">Tipe</dt><dd class="col-7">' +
      escapeHtml(room.tipe || "Standar") +
      "</dd>" +
      '<dt class="col-5">Harga</dt><dd class="col-7 text-primary fw-bold">' +
      DB.formatRupiah(room.hargaTahunan) +
      "/tahun</dd>" +
      '<dt class="col-5">Tanggal Masuk</dt><dd class="col-7">' +
      DB.formatDate(currentTenant.tanggalMasuk) +
      "</dd>" +
      '<dt class="col-5">Status Penghuni</dt><dd class="col-7"><span class="badge bg-success">' +
      escapeHtml(currentTenant.status) +
      "</span></dd>" +
      '<dt class="col-5">Kontrak</dt><dd class="col-7">' +
      (contract
        ? DB.formatDateShort(contract.tanggalMulai) +
          " - " +
          DB.formatDateShort(contract.tanggalBerakhir)
        : "-") +
      "</dd>" +
      "</dl>" +
      "</div></div></div>" +
      '<div class="col-12"><div class="card"><div class="card-header fw-bold">Fasilitas</div><ul class="list-group list-group-flush">' +
      fasilitas +
      "</ul></div></div>" +
      "</div>";
  }

  window.PenghuniApp = {
    escapeHtml: escapeHtml,
    imgPath: imgPath,
    initPenghuniPage: initPenghuniPage,
    renderDashboard: renderDashboard,
    renderKamarSaya: renderKamarSaya,
    getRoom: getRoom,
    getActiveBill: getActiveBill,
    getCurrentTenant: function () {
      return currentTenant;
    },
    getCurrentUser: function () {
      return currentUser;
    },
  };
})();
