/**
 * KMA Hub — Trang Hồ sơ tài khoản đồng bộ theo từng phân hệ
 * File: assets/js/pages/common/account-info.js
 */

function getCurrentRole() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramRole = urlParams.get('role');
  if (paramRole) return paramRole.toLowerCase();

  const storedRole = localStorage.getItem('kma_user_role');
  if (storedRole) return storedRole.toLowerCase();

  return 'student';
}

function buildBellHtml(role) {
  return (
    '<div class="kma-notif-wrap" data-notif-role="' +
    role +
    '">' +
    '<button type="button" class="navbar-bell" title="Thông báo" aria-label="Thông báo">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
    '<span class="kma-notif-badge" style="display:none;">0</span>' +
    '</button>' +
    '</div>'
  );
}

function buildClockPillHtml() {
  return (
    '<div class="kma-clock-pill" title="Thời gian thực hệ thống">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
    '<span class="kma-live-clock">--:--:--</span>' +
    '</div>'
  );
}

function buildProfileBodyHtml(cfg, isStudentMode) {
  return (
    '<div class="account-container ' +
    (isStudentMode ? 'student-mode' : '') +
    '">' +
    '<div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">' +
    '<div>' +
    '<h1 style="font-size: 26px; font-weight: 800; color: var(--color-text-primary); margin-bottom: 4px;">' +
    cfg.pageTitle +
    '</h1>' +
    '<p style="font-size: 14px; color: var(--color-text-muted);">' +
    cfg.pageSubtitle +
    '</p>' +
    '</div>' +
    '<div>' +
    '<a href="' +
    cfg.backHref +
    '" class="btn btn-outline btn-sm">' +
    cfg.backLabel +
    '</a>' +
    '</div>' +
    '</div>' +
    '<div class="profile-hero-card ' +
    (cfg.heroTheme || '') +
    '">' +
    '<div class="profile-avatar-large">' +
    cfg.avatarText +
    '</div>' +
    '<h2 style="font-size: 24px; font-weight: 800; color: var(--color-text-primary); margin-bottom: 8px; position: relative; z-index: 1;">' +
    cfg.heroName +
    '</h2>' +
    '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; position: relative; z-index: 1; flex-wrap: wrap;">' +
    cfg.badgesHtml +
    '</div>' +
    '<div style="font-size: 14px; font-weight: 700; color: var(--color-primary); position: relative; z-index: 1;">' +
    cfg.heroCode +
    '</div>' +
    '</div>' +
    '<div class="card" style="margin-bottom: 24px;">' +
    '<div class="card-header" style="display: flex; align-items: center; gap: 10px; background: var(--color-bg-white);">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg>' +
    '<h3 style="font-size: 16px; font-weight: 700; margin: 0;">' +
    cfg.infoTitle +
    '</h3>' +
    '</div>' +
    '<div class="card-body">' +
    '<div class="info-grid">' +
    cfg.infoGridHtml +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="card">' +
    '<div class="card-header" style="display: flex; align-items: center; gap: 10px; background: var(--color-bg-white);">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
    '<h3 style="font-size: 16px; font-weight: 700; margin: 0;">Bảo mật tài khoản</h3>' +
    '</div>' +
    '<div class="card-body">' +
    cfg.securityHtml +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

function renderProfile() {
  const role = getCurrentRole();
  const root = document.getElementById('accountRootShell');

  if (role === 'btc') {
    document.title = 'Hồ sơ Ban Tổ Chức — KMA Hub';
    const bodyContent = buildProfileBodyHtml(
      {
        pageTitle: 'Hồ sơ Ban Tổ Chức',
        pageSubtitle: 'Thông tin đơn vị tổ chức sự kiện thuộc Học viện Kỹ thuật Mật mã',
        backHref: '../btc/dashboard.html',
        backLabel: 'Về Tổng quan',
        avatarText: 'BTC',
        heroName: 'Đoàn Thanh Niên — Ban Tổ Chức KMA',
        badgesHtml:
          '<span class="badge badge-primary">Ban Tổ Chức</span>' +
          '<span class="badge badge-success">Đang hoạt động</span>',
        heroCode: 'Mã đơn vị: BTC_DOANTRUONG',
        infoTitle: 'Thông tin đơn vị',
        infoGridHtml:
          '<div class="info-item"><span class="info-label">Đơn vị chủ quản</span><span class="info-val">Đoàn Thanh niên Học viện KMA</span></div>' +
          '<div class="info-item"><span class="info-label">Mã định danh</span><span class="info-val" style="color: var(--color-primary);">BTC_DOANTRUONG</span></div>' +
          '<div class="info-item"><span class="info-label">Email công vụ</span><span class="info-val">btc_doantruong@actvn.edu.vn</span></div>' +
          '<div class="info-item"><span class="info-label">Điện thoại liên hệ</span><span class="info-val">024.3854.3930</span></div>' +
          '<div class="info-item"><span class="info-label">Trạng thái tài khoản</span><span class="info-val" style="color: var(--color-success);">Đã xác thực</span></div>' +
          '<div class="info-item"><span class="info-label">Phạm vi quản lý</span><span class="info-val">Sự kiện sinh viên toàn Học viện</span></div>',
        securityHtml:
          '<div class="security-row"><div class="security-info"><div class="security-title">Mật khẩu tài khoản</div><div class="security-desc">Quản lý mật khẩu đăng nhập tài khoản đơn vị</div></div><div><button class="btn btn-outline btn-sm" onclick="openPasswordModal()">Đổi mật khẩu</button></div></div>' +
          '<div class="security-row"><div class="security-info"><div class="security-title">Quyền điều hành sự kiện & điểm danh</div><div class="security-desc">Tạo sự kiện, theo dõi danh sách và xét duyệt điểm danh bù</div></div><div><span class="badge badge-success">Đang kích hoạt</span></div></div>' +
          '<div class="security-row"><div class="security-info"><div class="security-title">Phiên làm việc hiện tại</div><div class="security-desc">Đang đăng nhập trên trình duyệt này</div></div><div><button class="btn btn-danger btn-sm" onclick="handleLogoutAll()">Đăng xuất tất cả</button></div></div>',
      },
      false
    );

    root.innerHTML =
      '<div class="layout-btc">' +
      '<aside class="sidebar">' +
      '<div class="sidebar-brand"><img src="../../assets/images/kma-logo.png" alt="Logo Học viện Kỹ thuật Mật mã" class="sidebar-brand-logo" /><div><h2>KMA <span>Hub</span></h2><p>Học viện Kỹ thuật Mật mã</p></div></div>' +
      '<nav class="sidebar-nav">' +
      '<a href="../btc/dashboard.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></span><span>Tổng quan</span></a>' +
      '<a href="../btc/events.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span><span>Quản lý sự kiện</span></a>' +
      '<a href="../btc/registrants.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span><span>Danh sách đăng ký</span></a>' +
      '<a href="../btc/attendance.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span><span>Quản lý điểm danh</span></a>' +
      '<a href="../btc/reports.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></span><span>Thống kê</span></a>' +
      '</nav>' +
      '<div class="sidebar-footer">' +
      '<a href="account-info.html?role=btc" class="sidebar-profile-card active" title="Hồ sơ Ban Tổ Chức">' +
      '<div class="sidebar-profile-avatar">BTC</div>' +
      '<div class="sidebar-profile-info"><div class="sidebar-profile-name">Ban Tổ Chức</div><div class="sidebar-profile-sub">btc_doantruong@actvn.edu.vn</div></div>' +
      '</a>' +
      '<a href="../auth/login.html" class="sidebar-link" style="color: rgba(255,255,255,0.8);" onclick="localStorage.removeItem(\'kma_user_role\')">' +
      '<span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></span><span>Đăng xuất</span>' +
      '</a>' +
      '</div>' +
      '</aside>' +
      '<div class="btc-main">' +
      '<div class="btc-topbar">' +
      '<div style="display: flex; align-items: center; gap: 14px;">' +
      '<button type="button" class="mobile-menu-btn" onclick="document.querySelector(\'.sidebar\').classList.toggle(\'open\')" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>' +
      '<div style="font-size: 14px; font-weight: 800; color: var(--color-primary); letter-spacing: 0.4px; display: flex; align-items: center; gap: 8px;"><span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--color-accent);"></span>BAN TỔ CHỨC SỰ KIỆN HỌC VIỆN KỸ THUẬT MẬT MÃ</div>' +
      '</div>' +
      '<div style="display: flex; align-items: center; gap: 14px;">' +
      buildClockPillHtml() +
      buildBellHtml('btc') +
      '</div>' +
      '</div>' +
      '<div class="btc-content">' +
      bodyContent +
      '</div>' +
      '</div>' +
      '</div>';
  } else if (role === 'admin') {
    document.title = 'Hồ sơ Quản trị viên — KMA Hub';
    const bodyContent = buildProfileBodyHtml(
      {
        pageTitle: 'Hồ sơ Quản trị hệ thống',
        pageSubtitle: 'Thông tin tài khoản quản trị hệ thống Học viện Kỹ thuật Mật mã',
        backHref: '../admin/dashboard.html',
        backLabel: 'Về Tổng quan',
        heroTheme: 'admin-theme',
        avatarText: 'AD',
        heroName: 'Admin Quản trị Hệ thống',
        badgesHtml:
          '<span class="badge badge-primary">Quản trị hệ thống</span>' +
          '<span class="badge badge-success">Đang hoạt động</span>',
        heroCode: 'Tài khoản: admin@actvn.edu.vn',
        infoTitle: 'Thông tin Quản trị viên',
        infoGridHtml:
          '<div class="info-item"><span class="info-label">Đơn vị phụ trách</span><span class="info-val">Phòng Đào tạo & CNTT • Học viện KMA</span></div>' +
          '<div class="info-item"><span class="info-label">Email quản trị</span><span class="info-val" style="color: var(--color-primary);">admin@actvn.edu.vn</span></div>' +
          '<div class="info-item"><span class="info-label">Cấp độ phân quyền</span><span class="info-val">Quản trị viên Hệ thống</span></div>' +
          '<div class="info-item"><span class="info-label">Ngưỡng xác thực khuôn mặt</span><span class="info-val" style="color: var(--color-success);">≥ 85%</span></div>',
        securityHtml:
          '<div class="security-row"><div class="security-info"><div class="security-title">Mật khẩu Quản trị viên</div><div class="security-desc">Quản lý mật khẩu bảo mật tài khoản quản trị</div></div><div><button class="btn btn-outline btn-sm" onclick="openPasswordModal()">Đổi mật khẩu</button></div></div>' +
          '<div class="security-row"><div class="security-info"><div class="security-title">Quyền giám sát & cấu hình hệ thống</div><div class="security-desc">Quản lý tài khoản, danh mục sự kiện và kiểm duyệt điểm danh bù</div></div><div><span class="badge badge-success">Toàn quyền</span></div></div>' +
          '<div class="security-row"><div class="security-info"><div class="security-title">Phiên quản trị hiện tại</div><div class="security-desc">Đang đăng nhập trên trình duyệt này</div></div><div><button class="btn btn-danger btn-sm" onclick="handleLogoutAll()">Đăng xuất tất cả</button></div></div>',
      },
      false
    );

    root.innerHTML =
      '<div class="layout-btc">' +
      '<aside class="sidebar">' +
      '<div class="sidebar-brand"><img src="../../assets/images/kma-logo.png" alt="Logo Học viện Kỹ thuật Mật mã" class="sidebar-brand-logo" /><div><h2>KMA <span>Hub</span></h2><p>Học viện Kỹ thuật Mật mã</p></div></div>' +
      '<nav class="sidebar-nav">' +
      '<a href="../admin/dashboard.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></span><span>Tổng quan</span></a>' +
      '<a href="../admin/users.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span><span>Tài khoản & Phân quyền</span></a>' +
      '<a href="../admin/events.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span><span>Giám sát sự kiện</span></a>' +
      '<a href="../admin/categories.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span><span>Danh mục sự kiện</span></a>' +
      '<a href="../admin/system.html" class="sidebar-link"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span><span>Cấu hình AI & Hệ thống</span></a>' +
      '</nav>' +
      '<div class="sidebar-footer">' +
      '<a href="account-info.html?role=admin" class="sidebar-profile-card active" title="Hồ sơ Quản trị viên">' +
      '<div class="sidebar-profile-avatar">AD</div>' +
      '<div class="sidebar-profile-info"><div class="sidebar-profile-name">Admin quản trị hệ thống</div><div class="sidebar-profile-sub">admin@actvn.edu.vn</div></div>' +
      '</a>' +
      '<a href="../auth/login.html" class="sidebar-link" style="color: rgba(255,255,255,0.8);" onclick="localStorage.removeItem(\'kma_user_role\')">' +
      '<span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></span><span>Đăng xuất</span>' +
      '</a>' +
      '</div>' +
      '</aside>' +
      '<div class="btc-main">' +
      '<div class="btc-topbar">' +
      '<div style="display: flex; align-items: center; gap: 14px;">' +
      '<button type="button" class="mobile-menu-btn" onclick="document.querySelector(\'.sidebar\').classList.toggle(\'open\')" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>' +
      '<div style="font-size: 14px; font-weight: 800; color: var(--color-primary); letter-spacing: 0.4px; display: flex; align-items: center; gap: 8px;"><span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--color-accent);"></span>HỆ THỐNG ADMIN</div>' +
      '</div>' +
      '<div style="display: flex; align-items: center; gap: 14px;">' +
      buildClockPillHtml() +
      buildBellHtml('admin') +
      '</div>' +
      '</div>' +
      '<div class="btc-content">' +
      bodyContent +
      '</div>' +
      '</div>' +
      '</div>';
  } else {
    document.title = 'Thông tin sinh viên — KMA Hub';
    const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
    const bodyContent = buildProfileBodyHtml(
      {
        pageTitle: 'Thông tin tài khoản sinh viên',
        pageSubtitle: 'Hồ sơ cá nhân sinh viên Học viện Kỹ thuật Mật mã',
        backHref: '../student/history.html',
        backLabel: 'Xem lịch sử điểm danh',
        avatarText: 'A',
        heroName: 'Nguyễn Văn A',
        badgesHtml:
          '<span class="badge badge-primary">Sinh viên</span>' +
          '<span class="badge badge-success">Chính quy KMA</span>',
        heroCode: 'MSSV: ' + studentId,
        infoTitle: 'Thông tin sinh viên',
        infoGridHtml:
          '<div class="info-item"><span class="info-label">Họ và tên</span><span class="info-val">Nguyễn Văn A</span></div>' +
          '<div class="info-item"><span class="info-label">Mã số sinh viên</span><span class="info-val" style="color: var(--color-primary);">' +
          studentId +
          '</span></div>' +
          '<div class="info-item"><span class="info-label">Email học viện</span><span class="info-val">' +
          studentId.toLowerCase() +
          '@actvn.edu.vn</span></div>' +
          '<div class="info-item"><span class="info-label">Lớp niên chế</span><span class="info-val">AT18A</span></div>' +
          '<div class="info-item"><span class="info-label">Khóa đào tạo</span><span class="info-val">AT18 (2021 - 2026)</span></div>' +
          '<div class="info-item"><span class="info-label">Khoa chuyên môn</span><span class="info-val">An toàn Thông tin</span></div>' +
          '<div class="info-item"><span class="info-label">Số điện thoại</span><span class="info-val">0987***456</span></div>' +
          '<div class="info-item"><span class="info-label">Ngày sinh</span><span class="info-val">12/08/2003</span></div>',
        securityHtml:
          '<div class="security-row"><div class="security-info"><div class="security-title">Mật khẩu cá nhân</div><div class="security-desc">Quản lý mật khẩu đăng nhập hệ thống</div></div><div><button class="btn btn-outline btn-sm" onclick="openPasswordModal()">Đổi mật khẩu</button></div></div>' +
          '<div class="security-row"><div class="security-info"><div class="security-title">Phiên đăng nhập</div><div class="security-desc">Đang hoạt động trên thiết bị hiện tại</div></div><div><button class="btn btn-danger btn-sm" onclick="handleLogoutAll()">Đăng xuất tất cả</button></div></div>',
      },
      true
    );

    root.innerHTML =
      '<header class="navbar">' +
      '<div class="navbar-left">' +
      '<a href="../student/home.html" class="navbar-brand"><img src="../../assets/images/kma-logo.png" alt="Logo Học viện Kỹ thuật Mật mã" class="navbar-brand-logo" /><div>KMA <span>Hub</span><div style="font-size: 10px; font-weight: 500; color: var(--color-text-muted); line-height: 1;">Học viện Kỹ thuật Mật mã</div></div></a>' +
      '<button type="button" class="mobile-menu-btn" onclick="document.querySelector(\'.navbar\').classList.toggle(\'open\')" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
      '<nav class="navbar-nav">' +
      '<a href="../student/home.html">Trang chủ</a>' +
      '<a href="../student/event-detail.html">Sự kiện</a>' +
      '<a href="../student/attendance.html">Điểm danh</a>' +
      '<a href="../student/history.html">Lịch sử</a>' +
      '<a href="../student/makeup.html">Bổ sung</a>' +
      '</nav>' +
      '</div>' +
      '<div class="navbar-user">' +
      buildClockPillHtml() +
      buildBellHtml('student') +
      '<a href="account-info.html?role=student" class="navbar-profile-link active" title="Xem thông tin cá nhân">' +
      '<div class="avatar">A</div>' +
      '<div><div style="font-size: 13px; font-weight: 700; line-height: 1.25;">Nguyễn Văn A</div><div style="font-size: 11px; color: var(--color-text-muted); line-height: 1.25;">AT180123 • AT18</div></div>' +
      '</a>' +
      '<a href="../auth/login.html" class="btn btn-ghost btn-sm" onclick="localStorage.removeItem(\'kma_user_role\')">Đăng xuất</a>' +
      '</div>' +
      '</header>' +
      '<main class="page-content">' +
      bodyContent +
      '</main>';
  }

  if (window.KmaNotifications && window.KmaNotifications.refresh) {
    window.KmaNotifications.refresh();
  }
}

function openPasswordModal() {
  document.getElementById('passwordModal').classList.add('active');
}
function closePasswordModal() {
  document.getElementById('passwordModal').classList.remove('active');
}
async function handlePasswordSubmit(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('oldPasswordInput') ? document.getElementById('oldPasswordInput').value : '';
  const newPassword = document.getElementById('newPasswordInput') ? document.getElementById('newPasswordInput').value : '';
  const confirmPassword = document.getElementById('confirmPasswordInput') ? document.getElementById('confirmPasswordInput').value : '';

  if (newPassword !== confirmPassword) {
    alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
    return;
  }

  if (window.KmaApi) {
    try {
      const res = await window.KmaApi.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert(res.message || 'Đổi mật khẩu thành công trong MySQL!');
      closePasswordModal();
      const form = document.getElementById('changePasswordForm');
      if (form) form.reset();
      return;
    } catch (err) {
      alert('Lỗi đổi mật khẩu: ' + err.message);
      return;
    }
  }

  alert('Đổi mật khẩu thành công.');
  closePasswordModal();
}
function handleLogoutAll() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị?')) {
    localStorage.clear();
    window.location.href = '../auth/login.html';
  }
}

renderProfile();
