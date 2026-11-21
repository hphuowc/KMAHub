/**
 * ============================================================================
 * KMA Hub — Khung Thông Báo Động & Đồng Hồ Thời Gian Thực
 * File: assets/js/core/notifications.js
 * Dùng chung cho cả 3 phân hệ: Sinh viên (student), Ban Tổ Chức (btc), Quản trị (admin)
 * ============================================================================
 */
window.KmaNotifications = (function () {
  'use strict';

  const DEFAULT_ROUTE_BY_ROLE = {
    student: 'student/makeup.html',
    btc: 'btc/attendance.html',
    admin: 'admin/events.html',
  };

  const DEFAULT_DATA = {
    student: [
      {
        id: 'st_1',
        type: 'warning',
        title: 'Check-out thiếu Check-in',
        desc: 'Bạn chưa có dữ liệu Check-in tại <strong>"Workshop AI Innovation"</strong>. Vui lòng gửi yêu cầu điểm danh bù.',
        time: '15 phút trước',
        unread: true,
        targetRoute: 'student/makeup.html',
      },
      {
        id: 'st_2',
        type: 'primary',
        title: 'Đăng ký sự kiện thành công',
        desc: 'Bạn đã đăng ký tham gia <strong>"Hội thảo An ninh mạng 2025"</strong>.',
        time: '1 giờ trước',
        unread: true,
        targetRoute: 'student/event-detail.html?event=cyber_2025',
      },
      {
        id: 'st_3',
        type: 'success',
        title: 'Điểm danh hợp lệ (+5 ĐRL)',
        desc: 'Hệ thống đã xác nhận kết quả điểm danh chuyên đề tuần trước.',
        time: '1 ngày trước',
        unread: false,
        targetRoute: 'student/history.html',
      },
      {
        id: 'st_4',
        type: 'accent',
        title: 'Sự kiện mới mở đăng ký',
        desc: 'Đoàn Thanh niên KMA vừa đăng tải <strong>"Ngày hội Sinh viên KMA"</strong>.',
        time: '3 ngày trước',
        unread: false,
        targetRoute: 'student/event-detail.html?event=gala_2025',
      },
    ],
    btc: [
      {
        id: 'btc_1',
        type: 'warning',
        title: 'Yêu cầu điểm danh bù mới',
        desc: 'Có <strong>3 sinh viên</strong> gửi yêu cầu điểm danh bù tại <strong>"Workshop AI Innovation"</strong>.',
        time: '10 phút trước',
        unread: true,
        targetRoute: 'btc/attendance.html',
      },
      {
        id: 'btc_2',
        type: 'primary',
        title: 'Danh sách đăng ký mới',
        desc: 'Sự kiện <strong>"Hội thảo An ninh mạng 2025"</strong> đã ghi nhận 86 sinh viên đăng ký.',
        time: '25 phút trước',
        unread: true,
        targetRoute: 'btc/registrants.html?event=cyber',
      },
      {
        id: 'btc_3',
        type: 'error',
        title: 'Hồ sơ quá hạn điểm danh bù',
        desc: 'Có <strong>2 hồ sơ</strong> thiếu Check-in tại tọa đàm tuần trước đã quá hạn điểm danh bù.',
        time: '5 giờ trước',
        unread: false,
        targetRoute: 'btc/attendance.html',
      },
      {
        id: 'btc_4',
        type: 'success',
        title: 'Báo cáo thống kê hoàn tất',
        desc: 'Bảng tổng hợp kết quả điểm danh tháng này đã sẵn sàng để xuất file.',
        time: '1 ngày trước',
        unread: false,
        targetRoute: 'btc/reports.html',
      },
    ],
    admin: [
      {
        id: 'ad_1',
        type: 'warning',
        title: 'Yêu cầu điểm danh bù chờ duyệt',
        desc: 'Có <strong>3 hồ sơ điểm danh bù</strong> đang chờ kiểm tra trên hệ thống.',
        time: '8 phút trước',
        unread: true,
        targetRoute: 'admin/events.html',
      },
      {
        id: 'ad_2',
        type: 'error',
        title: 'Cảnh báo truy cập hệ thống',
        desc: 'Hệ thống vừa chặn 2 phiên truy cập không hợp lệ.',
        time: '40 phút trước',
        unread: true,
        targetRoute: 'admin/system.html',
      },
      {
        id: 'ad_3',
        type: 'primary',
        title: 'Sự kiện mới được đăng tải',
        desc: 'Đoàn Thanh Niên KMA đã tạo sự kiện <strong>"Cuộc thi AI Innovation 2025"</strong>.',
        time: '3 giờ trước',
        unread: false,
        targetRoute: 'admin/events.html',
      },
      {
        id: 'ad_4',
        type: 'success',
        title: 'Đồng bộ dữ liệu sinh viên',
        desc: 'Đã cập nhật 2.440 hồ sơ tài khoản sinh viên toàn trường.',
        time: '1 ngày trước',
        unread: false,
        targetRoute: 'admin/users.html',
      },
    ],
  };

  let currentFilter = 'all';

  function getRoleFromContext(wrapEl) {
    if (wrapEl && wrapEl.getAttribute('data-notif-role')) {
      return wrapEl.getAttribute('data-notif-role');
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('role')) return params.get('role').toLowerCase();
    return (localStorage.getItem('kma_user_role') || 'student').toLowerCase();
  }

  function storageKey(role) {
    return 'kma_notifications_v3_' + role;
  }

  function loadItems(role) {
    const key = storageKey(role);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const seed = DEFAULT_DATA[role] || DEFAULT_DATA.student;
    localStorage.setItem(key, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }

  function saveItems(role, items) {
    localStorage.setItem(storageKey(role), JSON.stringify(items));
  }

  function getIconSvg(type) {
    if (type === 'success') {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    }
    if (type === 'warning') {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    }
    if (type === 'error') {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    }
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B1B1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  }

  function resolveRelativeHref(targetRoute) {
    if (!targetRoute) return '';
    if (targetRoute.startsWith('http') || targetRoute.startsWith('/') || targetRoute.startsWith('../')) {
      return targetRoute;
    }
    return '../' + targetRoute;
  }

  function renderWrap(wrapEl) {
    const role = getRoleFromContext(wrapEl);
    const items = loadItems(role);
    const unreadCount = items.filter(function (i) {
      return i.unread;
    }).length;

    const badgeEl = wrapEl.querySelector('.kma-notif-badge');
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.style.display = 'inline-flex';
        badgeEl.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      } else {
        badgeEl.style.display = 'none';
      }
    }

    let popover = wrapEl.querySelector('.kma-notif-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.className = 'kma-notif-popover';
      popover.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      wrapEl.appendChild(popover);
    }

    const visibleItems =
      currentFilter === 'unread'
        ? items.filter(function (i) {
            return i.unread;
          })
        : items;

    const listHtml =
      visibleItems.length === 0
        ? '<div class="kma-notif-empty">Không có thông báo chưa đọc.</div>'
        : visibleItems
            .map(function (item) {
              const routeAttr = item.targetRoute || DEFAULT_ROUTE_BY_ROLE[role] || 'student/home.html';
              return (
                '<div class="kma-notif-item ' +
                (item.unread ? 'unread' : '') +
                '" data-id="' +
                item.id +
                '" data-route="' +
                routeAttr +
                '">' +
                '<div class="kma-notif-avatar ' +
                item.type +
                '">' +
                getIconSvg(item.type) +
                '</div>' +
                '<div class="kma-notif-body">' +
                '<div class="kma-notif-title">' +
                item.title +
                '</div>' +
                '<div class="kma-notif-desc">' +
                item.desc +
                '</div>' +
                '<div class="kma-notif-time">' +
                item.time +
                '</div>' +
                '</div>' +
                (item.unread ? '<span class="kma-notif-unread-dot" title="Chưa đọc"></span>' : '') +
                '</div>'
              );
            })
            .join('');

    popover.innerHTML =
      '<div class="kma-notif-header">' +
      '<div class="kma-notif-heading">Thông báo</div>' +
      '<button type="button" class="kma-notif-mark-all">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
      'Đánh dấu đã đọc' +
      '</button>' +
      '</div>' +
      '<div class="kma-notif-tabs">' +
      '<button type="button" class="kma-notif-tab ' +
      (currentFilter === 'all' ? 'active' : '') +
      '" data-filter="all">Tất cả</button>' +
      '<button type="button" class="kma-notif-tab ' +
      (currentFilter === 'unread' ? 'active' : '') +
      '" data-filter="unread">Chưa đọc (' +
      unreadCount +
      ')</button>' +
      '</div>' +
      '<div class="kma-notif-list">' +
      listHtml +
      '</div>';

    const markAllBtn = popover.querySelector('.kma-notif-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function () {
        const updated = loadItems(role).map(function (i) {
          return Object.assign({}, i, { unread: false });
        });
        saveItems(role, updated);
        renderWrap(wrapEl);
      });
    }

    popover.querySelectorAll('.kma-notif-tab').forEach(function (tabBtn) {
      tabBtn.addEventListener('click', function () {
        currentFilter = tabBtn.getAttribute('data-filter') || 'all';
        renderWrap(wrapEl);
      });
    });

    popover.querySelectorAll('.kma-notif-item').forEach(function (row) {
      row.addEventListener('click', function () {
        const id = row.getAttribute('data-id');
        const route = row.getAttribute('data-route') || DEFAULT_ROUTE_BY_ROLE[role];
        const updated = loadItems(role).map(function (i) {
          return i.id === id ? Object.assign({}, i, { unread: false }) : i;
        });
        saveItems(role, updated);
        closeAllPopovers();
        if (route) {
          window.location.href = resolveRelativeHref(route);
        } else {
          renderWrap(wrapEl);
        }
      });
    });
  }

  function closeAllPopovers() {
    document.querySelectorAll('.kma-notif-wrap.open').forEach(function (w) {
      w.classList.remove('open');
    });
  }

  function initNotificationWidgets() {
    document.querySelectorAll('.kma-notif-wrap').forEach(function (wrapEl) {
      if (wrapEl.getAttribute('data-bound') === 'true') {
        renderWrap(wrapEl);
        return;
      }
      wrapEl.setAttribute('data-bound', 'true');
      renderWrap(wrapEl);

      const trigger = wrapEl.querySelector('.navbar-bell');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const wasOpen = wrapEl.classList.contains('open');
          closeAllPopovers();
          if (!wasOpen) {
            renderWrap(wrapEl);
            wrapEl.classList.add('open');
          }
        });
      }
    });
  }

  function startRealtimeClock() {
    function tick() {
      const text =
        window.KmaTimeRules && window.KmaTimeRules.formatClock
          ? window.KmaTimeRules.formatClock(new Date())
          : new Date().toLocaleString('vi-VN');
      document.querySelectorAll('.kma-live-clock').forEach(function (el) {
        el.textContent = text;
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  function pushNotification(role, title, desc, type, targetRoute) {
    const items = loadItems(role);
    items.unshift({
      id: role + '_' + Date.now(),
      type: type || 'primary',
      title: title,
      desc: desc,
      time: 'Vừa xong',
      unread: true,
      targetRoute: targetRoute || DEFAULT_ROUTE_BY_ROLE[role] || 'student/makeup.html',
    });
    saveItems(role, items);
    document.querySelectorAll('.kma-notif-wrap').forEach(renderWrap);
  }

  document.addEventListener('click', function () {
    closeAllPopovers();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllPopovers();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNotificationWidgets();
      startRealtimeClock();
    });
  } else {
    initNotificationWidgets();
    startRealtimeClock();
  }

  return {
    refresh: initNotificationWidgets,
    push: pushNotification,
  };
})();
