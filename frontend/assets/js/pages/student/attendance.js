/**
 * KMA Hub — Điểm danh Thời gian thực
 * File: assets/js/pages/student/attendance.js
 */

let currentAttEventId = 'cyber_2025';
const sessionEvents = window.KmaTimeRules.getRealtimeEvents(Date.now());

function ensureDefaultRegistrations() {
  const regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  let changed = false;
  if (!regMap.cyber_2025) {
    regMap.cyber_2025 = ['AT180123', 'AT180245', 'AT180378'];
    changed = true;
  }
  if (!regMap.checkout_live_2025) {
    regMap.checkout_live_2025 = ['AT180123', 'AT180245'];
    changed = true;
  }
  if (changed) {
    localStorage.setItem('kma_event_registered_students', JSON.stringify(regMap));
  }
  return regMap;
}

function isStudentRegistered(eventId) {
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  const regMap = ensureDefaultRegistrations();
  return Boolean(eventId && regMap[eventId] && regMap[eventId].includes(studentId));
}

function getAttendanceLogs() {
  try {
    return JSON.parse(localStorage.getItem('kma_realtime_attendance_logs') || '{}');
  } catch (e) {
    return {};
  }
}

function saveAttendanceLogs(logs) {
  localStorage.setItem('kma_realtime_attendance_logs', JSON.stringify(logs));
}

function renderCurrentEventBanner() {
  const ev = sessionEvents[currentAttEventId] || sessionEvents.cyber_2025;
  const now = Date.now();
  const win = window.KmaTimeRules.evaluateAttendanceWindow(ev, now);
  const registered = isStudentRegistered(ev.id);

  document.getElementById('attEventTitle').textContent = ev.title;
  document.getElementById('attEventScheduleMeta').innerHTML =
    'Thời gian: <strong>' +
    window.KmaTimeRules.formatDateTime(ev.startTime) +
    '</strong> – <strong>' +
    window.KmaTimeRules.formatDateTime(ev.endTime) +
    '</strong> • ' +
    ev.location;

  const phaseBadge = document.getElementById('attEventPhaseBadge');
  const remBadge = document.getElementById('attRemainingBadge');
  const btn = document.getElementById('verifyBtn');
  const warnSlot = document.getElementById('registrationWarningSlot');

  if (!registered) {
    warnSlot.innerHTML =
      '<div style="background:#FEE2E2;border:1px solid #FECDD3;border-radius:12px;padding:12px 16px;margin-bottom:16px;color:#991B1B;font-size:14px;font-weight:600;display:flex;align-items:center;gap:10px;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      'Bạn chưa đăng ký tham gia sự kiện này.' +
      '</div>';
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    btn.textContent = 'Chưa đăng ký sự kiện';
    return;
  }

  warnSlot.innerHTML = '';

  if (win.activePhase === 'CHECKIN') {
    phaseBadge.className = 'badge badge-success';
    phaseBadge.textContent = 'Check-in';
    remBadge.className = 'badge badge-warning';
    remBadge.textContent = 'Còn lại: ' + window.KmaTimeRules.formatDuration(win.checkinRemainingMs);
    if (!btn.getAttribute('data-done')) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.style.backgroundColor = '';
      btn.textContent = 'Xác nhận Check-in';
    }
  } else if (win.activePhase === 'CHECKOUT') {
    phaseBadge.className = 'badge badge-info';
    phaseBadge.textContent = 'Check-out';
    remBadge.className = 'badge badge-warning';
    remBadge.textContent = 'Còn lại: ' + window.KmaTimeRules.formatDuration(win.checkoutRemainingMs);
    if (!btn.getAttribute('data-done')) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.style.backgroundColor = '';
      btn.textContent = 'Xác nhận Check-out';
    }
  } else {
    phaseBadge.className = 'badge badge-neutral';
    phaseBadge.textContent = 'Đóng cổng';
    remBadge.className = 'badge badge-neutral';
    remBadge.textContent = 'Ngoài khung giờ';
    btn.disabled = true;
    btn.style.opacity = '0.55';
    btn.style.cursor = 'not-allowed';
    btn.textContent = 'Ngoài thời gian điểm danh';
  }
}

function handleSwitchAttendanceEvent(newEventId) {
  currentAttEventId = newEventId;
  const btn = document.getElementById('verifyBtn');
  if (btn) btn.removeAttribute('data-done');
  document.getElementById('resultBox').style.display = 'none';
  renderCurrentEventBanner();
}

function triggerVerification() {
  const ev = sessionEvents[currentAttEventId] || sessionEvents.cyber_2025;
  const studentId = localStorage.getItem('kma_user_id') || 'AT180123';

  if (!isStudentRegistered(ev.id)) {
    alert('Bạn chưa đăng ký tham gia sự kiện này.');
    return;
  }

  const win = window.KmaTimeRules.evaluateAttendanceWindow(ev, Date.now());
  if (win.activePhase === 'CLOSED') {
    alert('Hiện đang ngoài thời gian điểm danh của sự kiện.');
    return;
  }

  const btn = document.getElementById('verifyBtn');
  btn.textContent = 'Đang xác thực...';
  btn.style.opacity = '0.75';
  btn.disabled = true;

  setTimeout(function () {
    const nowStr = window.KmaTimeRules.formatClock(new Date());
    const logs = getAttendanceLogs();
    const logKey = studentId + '__' + ev.id;
    const prev = logs[logKey] || { checkedIn: false, checkedOut: false };

    btn.setAttribute('data-done', 'true');
    const resultBox = document.getElementById('resultBox');
    const resultBody = document.getElementById('resultBoxBody');

    if (win.activePhase === 'CHECKIN') {
      prev.checkedIn = true;
      prev.checkinAt = nowStr;
      logs[logKey] = prev;
      saveAttendanceLogs(logs);

      btn.innerHTML = '✓ Đã Check-in';
      btn.style.backgroundColor = '#15803D';
      btn.style.opacity = '1';

      resultBox.style.borderColor = '#22c55e';
      resultBox.style.background = '#f0fdf4';
      resultBody.innerHTML =
        '<div style="font-weight:800; color:#15803d; font-size:15.5px; margin-bottom:4px;">✓ Check-in thành công</div>' +
        '<div style="font-size:13px; color:#166534;">Ghi nhận lúc ' +
        nowStr +
        ' • Độ khớp khuôn mặt: <strong>96.8%</strong></div>';
      resultBox.style.display = 'block';
    } else {
      prev.checkedOut = true;
      prev.checkoutAt = nowStr;
      logs[logKey] = prev;
      saveAttendanceLogs(logs);

      if (prev.checkedIn) {
        btn.innerHTML = '✓ Đã hoàn tất điểm danh';
        btn.style.backgroundColor = '#15803D';
        btn.style.opacity = '1';
        resultBox.style.borderColor = '#22c55e';
        resultBox.style.background = '#f0fdf4';
        resultBody.innerHTML =
          '<div style="font-weight:800; color:#15803d; font-size:15.5px; margin-bottom:4px;">✓ Điểm danh hoàn tất (+' +
          ev.drl +
          ' ĐRL)</div>' +
          '<div style="font-size:13px; color:#166534;">Check-out lúc ' +
          nowStr +
          '</div>';
      } else {
        btn.innerHTML = '✓ Đã ghi nhận Check-out';
        btn.style.backgroundColor = '#B45309';
        btn.style.opacity = '1';

        resultBox.style.borderColor = '#F59E0B';
        resultBox.style.background = '#FFFBEB';
        resultBody.innerHTML =
          '<div style="font-weight:800; color:#92400E; font-size:15px; margin-bottom:4px;">Check-out thiếu Check-in</div>' +
          '<div style="font-size:13px; color:#78350F; line-height:1.5;">Đã ghi nhận Check-out lúc ' +
          nowStr +
          '. Vui lòng gửi <a href="makeup.html" class="action-link">yêu cầu điểm danh bù</a> sau khi sự kiện kết thúc.</div>';

        if (window.KmaNotifications && window.KmaNotifications.push) {
          window.KmaNotifications.push(
            'student',
            'Check-out thiếu Check-in',
            'Bạn chưa có dữ liệu Check-in tại <strong>"' +
              ev.title +
              '"</strong>. Vui lòng gửi yêu cầu điểm danh bù.',
            'warning',
            'student/makeup.html'
          );
        }
      }
      resultBox.style.display = 'block';
    }
  }, 900);
}

(function initAttendancePage() {
  const params = new URLSearchParams(window.location.search);
  const reqId = params.get('event_id');
  const selectEl = document.getElementById('liveAttendanceEventSelect');
  if (reqId && sessionEvents[reqId]) {
    currentAttEventId = reqId;
    if (selectEl) selectEl.value = reqId;
  } else if (reqId && !sessionEvents[reqId]) {
    sessionEvents[reqId] = {
      id: reqId,
      title: 'Sự kiện đã chọn',
      location: 'Học viện KMA',
      radius: 100,
      drl: 10,
      startTime: Date.now() + 48 * 3600 * 1000,
      endTime: Date.now() + 51 * 3600 * 1000,
    };
    currentAttEventId = reqId;
  }

  renderCurrentEventBanner();
  setInterval(renderCurrentEventBanner, 15000);
})();
