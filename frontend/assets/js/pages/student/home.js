/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/student/home.js
 */

function filterStudentEvents(btn, category) {
  document.querySelectorAll('.filter-scroll .filter-tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.event-card[data-category]').forEach(function(card) {
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

function handleStudentRegister(eventId, eventTitle, btnEl) {
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
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
  alert('Đăng ký tham gia "' + eventTitle + '" thành công.');
}

// Check pre-registered state on load
document.addEventListener('DOMContentLoaded', function() {
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  const regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  ['ai_2025', 'gala_2025'].forEach(function(evId) {
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
