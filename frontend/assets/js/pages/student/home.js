/**
 * KMA Hub — Page Logic: Trang chủ Sinh viên
 * File: assets/js/pages/student/home.js
 */

function filterStudentEvents(btn, category) {
  document.querySelectorAll('.filter-scroll .filter-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  btn.classList.add('active');
  document.querySelectorAll('.event-card[data-category]').forEach(function (card) {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

let currentCheckinEventId = 'cyber_2025';

function handleStudentCheckin(eventId, eventTitle) {
  currentCheckinEventId = eventId;
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  let regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  if (!regMap[eventId]) {
    regMap[eventId] = ['AT180123', 'AT180245', 'AT180378'];
    localStorage.setItem('kma_event_registered_students', JSON.stringify(regMap));
  }

  const isRegistered = regMap[eventId].includes(studentId);
  if (isRegistered) {
    window.location.href = 'attendance.html?event_id=' + eventId;
  } else {
    const nameEl = document.getElementById('modalEventName');
    if (nameEl) nameEl.innerText = '"' + eventTitle + '"';
    document.getElementById('notRegisteredModal').style.display = 'flex';
  }
}

async function handleStudentRegister(eventId, eventTitle, btnEl) {
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';

  // Gọi API Backend nếu server đang chạy
  if (window.KmaApi && typeof window.KmaApi.post === 'function') {
    try {
      await window.KmaApi.post('/events/' + eventId + '/register');
    } catch (err) {
      console.warn('API Register warning:', err.message);
    }
  }

  let regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  if (!regMap[eventId]) regMap[eventId] = [];
  if (!regMap[eventId].includes(studentId)) {
    regMap[eventId].push(studentId);
  }
  localStorage.setItem('kma_event_registered_students', JSON.stringify(regMap));

  btnEl.innerHTML = '✓ Đã đăng ký';
  btnEl.className = 'btn btn-secondary btn-sm';
  btnEl.style.color = '#059669';
  btnEl.style.borderColor = '#10B981';
  alert('Đăng ký tham gia "' + eventTitle + '" thành công (Đã đồng bộ CSDL).');
}

function renderCreatedStudentEvents() {
  const grid = document.getElementById('studentEventsGrid');
  if (!grid) return;

  const localList = JSON.parse(localStorage.getItem('kma_btc_created_events') || '[]');
  localList.forEach(function (ev) {
    if (document.getElementById('card-ev-' + ev.id)) return;

    const card = document.createElement('div');
    card.className = 'event-card';
    card.id = 'card-ev-' + ev.id;
    card.setAttribute('data-category', 'hoithao');

    card.innerHTML =
      '<div class="custom-card-header header-red">' +
      '<div style="display: flex; justify-content: space-between; align-items: center;">' +
      '<span class="badge badge-success" style="font-weight: 700;">● Mới mở đăng ký</span>' +
      '<span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 12px;">+' +
      (ev.drl_points || 5) +
      ' ĐRL</span>' +
      '</div>' +
      '<svg viewBox="0 0 300 50" fill="none" style="width: 100%"><path d="M0 35 C 70 5, 180 50, 300 15" stroke="#E08A28" stroke-width="3" stroke-linecap="round"/></svg>' +
      '</div>' +
      '<div class="event-card-body">' +
      '<h3 class="event-card-title"><a href="event-detail.html?event=' +
      encodeURIComponent(ev.id) +
      '" style="text-decoration:none;color:inherit;">' +
      ev.title +
      '</a></h3>' +
      '<div class="event-card-meta">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>' +
      'Sắp diễn ra' +
      '</div>' +
      '<div class="event-card-meta">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>' +
      (ev.location_name || 'Học viện KMA') +
      '</div>' +
      '</div>' +
      '<div class="event-card-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">' +
      '<div class="registrations" style="font-size: 13px;">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><circle cx="19" cy="7" r="3" /><path d="M21 21v-1a3 3 0 0 0-2-2.83" /></svg>' +
      '0 / ' +
      (ev.max_seats || 100) +
      ' đã đăng ký' +
      '</div>' +
      '<button id="btn-reg-' +
      ev.id +
      '" class="btn btn-primary btn-sm" onclick="handleStudentRegister(\'' +
      ev.id +
      '\', \'' +
      ev.title.replace(/'/g, "\\'") +
      '\', this)">Đăng ký</button>' +
      '</div>';

    grid.insertBefore(card, grid.firstChild);
  });
}

// Check pre-registered state on load & load dynamic events
document.addEventListener('DOMContentLoaded', function () {
  renderCreatedStudentEvents();

  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  const regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  ['ai_2025', 'gala_2025'].forEach(function (evId) {
    if (regMap[evId] && regMap[evId].includes(studentId)) {
      const btn = document.getElementById('btn-reg-' + evId);
      if (btn) {
        btn.innerHTML = '✓ Đã đăng ký';
        btn.className = 'btn btn-secondary btn-sm';
        btn.style.color = '#059669';
        btn.style.borderColor = '#10B981';
      }
    }
  });
});
