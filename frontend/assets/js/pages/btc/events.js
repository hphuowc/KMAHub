/**
 * KMA Hub — Ban Tổ Chức (BTC): Quản lý sự kiện
 * File: assets/js/pages/btc/events.js
 * Đồng bộ dữ liệu sự kiện từ MySQL qua FastAPI & LocalStorage
 */

let allBtcEvents = [];
let currentFilterStatus = 'all';
let currentSearchTerm = '';

function formatEventTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  const pad = function (n) { return String(n).padStart(2, '0'); };
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' • ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function getStatusBadge(status) {
  const st = (status || '').toLowerCase();
  if (st === 'ongoing' || st === 'open') {
    return '<span class="badge badge-success">Đang mở</span>';
  } else if (st === 'upcoming') {
    return '<span class="badge badge-primary">Sắp diễn ra</span>';
  } else if (st === 'ended') {
    return '<span class="badge badge-neutral">Đã kết thúc</span>';
  }
  return '<span class="badge badge-neutral">' + (status || 'Đã xuất bản') + '</span>';
}

function renderEventsTable(events) {
  const tbody = document.getElementById('btcEventsTableBody');
  if (!tbody) return;

  const filtered = events.filter(function (ev) {
    const st = (ev.status || '').toLowerCase();
    const matchStatus =
      currentFilterStatus === 'all' ||
      (currentFilterStatus === 'ongoing' && (st === 'ongoing' || st === 'open')) ||
      (currentFilterStatus === 'upcoming' && st === 'upcoming') ||
      (currentFilterStatus === 'ended' && st === 'ended');

    const matchSearch =
      !currentSearchTerm ||
      (ev.title && ev.title.toLowerCase().includes(currentSearchTerm)) ||
      (ev.location_name && ev.location_name.toLowerCase().includes(currentSearchTerm));

    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--color-text-muted);">' +
      'Không tìm thấy sự kiện nào phù hợp.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map(function (ev) {
      const regCount = ev.current_seats != null ? ev.current_seats : 0;
      const maxSeats = ev.max_seats || 100;
      const statusAttr = (ev.status || 'upcoming').toLowerCase();

      return (
        '<tr data-status="' + statusAttr + '">' +
        '<td>' +
        '<div style="font-weight: 700; color: var(--color-text-primary);">' +
        ev.title +
        '</div>' +
        '<div style="font-size: 12px; color: var(--color-text-muted); display:flex; align-items:center; gap:4px; margin-top:2px;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        (ev.location_name || 'Học viện KMA') +
        '</div>' +
        '</td>' +
        '<td>' +
        formatEventTime(ev.start_time) +
        '</td>' +
        '<td><strong>' +
        regCount +
        '</strong> / ' +
        maxSeats +
        '</td>' +
        '<td>' +
        getStatusBadge(ev.status) +
        '</td>' +
        '<td style="text-align: right;">' +
        '<a href="event-create.html?id=' +
        encodeURIComponent(ev.id) +
        '" class="action-link">Sửa</a> • ' +
        '<a href="registrants.html?event=' +
        encodeURIComponent(ev.id) +
        '" class="action-link" title="Xem danh sách sinh viên đăng ký">Xem (' +
        regCount +
        ' SV)</a>' +
        '</td>' +
        '</tr>'
      );
    })
    .join('');
}

async function loadBtcEvents() {
  const tbody = document.getElementById('btcEventsTableBody');
  if (tbody) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--color-text-muted);">' +
      'Đang tải dữ liệu sự kiện từ máy chủ...</td></tr>';
  }

  let serverEvents = [];

  // 1. Thử tải qua API Backend
  if (window.KmaApi) {
    try {
      const res = await window.KmaApi.get('/btc/events');
      if (Array.isArray(res) && res.length > 0) {
        serverEvents = res;
      }
    } catch (err) {
      console.warn('Lỗi gọi /btc/events, thử fallback sang /events:', err.message);
      try {
        const res2 = await window.KmaApi.get('/events');
        if (Array.isArray(res2) && res2.length > 0) {
          serverEvents = res2;
        }
      } catch (err2) {
        console.warn('Không kết nối được Backend, dùng dữ liệu dự phòng:', err2.message);
      }
    }
  }

  // 2. Đọc các sự kiện lưu cục bộ trong localStorage
  const localList = JSON.parse(localStorage.getItem('kma_btc_created_events') || '[]');

  // Nếu Backend không trả về, dùng danh sách mẫu mặc định
  if (serverEvents.length === 0) {
    serverEvents = [
      {
        id: 'cyber_2025',
        title: 'Hội thảo An ninh mạng Quốc gia 2025',
        location_name: 'Hội trường A1 — Học viện KMA',
        start_time: new Date().toISOString(),
        current_seats: 86,
        max_seats: 120,
        status: 'ongoing',
      },
      {
        id: 'ai_2025',
        title: 'Ngày hội Sinh viên KMA & Công nghệ Trí tuệ Nhân tạo',
        location_name: 'Sân trường Học viện KMA',
        start_time: new Date(Date.now() + 86400000 * 3).toISOString(),
        current_seats: 234,
        max_seats: 500,
        status: 'upcoming',
      },
      {
        id: 'workshop_ai_ended',
        title: 'Workshop AI Innovation & LLM Applications',
        location_name: 'Hội trường B2 — Học viện KMA',
        start_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        current_seats: 60,
        max_seats: 60,
        status: 'ended',
      },
    ];
  }

  // Hợp nhất: Thêm các sự kiện vừa tạo ở localStorage nếu chưa có trong server
  const existingIds = new Set(serverEvents.map(function (e) { return e.id; }));
  localList.forEach(function (locEv) {
    if (!existingIds.has(locEv.id)) {
      serverEvents.unshift(locEv);
      existingIds.add(locEv.id);
    }
  });

  allBtcEvents = serverEvents;
  renderEventsTable(allBtcEvents);
}

function filterBtcEvents(btn, status) {
  document.querySelectorAll('.filter-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  currentFilterStatus = status;
  renderEventsTable(allBtcEvents);
}

function handleBtcSearch(term) {
  currentSearchTerm = (term || '').trim().toLowerCase();
  renderEventsTable(allBtcEvents);
}

document.addEventListener('DOMContentLoaded', function () {
  loadBtcEvents();
});
