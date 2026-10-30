(function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const KEYS = {
    USERS: "kost_users",
    ROOMS: "kost_rooms",
    TENANTS: "kost_tenants",
    REGISTRATIONS: "kost_registrations",
    MESSAGES: "kost_messages",
    BILLS: "kost_bills",
    PAYMENTS: "kost_payments",
    CONTRACTS: "kost_contracts",
    CONTRACT_REQUESTS: "kost_contract_requests",
    COMPLAINTS: "kost_complaints",
    ANNOUNCEMENTS: "kost_announcements",
    NOTIFICATIONS: "kost_notifications",
    EXPENSES: "kost_expenses",
    SETTINGS: "kost_settings",
    SCHEMA_VERSION: "kost_schema_version",
  };

  function generateId(prefix) {
    return (
      prefix +
      "-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 7).toUpperCase()
    );
  }

  function getData(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue !== undefined ? defaultValue : [];
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading " + key, e);
      return defaultValue !== undefined ? defaultValue : [];
    }
  }

  function setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        console.error("Penyimpanan penuh. Data tidak tersimpan.");
        return false;
      }
      console.error("Error saving " + key, e);
      return false;
    }
  }

  function getRooms() {
    return getData(KEYS.ROOMS, []);
  }
  function saveRooms(d) {
    return setData(KEYS.ROOMS, d);
  }
  function getUsers() {
    return getData(KEYS.USERS, []);
  }
  function saveUsers(d) {
    return setData(KEYS.USERS, d);
  }
  function getTenants() {
    return getData(KEYS.TENANTS, []);
  }
  function saveTenants(d) {
    return setData(KEYS.TENANTS, d);
  }
  function getRegistrations() {
    return getData(KEYS.REGISTRATIONS, []);
  }
  function saveRegistrations(d) {
    return setData(KEYS.REGISTRATIONS, d);
  }
  function getMessages() {
    return getData(KEYS.MESSAGES, []);
  }
  function saveMessages(d) {
    return setData(KEYS.MESSAGES, d);
  }
  function getBills() {
    return getData(KEYS.BILLS, []);
  }
  function saveBills(d) {
    return setData(KEYS.BILLS, d);
  }
  function getPayments() {
    return getData(KEYS.PAYMENTS, []);
  }
  function savePayments(d) {
    return setData(KEYS.PAYMENTS, d);
  }
  function getContracts() {
    return getData(KEYS.CONTRACTS, []);
  }
  function saveContracts(d) {
    return setData(KEYS.CONTRACTS, d);
  }
  function getContractRequests() {
    return getData(KEYS.CONTRACT_REQUESTS, []);
  }
  function saveContractRequests(d) {
    return setData(KEYS.CONTRACT_REQUESTS, d);
  }
  function getComplaints() {
    return getData(KEYS.COMPLAINTS, []);
  }
  function saveComplaints(d) {
    return setData(KEYS.COMPLAINTS, d);
  }
  function getAnnouncements() {
    return getData(KEYS.ANNOUNCEMENTS, []);
  }
  function saveAnnouncements(d) {
    return setData(KEYS.ANNOUNCEMENTS, d);
  }
  function getNotifications() {
    return getData(KEYS.NOTIFICATIONS, []);
  }
  function saveNotifications(d) {
    return setData(KEYS.NOTIFICATIONS, d);
  }
  function getExpenses() {
    return getData(KEYS.EXPENSES, []);
  }
  function saveExpenses(d) {
    return setData(KEYS.EXPENSES, d);
  }
  function getSettings() {
    return getData(KEYS.SETTINGS, {});
  }
  function saveSettings(d) {
    return setData(KEYS.SETTINGS, d);
  }

  function getRoomById(id) {
    return getRooms().find(function (r) {
      return r.id === id;
    });
  }

  function getRoomByNumber(nomor) {
    return getRooms().find(function (r) {
      return r.nomorKamar === nomor;
    });
  }

  function getUserById(id) {
    return getUsers().find(function (u) {
      return u.id === id;
    });
  }

  function getTenantById(id) {
    return getTenants().find(function (t) {
      return t.id === id;
    });
  }

  function getTenantByUserId(userId) {
    return getTenants().find(function (t) {
      return t.userId === userId;
    });
  }

  function getBillsByTenant(tenantId) {
    return getBills().filter(function (b) {
      return b.tenantId === tenantId;
    });
  }

  function getPaymentsByBill(billId) {
    return getPayments().filter(function (p) {
      return p.billId === billId;
    });
  }

  function getPaymentsByTenant(tenantId) {
    return getPayments().filter(function (p) {
      return p.tenantId === tenantId;
    });
  }

  function getContractsByTenant(tenantId) {
    return getContracts().filter(function (c) {
      return c.tenantId === tenantId;
    });
  }

  function getActiveContract(tenantId) {
    return getContracts().find(function (c) {
      return c.tenantId === tenantId && c.status === "Aktif";
    });
  }

  function getComplaintsByTenant(tenantId) {
    return getComplaints().filter(function (c) {
      return c.tenantId === tenantId;
    });
  }

  function getNotificationsByUser(userId) {
    return getNotifications().filter(function (n) {
      return n.recipientUserId === userId;
    });
  }

  function getUnreadNotifications(userId) {
    return getNotificationsByUser(userId).filter(function (n) {
      return !n.isRead;
    });
  }

  function formatRupiah(amount) {
    return "Rp" + Number(amount).toLocaleString("id-ID");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDateShort(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  }

  function addYears(dateStr, years) {
    const d = new Date(dateStr);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().split("T")[0];
  }

  function daysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  }

  function getImagePath(folder, name) {
    const prefixes = ["jpg", "jpeg", "png", "webp"];
    const base = folder ? folder + "/" + name : name;
    for (let i = 0; i < prefixes.length; i++) {
      if (
        window.__KOST_IMAGES__ &&
        window.__KOST_IMAGES__.indexOf(base + "." + prefixes[i]) !== -1
      ) {
        return base + "." + prefixes[i];
      }
    }
    return base + ".jpg";
  }

  function getImagePathRelative(path, isSubfolder) {
    if (!path) return "";
    if (
      path.indexOf("http") === 0 ||
      path.indexOf("data:") === 0 ||
      path.indexOf("../") === 0
    ) {
      return path;
    }
    return isSubfolder ? "../" + path : path;
  }

  function statusPublic(room) {
    if (room.status === "Tersedia") return "Tersedia";
    return "Tidak Tersedia";
  }

  function initData() {
    const ver = localStorage.getItem(KEYS.SCHEMA_VERSION);
    if (ver === String(SCHEMA_VERSION)) return;

    const roomData = [
      { nomor: "K01", lantai: 1, kategori: "Putra", status: "Terisi" },
      { nomor: "K02", lantai: 1, kategori: "Putra", status: "Tersedia" },
      { nomor: "K03", lantai: 1, kategori: "Putra", status: "Terisi" },
      { nomor: "K04", lantai: 1, kategori: "Putra", status: "Tersedia" },
      { nomor: "K05", lantai: 1, kategori: "Putra", status: "Tersedia" },
      { nomor: "K06", lantai: 1, kategori: "Putra", status: "Terisi" },
      { nomor: "K07", lantai: 2, kategori: "Putri", status: "Tersedia" },
      { nomor: "K08", lantai: 2, kategori: "Putri", status: "Terisi" },
      { nomor: "K09", lantai: 2, kategori: "Putri", status: "Tersedia" },
      { nomor: "K10", lantai: 2, kategori: "Putri", status: "Terisi" },
      { nomor: "K11", lantai: 2, kategori: "Putri", status: "Tersedia" },
      { nomor: "K12", lantai: 2, kategori: "Putri", status: "Terisi" },
    ];

    const fasilitas = [
      "Ranjang tingkat dua beserta perlengkapan tidur",
      "Meja belajar",
      "Kursi",
      "Kamar mandi dalam",
      "Rak pakaian",
      "Pencahayaan dan ventilasi",
    ];

    const rooms = roomData.map(function (r, idx) {
      const id = "ROOM-" + r.nomor;
      const tenantIds = [];
      if (r.nomor === "K01") tenantIds.push("TEN-BUDI");
      if (r.nomor === "K08") tenantIds.push("TEN-SITI");
      return {
        id: id,
        nomorKamar: r.nomor,
        lantai: r.lantai,
        kategori: r.kategori,
        tipe: "Standar",
        hargaTahunan: 4000000,
        fasilitas: fasilitas.slice(),
        foto: getImagePath("images/kamar", "kamar-" + r.nomor.toLowerCase()),
        status: r.status,
        kapasitas: 1,
        tenantIds: tenantIds,
      };
    });

    const users = [
      {
        id: "USR-ADMIN",
        username: "Admin",
        password: "KostHeaven321",
        role: "admin",
        nama: "Administrator Kost-Heaven",
        email: "admin@kostheaven.id",
        nomorHP: "081234567890",
        jabatan: "Pengelola",
        fotoProfil: getImagePath("images/profil", "profil1"),
      },
      {
        id: "USR-BUDI",
        username: "Budi",
        password: "Budi123",
        role: "penghuni",
        nama: "Budi",
        email: "budi@example.com",
        nomorHP: "081234567891",
        fotoProfil: "",
      },
      {
        id: "USR-SITI",
        username: "Siti",
        password: "Siti123",
        role: "penghuni",
        nama: "Siti",
        email: "siti@example.com",
        nomorHP: "081234567892",
        fotoProfil: "",
      },
    ];

    const tenants = [
      {
        id: "TEN-BUDI",
        userId: "USR-BUDI",
        nama: "Budi",
        kategori: "Putra",
        email: "budi@example.com",
        nomorHP: "081234567891",
        alamatAsal: "Gunungsitoli",
        fotoProfil: "",
        roomId: "ROOM-K01",
        tanggalMasuk: "2025-01-01",
        status: "Aktif",
      },
      {
        id: "TEN-SITI",
        userId: "USR-SITI",
        nama: "Siti",
        kategori: "Putri",
        email: "siti@example.com",
        nomorHP: "081234567892",
        alamatAsal: "Gunungsitoli",
        fotoProfil: "",
        roomId: "ROOM-K08",
        tanggalMasuk: "2025-01-01",
        status: "Aktif",
      },
    ];

    const contracts = [
      {
        id: "KTR-BUDI-001",
        tenantId: "TEN-BUDI",
        roomId: "ROOM-K01",
        tanggalMulai: "2025-01-01",
        tanggalBerakhir: "2025-12-31",
        durasi: 12,
        hargaSewa: 4000000,
        status: "Aktif",
      },
      {
        id: "KTR-SITI-001",
        tenantId: "TEN-SITI",
        roomId: "ROOM-K08",
        tanggalMulai: "2025-01-01",
        tanggalBerakhir: "2025-12-31",
        durasi: 12,
        hargaSewa: 4000000,
        status: "Aktif",
      },
    ];

    const bills = [
      {
        id: "BILL-BUDI-001",
        tenantId: "TEN-BUDI",
        roomId: "ROOM-K01",
        contractId: "KTR-BUDI-001",
        periode: "2025",
        jenisTagihan: "Sewa Tahunan",
        nominal: 4000000,
        tanggalTerbit: "2025-01-01",
        jatuhTempo: "2025-01-31",
        status: "Belum Lunas",
      },
      {
        id: "BILL-SITI-001",
        tenantId: "TEN-SITI",
        roomId: "ROOM-K08",
        contractId: "KTR-SITI-001",
        periode: "2025",
        jenisTagihan: "Sewa Tahunan",
        nominal: 4000000,
        tanggalTerbit: "2025-01-01",
        jatuhTempo: "2025-01-31",
        status: "Belum Lunas",
      },
    ];

    const announcements = [
      {
        id: "ANN-001",
        judul: "Selamat Datang di Kost-Heaven",
        kategori: "Umum",
        isi: "Selamat datang bagi seluruh penghuni Kost-Heaven-Gunungsitoli. Mari jaga kebersihan dan ketertiban bersama.",
        targetPenghuni: "Semua",
        tanggalPublikasi: "2025-01-01",
        status: "Publik",
        createdBy: "USR-ADMIN",
      },
    ];

    const settings = {
      namaKost: "Kost-Heaven-Gunungsitoli",
      deskripsi:
        "Kost-Heaven-Gunungsitoli merupakan konsep hunian kost yang dikembangkan dengan semangat memberikan kenyamanan, kemudahan, dan pelayanan yang baik kepada penghuni.",
      alamat: "Gunungsitoli, Kepulauan Nias, Sumatera Utara",
      telepon: "081534426267",
      whatsapp: "081534426267",
      email: "info@kostheaven.id",
      jamPelayanan: "Senin - Sabtu, 08:00 - 17:00 WIB",
      googleMaps: "",
      namaBank: "Bank BRI",
      nomorRekening: "1234567890",
      namaPemilikRekening: "Kost-Heaven",
      logo: "",
      fotoUtama: getImagePath("images/kost", "kost-depan"),
      fasilitasUmum: "Parkir, Wi-Fi, Keamanan 24 jam, Area jemur",
      peraturan:
        "Dilarang membawa tamu lawan jenis ke dalam kamar. Menjaga kebersihan area bersama. Membayar sewa tepat waktu.",
      pembagianLantai: "Lantai 1: Putra (K01-K06). Lantai 2: Putri (K07-K12).",
    };

    const expenses = [
      {
        id: "EXP-001",
        keterangan: "Perawatan kebersihan bulan Januari",
        nominal: 500000,
        tanggal: "2025-01-15",
      },
    ];

    saveRooms(rooms);
    saveUsers(users);
    saveTenants(tenants);
    saveContracts(contracts);
    saveBills(bills);
    savePayments([]);
    saveAnnouncements(announcements);
    saveSettings(settings);
    saveExpenses(expenses);
    saveRegistrations([]);
    saveMessages([]);
    saveContractRequests([]);
    saveComplaints([]);
    saveNotifications([]);

    localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
  }

  window.DB = {
    KEYS: KEYS,
    generateId: generateId,
    getData: getData,
    setData: setData,
    getRooms: getRooms,
    saveRooms: saveRooms,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getTenants: getTenants,
    saveTenants: saveTenants,
    getRegistrations: getRegistrations,
    saveRegistrations: saveRegistrations,
    getMessages: getMessages,
    saveMessages: saveMessages,
    getBills: getBills,
    saveBills: saveBills,
    getPayments: getPayments,
    savePayments: savePayments,
    getContracts: getContracts,
    saveContracts: saveContracts,
    getContractRequests: getContractRequests,
    saveContractRequests: saveContractRequests,
    getComplaints: getComplaints,
    saveComplaints: saveComplaints,
    getAnnouncements: getAnnouncements,
    saveAnnouncements: saveAnnouncements,
    getNotifications: getNotifications,
    saveNotifications: saveNotifications,
    getExpenses: getExpenses,
    saveExpenses: saveExpenses,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getRoomById: getRoomById,
    getRoomByNumber: getRoomByNumber,
    getUserById: getUserById,
    getTenantById: getTenantById,
    getTenantByUserId: getTenantByUserId,
    getBillsByTenant: getBillsByTenant,
    getPaymentsByBill: getPaymentsByBill,
    getPaymentsByTenant: getPaymentsByTenant,
    getContractsByTenant: getContractsByTenant,
    getActiveContract: getActiveContract,
    getComplaintsByTenant: getComplaintsByTenant,
    getNotificationsByUser: getNotificationsByUser,
    getUnreadNotifications: getUnreadNotifications,
    formatRupiah: formatRupiah,
    formatDate: formatDate,
    formatDateShort: formatDateShort,
    todayISO: todayISO,
    addMonths: addMonths,
    addYears: addYears,
    daysUntil: daysUntil,
    getImagePath: getImagePath,
    getImagePathRelative: getImagePathRelative,
    statusPublic: statusPublic,
    initData: initData,
  };

  initData();

  window.addEventListener("storage", function (e) {
    if (e.key && e.key.indexOf("kost_") === 0) {
      if (typeof window.onKostDataChange === "function") {
        window.onKostDataChange(e.key);
      }
    }
  });
})();
