(function () {
  "use strict";

  var currentAdmin = null;
  var pendingConfirmAction = null;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function renderSidebar(activePage) {
    var el = document.getElementById("adminSidebar");
    if (!el) return;
    var items = [
      {
        group: "",
        links: [
          { href: "dashboard.html", label: "Dashboard", icon: "&#9632;" },
        ],
      },
      {
        group: "Manajemen Kost",
        links: [
          { href: "kamar.html", label: "Data Kamar" },
          { href: "penghuni.html", label: "Data Penghuni" },
          { href: "pendaftaran.html", label: "Pendaftaran" },
          { href: "kontrak.html", label: "Kontrak Sewa" },
        ],
      },
      {
        group: "Keuangan",
        links: [
          { href: "pembayaran.html", label: "Pembayaran" },
          { href: "laporan.html", label: "Laporan Keuangan" },
        ],
      },
      {
        group: "Komunikasi",
        links: [
          { href: "pengumuman.html", label: "Pengumuman" },
          { href: "keluhan.html", label: "Keluhan Penghuni" },
          { href: "pesan.html", label: "Pesan Masuk" },
        ],
      },
      {
        group: "Pengaturan",
        links: [
          { href: "pengaturan.html", label: "Pengaturan Kost" },
          { href: "profil.html", label: "Profil Admin" },
          { href: "#", label: "Logout", isLogout: true },
        ],
      },
    ];
    var html = '<div class="list-group list-group-flush">';
    items.forEach(function (section) {
      if (section.group) {
        html +=
          '<div class="px-3 pt-3 pb-1 small text-uppercase text-muted fw-bold">' +
          escapeHtml(section.group) +
          "</div>";
      }
      section.links.forEach(function (link) {
        var isActive = link.href === activePage;
        var cls =
          "list-group-item list-group-item-action border-0" +
          (isActive ? " active" : "");
        html +=
          '<a href="' +
          link.href +
          '" class="' +
          cls +
          '"' +
          (link.isLogout ? ' data-logout="1"' : "") +
          ">" +
          escapeHtml(link.label) +
          "</a>";
      });
    });
    html += "</div>";
    el.innerHTML = html;
    var logoutLink = el.querySelector("[data-logout]");
    if (logoutLink) {
      logoutLink.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.logout();
      });
    }
  }

  function renderTopbar(title) {
    var el = document.getElementById("adminTopbar");
    if (!el) return;
    var user = Auth.currentUser();
    var foto = user && user.fotoProfil ? user.fotoProfil : "";
    var imgHtml = foto
      ? '<img src="' +
        escapeHtml("../" + foto) +
        '" alt="Admin" class="rounded-circle object-fit-cover" style="width:32px;height:32px">'
      : '<span class="badge bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center" style="width:32px;height:32px">A</span>';
    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between w-100">' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebarOffcanvas">&#9776;</button>' +
      '<h5 class="mb-0">' +
      escapeHtml(title) +
      "</h5>" +
      "</div>" +
      '<div class="d-flex align-items-center gap-2">' +
      '<a href="notifikasi.html" class="btn btn-outline-secondary btn-sm position-relative" id="adminNotifBtn">Notifikasi</a>' +
      imgHtml +
      '<span class="d-none d-md-inline small">' +
      escapeHtml(user ? user.nama : "Admin") +
      "</span>" +
      "</div>" +
      "</div>";
    var notifBtn = document.getElementById("adminNotifBtn");
    if (notifBtn) {
      var unread = DB.getUnreadNotifications(user ? user.id : "").length;
      if (unread > 0) {
        var badge = document.createElement("span");
        badge.className =
          "position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger";
        badge.textContent = unread;
        notifBtn.appendChild(badge);
      }
    }
  }

  function renderSidebarOffcanvas(activePage) {
    var el = document.getElementById("adminSidebarOffcanvasBody");
    if (!el) return;
    var sidebar = document.getElementById("adminSidebar");
    if (sidebar) el.innerHTML = sidebar.innerHTML;
    el.querySelectorAll("[data-logout]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.logout();
      });
    });
  }

  function initAdminPage(activePage, title) {
    currentAdmin = Auth.requireAdmin();
    if (!currentAdmin) return;
    renderSidebar(activePage);
    renderTopbar(title || "Dashboard");
    renderSidebarOffcanvas(activePage);
    var logoutBtn = document.getElementById("topLogoutBtn");
    if (logoutBtn)
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.logout();
      });
    var nameEl = document.getElementById("topAdminName");
    if (nameEl) nameEl.textContent = currentAdmin.nama;
    document.dispatchEvent(new CustomEvent("adminReady"));
  }

  function statsRooms() {
    var rooms = DB.getRooms();
    return {
      total: rooms.length,
      tersedia: rooms.filter(function (r) {
        return r.status === "Tersedia";
      }).length,
      terisi: rooms.filter(function (r) {
        return r.status === "Terisi";
      }).length,
      perbaikan: rooms.filter(function (r) {
        return r.status === "Perbaikan";
      }).length,
      putraTersedia: rooms.filter(function (r) {
        return r.kategori === "Putra" && r.status === "Tersedia";
      }).length,
      putriTersedia: rooms.filter(function (r) {
        return r.kategori === "Putri" && r.status === "Tersedia";
      }).length,
    };
  }

  function statsFinance() {
    var bills = DB.getBills();
    var payments = DB.getPayments();
    var unpaid = bills.filter(function (b) {
      return b.status === "Belum Lunas" || b.status === "Ditolak";
    }).length;
    var waiting = payments.filter(function (p) {
      return p.status === "Menunggu Verifikasi";
    }).length;
    var income = payments
      .filter(function (p) {
        return p.status === "Lunas";
      })
      .reduce(function (sum, p) {
        return sum + Number(p.nominalTransfer || 0);
      }, 0);
    return { unpaid: unpaid, waiting: waiting, income: income };
  }

  function renderDashboard() {
    var content = document.getElementById("adminContent");
    if (!content) return;
    var sr = statsRooms();
    var sf = statsFinance();
    var tenants = DB.getTenants().filter(function (t) {
      return t.status === "Aktif";
    });
    var regs = DB.getRegistrations().filter(function (r) {
      return r.status === "Menunggu Persetujuan";
    });
    var payments = DB.getPayments()
      .slice()
      .sort(function (a, b) {
        return new Date(b.tanggalUpload) - new Date(a.tanggalUpload);
      })
      .slice(0, 5);
    var recentRegs = DB.getRegistrations()
      .slice()
      .sort(function (a, b) {
        return new Date(b.tanggalPendaftaran) - new Date(a.tanggalPendaftaran);
      })
      .slice(0, 5);
    var contracts = DB.getContracts().filter(function (c) {
      return c.status === "Aktif";
    });
    var expiring = contracts.filter(function (c) {
      return (
        DB.daysUntil(c.tanggalBerakhir) <= 60 &&
        DB.daysUntil(c.tanggalBerakhir) >= 0
      );
    });

    var cards = [
      { label: "Total Kamar", value: sr.total, color: "primary" },
      { label: "Tersedia", value: sr.tersedia, color: "success" },
      { label: "Terisi", value: sr.terisi, color: "info" },
      { label: "Perbaikan", value: sr.perbaikan, color: "warning" },
      { label: "Putra Tersedia", value: sr.putraTersedia, color: "primary" },
      { label: "Putri Tersedia", value: sr.putriTersedia, color: "primary" },
      { label: "Penghuni Aktif", value: tenants.length, color: "secondary" },
      { label: "Pendaftaran Baru", value: regs.length, color: "warning" },
      { label: "Tagihan Belum Lunas", value: sf.unpaid, color: "danger" },
      { label: "Menunggu Verifikasi", value: sf.waiting, color: "warning" },
      {
        label: "Pendapatan Lunas",
        value: DB.formatRupiah(sf.income),
        color: "success",
      },
    ];

    var statHtml =
      '<div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 mb-4">';
    cards.forEach(function (c) {
      statHtml +=
        '<div class="col"><div class="card border-' +
        c.color +
        ' h-100"><div class="card-body">' +
        '<p class="text-muted small mb-1">' +
        escapeHtml(c.label) +
        "</p>" +
        '<h4 class="mb-0 text-' +
        c.color +
        '">' +
        escapeHtml(String(c.value)) +
        "</h4>" +
        "</div></div></div>";
    });
    statHtml += "</div>";

    var occupancyPct = sr.total ? Math.round((sr.terisi / sr.total) * 100) : 0;
    var incomePct =
      sf.income > 0
        ? Math.min(100, Math.round((sf.income / 48000000) * 100))
        : 0;

    var chartsHtml =
      '<div class="row g-3 mb-4">' +
      '<div class="col-md-6"><div class="card h-100"><div class="card-body">' +
      '<h6 class="card-title">Keterisian Kamar</h6>' +
      '<div class="progress mb-2" role="progressbar"><div class="progress-bar bg-info" id="progOccupancy"></div></div>' +
      '<p class="small text-muted mb-0">' +
      sr.terisi +
      " dari " +
      sr.total +
      " kamar terisi (" +
      occupancyPct +
      "%)</p>" +
      "</div></div></div>" +
      '<div class="col-md-6"><div class="card h-100"><div class="card-body">' +
      '<h6 class="card-title">Pendapatan Lunas</h6>' +
      '<div class="progress mb-2" role="progressbar"><div class="progress-bar bg-success" id="progIncome"></div></div>' +
      '<p class="small text-muted mb-0">Total pendapatan lunas: ' +
      DB.formatRupiah(sf.income) +
      "</p>" +
      "</div></div></div>" +
      "</div>";

    function tablePayments() {
      if (!payments.length)
        return '<p class="text-muted mb-0">Belum ada pembayaran.</p>';
      var h =
        '<div class="table-responsive"><table class="table table-sm mb-0"><thead><tr><th>ID</th><th>Penghuni</th><th>Nominal</th><th>Status</th></tr></thead><tbody>';
      payments.forEach(function (p) {
        var t = DB.getTenantById(p.tenantId);
        var badge =
          p.status === "Lunas"
            ? "bg-success"
            : p.status === "Ditolak"
              ? "bg-danger"
              : "bg-warning text-dark";
        h +=
          '<tr><td class="small">' +
          escapeHtml(p.id) +
          "</td><td>" +
          escapeHtml(t ? t.nama : "-") +
          "</td><td>" +
          DB.formatRupiah(p.nominalTransfer) +
          '</td><td><span class="badge ' +
          badge +
          '">' +
          escapeHtml(p.status) +
          "</span></td></tr>";
      });
      h += "</tbody></table></div>";
      return h;
    }

    function tableRegs() {
      if (!recentRegs.length)
        return '<p class="text-muted mb-0">Belum ada pendaftaran.</p>';
      var h =
        '<div class="table-responsive"><table class="table table-sm mb-0"><thead><tr><th>Nama</th><th>Kamar</th><th>Status</th></tr></thead><tbody>';
      recentRegs.forEach(function (r) {
        var room = DB.getRoomById(r.roomId);
        h +=
          "<tr><td>" +
          escapeHtml(r.nama) +
          "</td><td>" +
          escapeHtml(room ? room.nomorKamar : "-") +
          '</td><td><span class="badge bg-warning text-dark">' +
          escapeHtml(r.status) +
          "</span></td></tr>";
      });
      h += "</tbody></table></div>";
      return h;
    }

    function listExpiring() {
      if (!expiring.length)
        return '<p class="text-muted mb-0">Tidak ada kontrak yang hampir berakhir.</p>';
      var h = '<ul class="list-group list-group-flush">';
      expiring.forEach(function (c) {
        var t = DB.getTenantById(c.tenantId);
        var room = DB.getRoomById(c.roomId);
        h +=
          '<li class="list-group-item d-flex justify-content-between"><span>' +
          escapeHtml(t ? t.nama : "-") +
          " (" +
          escapeHtml(room ? room.nomorKamar : "-") +
          ')</span><span class="badge bg-warning text-dark">' +
          DB.daysUntil(c.tanggalBerakhir) +
          " hari</span></li>";
      });
      h += "</ul>";
      return h;
    }

    content.innerHTML =
      statHtml +
      chartsHtml +
      '<div class="row g-3">' +
      '<div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Pembayaran Terbaru</div><div class="card-body">' +
      tablePayments() +
      "</div></div></div>" +
      '<div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Pendaftaran Terbaru</div><div class="card-body">' +
      tableRegs() +
      "</div></div></div>" +
      '<div class="col-12"><div class="card"><div class="card-header fw-bold">Kontrak Hampir Berakhir</div><div class="card-body">' +
      listExpiring() +
      "</div></div></div>" +
      "</div>";

    var prog1 = document.getElementById("progOccupancy");
    if (prog1) {
      prog1.style.width = occupancyPct + "%";
    }
    var prog2 = document.getElementById("progIncome");
    if (prog2) {
      prog2.style.width = incomePct + "%";
    }
  }

  window.AdminApp = {
    escapeHtml: escapeHtml,
    initAdminPage: initAdminPage,
    renderDashboard: renderDashboard,
    statsRooms: statsRooms,
    statsFinance: statsFinance,
  };
})();
