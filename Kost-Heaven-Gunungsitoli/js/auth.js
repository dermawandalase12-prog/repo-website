(function () {
  "use strict";

  const SESSION_KEY = "kost_session";

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(data) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function login(username, password) {
    const users = DB.getUsers();
    const user = users.find(function (u) {
      return (
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
      );
    });
    if (!user)
      return { success: false, message: "Username atau password salah." };
    setSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      loginAt: new Date().toISOString(),
    });
    return { success: true, user: user };
  }

  function logout() {
    clearSession();
    const path = window.location.pathname;
    if (path.indexOf("/admin/") !== -1 || path.indexOf("/penghuni/") !== -1) {
      window.location.href = "../login.html";
    } else {
      window.location.href = "login.html";
    }
  }

  function requireAdmin() {
    const s = getSession();
    if (!s || s.role !== "admin") {
      window.location.href = "../login.html";
      return null;
    }
    return DB.getUserById(s.userId);
  }

  function requirePenghuni() {
    const s = getSession();
    if (!s || s.role !== "penghuni") {
      window.location.href = "../login.html";
      return null;
    }
    return DB.getUserById(s.userId);
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return DB.getUserById(s.userId);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function redirectIfLoggedIn() {
    const s = getSession();
    if (!s) return;
    if (s.role === "admin") {
      window.location.href = "admin/dashboard.html";
    } else if (s.role === "penghuni") {
      window.location.href = "penghuni/dashboard.html";
    }
  }

  function updateNavbar() {
    const s = getSession();
    const navLogin = document.getElementById("navLogin");
    const navDashboard = document.getElementById("navDashboard");
    const navUserMenu = document.getElementById("navUserMenu");
    const navUserName = document.getElementById("navUserName");
    const navUserRole = document.getElementById("navUserRole");
    const navLogoutBtn = document.getElementById("navLogoutBtn");

    if (!s) return;
    const user = DB.getUserById(s.userId);
    if (!user) return;

    if (navLogin) navLogin.classList.add("d-none");
    if (navDashboard) {
      navDashboard.classList.remove("d-none");
      navDashboard.href =
        s.role === "admin" ? "admin/dashboard.html" : "penghuni/dashboard.html";
    }
    if (navUserMenu) navUserMenu.classList.remove("d-none");
    if (navUserName) navUserName.textContent = user.nama;
    if (navUserRole)
      navUserRole.textContent = s.role === "admin" ? "Admin" : "Penghuni";
    if (navLogoutBtn) {
      navLogoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  function notifyUser(userId, judul, pesan, jenis, relatedId, targetPage) {
    const notifications = DB.getNotifications();
    notifications.push({
      id: DB.generateId("NOTIF"),
      recipientUserId: userId,
      judul: judul,
      pesan: pesan,
      jenis: jenis || "umum",
      relatedId: relatedId || "",
      targetPage: targetPage || "",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    DB.saveNotifications(notifications);
  }

  function notifyAdmin(judul, pesan, jenis, relatedId, targetPage) {
    const admin = DB.getUsers().find(function (u) {
      return u.role === "admin";
    });
    if (admin) notifyUser(admin.id, judul, pesan, jenis, relatedId, targetPage);
  }

  function notifyTenant(tenantId, judul, pesan, jenis, relatedId, targetPage) {
    const tenant = DB.getTenantById(tenantId);
    if (tenant && tenant.userId) {
      notifyUser(tenant.userId, judul, pesan, jenis, relatedId, targetPage);
    }
  }

  window.Auth = {
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    login: login,
    logout: logout,
    requireAdmin: requireAdmin,
    requirePenghuni: requirePenghuni,
    currentUser: currentUser,
    isLoggedIn: isLoggedIn,
    redirectIfLoggedIn: redirectIfLoggedIn,
    updateNavbar: updateNavbar,
    notifyUser: notifyUser,
    notifyAdmin: notifyAdmin,
    notifyTenant: notifyTenant,
  };
})();
