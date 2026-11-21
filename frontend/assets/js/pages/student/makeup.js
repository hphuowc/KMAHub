/**
 * KMA Hub — Yêu cầu điểm danh bù
 * File: assets/js/pages/student/makeup.js
 */

const makeupEvents = window.KmaTimeRules.getRealtimeEvents(Date.now());
let uploadedCount = 0;

function populateMakeupEvents() {
  const sel = document.getElementById('eventSelect');
  if (!sel) return;

  const currentVal = sel.value || 'workshop_ai_ended';
  const order = ['workshop_ai_ended', 'cyber_2025', 'checkout_live_2025', 'seminar_expired_24h'];

  sel.innerHTML = order
    .map(function (id) {
      const ev = makeupEvents[id];
      return (
        '<option value="' +
        ev.id +
        '"' +
        (ev.id === currentVal ? ' selected' : '') +
        '>' +
        ev.title +
        '</option>'
      );
    })
    .join('');

  handleMakeupEventChange(sel.value);
}

function handleMakeupEventChange(eventId) {
  const ev = makeupEvents[eventId];
  const box = document.getElementById('makeupWindowStatusBox');
  const submitBtn = document.getElementById('makeupSubmitBtn');
  if (!ev || !box || !submitBtn) return;

  const st = window.KmaTimeRules.evaluateMakeupWindow(ev, Date.now());

  if (st.allowed) {
    box.innerHTML = '';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
  } else if (st.code === 'EVENT_NOT_ENDED') {
    box.innerHTML =
      '<div style="background:#FEF3C7; border:1px solid #FDE68A; border-radius:8px; padding:10px 14px; font-size:13px; font-weight:600; color:#92400E;">' +
      'Chưa đến thời gian điểm danh bù.' +
      '</div>';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  } else {
    box.innerHTML =
      '<div style="background:#FEE2E2; border:1px solid #FECDD3; border-radius:8px; padding:10px 14px; font-size:13px; font-weight:600; color:#991B1B;">' +
      'Sự kiện đã quá hạn điểm danh bù.' +
      '</div>';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  }
}

function switchTab(tab) {
  const tabNewBtn = document.getElementById('tabNewBtn');
  const tabHistoryBtn = document.getElementById('tabHistoryBtn');
  const paneNew = document.getElementById('paneNew');
  const paneHistory = document.getElementById('paneHistory');

  if (tab === 'new') {
    tabNewBtn.classList.add('active');
    tabHistoryBtn.classList.remove('active');
    paneNew.classList.add('active');
    paneHistory.classList.remove('active');
  } else {
    tabHistoryBtn.classList.add('active');
    tabNewBtn.classList.remove('active');
    paneHistory.classList.add('active');
    paneNew.classList.remove('active');
  }
}

function handleFileSelected(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const count = Math.min(files.length, 3);
  uploadedCount = count;

  for (let i = 1; i <= 3; i++) {
    const slot = document.getElementById('slot' + i);
    const sub = document.getElementById('slot' + i + 'Sub');
    if (i <= count) {
      slot.classList.add('has-file');
      sub.textContent = 'Đã chọn: ' + files[i - 1].name;
      sub.style.color = 'var(--color-success)';
    } else {
      slot.classList.remove('has-file');
      sub.textContent = 'Nhấp để chọn ảnh ' + i;
      sub.style.color = 'var(--color-text-muted)';
    }
  }
}

function handleMakeupSubmit(e) {
  e.preventDefault();
  const eventId = document.getElementById('eventSelect').value;
  const ev = makeupEvents[eventId];
  if (!ev) return;

  const st = window.KmaTimeRules.evaluateMakeupWindow(ev, Date.now());
  if (!st.allowed) {
    alert(
      st.code === 'EVENT_NOT_ENDED'
        ? 'Chưa đến thời gian điểm danh bù.'
        : 'Sự kiện đã quá hạn điểm danh bù.'
    );
    return;
  }

  const checkType = document.querySelector('input[name="checkType"]:checked').value;
  const nowStr = window.KmaTimeRules.formatDateTime(new Date());

  const reqs = JSON.parse(localStorage.getItem('kma_realtime_makeup_requests') || '{}');
  reqs[eventId] = {
    eventTitle: ev.title,
    checkType: checkType,
    submittedAt: nowStr,
    status: 'PENDING_REVIEW',
  };
  localStorage.setItem('kma_realtime_makeup_requests', JSON.stringify(reqs));

  const tableBody = document.getElementById('historyTableBody');
  const newRow = document.createElement('tr');
  newRow.innerHTML =
    '<td>' +
    '<div style="font-weight: 700;">' +
    ev.title +
    '</div>' +
    '<div style="font-size: 12px; color: var(--color-text-muted);">' +
    ev.location +
    '</div>' +
    '</td>' +
    '<td><span class="badge badge-neutral">' +
    checkType.split(' ')[0] +
    '</span></td>' +
    '<td>' +
    nowStr +
    '</td>' +
    '<td>' +
    '<span class="badge badge-warning">' +
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' +
    'Chờ duyệt' +
    '</span>' +
    '</td>' +
    '<td style="text-align: right;">' +
    '<button class="btn btn-ghost btn-sm" onclick="alert(\'Yêu cầu đang chờ xét duyệt.\')">Xem chi tiết</button>' +
    '</td>';
  tableBody.insertBefore(newRow, tableBody.firstChild);

  const countEl = document.getElementById('historyCount');
  if (countEl) {
    const n = (parseInt(countEl.textContent, 10) || 3) + 1;
    countEl.textContent = n + ' yêu cầu';
  }

  if (window.KmaNotifications && window.KmaNotifications.push) {
    window.KmaNotifications.push(
      'student',
      'Đã gửi yêu cầu điểm danh bù',
      'Yêu cầu bổ sung cho <strong>"' + ev.title + '"</strong> đang chờ xét duyệt.',
      'primary',
      'student/makeup.html'
    );
  }

  alert('Đã gửi yêu cầu điểm danh bù thành công.');

  document.getElementById('makeupForm').reset();
  populateMakeupEvents();
  for (let i = 1; i <= 3; i++) {
    document.getElementById('slot' + i).classList.remove('has-file');
    document.getElementById('slot' + i + 'Sub').textContent = 'Nhấp để chọn ảnh ' + i;
    document.getElementById('slot' + i + 'Sub').style.color = 'var(--color-text-muted)';
  }

  switchTab('history');
}

const historyData = {
  workshop: {
    title: 'Workshop AI Innovation',
    type: 'Check-in (đầu giờ)',
    date: '21/04/2025',
    status: 'Đã duyệt',
    statusBadge: 'badge-success',
    reason: 'Lỗi kết nối mạng khu vực Hội trường B2 thời điểm đầu giờ.',
    reviewer: 'Ban Tổ Chức',
    note: 'Minh chứng hợp lệ, đã cập nhật trạng thái điểm danh.',
  },
  ngayhoi: {
    title: 'Ngày hội Sinh viên KMA',
    type: 'Check-out (cuối giờ)',
    date: '16/04/2025',
    status: 'Chờ duyệt',
    statusBadge: 'badge-warning',
    reason: 'Thiết bị hết pin vào cuối chương trình.',
    reviewer: 'Ban Tổ Chức',
    note: 'Đang kiểm tra minh chứng đính kèm.',
  },
  hackathon: {
    title: 'Tọa đàm Kỹ năng Sinh viên KMA',
    type: 'Thiếu Check-in',
    date: '10/04/2025',
    status: 'Từ chối',
    statusBadge: 'badge-error',
    reason: 'Chưa gửi yêu cầu điểm danh bù trong thời hạn quy định.',
    reviewer: 'Hệ thống KMA Hub',
    note: 'Sự kiện đã quá hạn điểm danh bù.',
  },
};

function showHistoryDetail(key) {
  const data = historyData[key];
  if (!data) return;

  document.getElementById('modalEventTitle').textContent = data.title;
  document.getElementById('modalDetailContent').innerHTML =
    '<div style="display: flex; flex-direction: column; gap: 14px; font-size: 14px;">' +
    '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">' +
    '<span style="color: var(--color-text-muted);">Trạng thái:</span>' +
    '<span class="badge ' +
    data.statusBadge +
    '">' +
    data.status +
    '</span>' +
    '</div>' +
    '<div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">' +
    '<span style="color: var(--color-text-muted);">Lượt bổ sung:</span>' +
    '<span style="font-weight: 600;">' +
    data.type +
    '</span>' +
    '</div>' +
    '<div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">' +
    '<span style="color: var(--color-text-muted);">Ngày ghi nhận:</span>' +
    '<span>' +
    data.date +
    '</span>' +
    '</div>' +
    '<div style="border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">' +
    '<div style="color: var(--color-text-muted); margin-bottom: 4px;">Lý do:</div>' +
    '<div style="background: var(--color-bg-muted); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px;">' +
    data.reason +
    '</div>' +
    '</div>' +
    '<div>' +
    '<div style="color: var(--color-text-muted); margin-bottom: 4px;">Phản hồi:</div>' +
    '<div style="background: var(--color-bg-rose); border: 1px solid var(--color-border-rose); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; color: var(--color-text-primary);">' +
    '<div style="font-weight: 700; margin-bottom: 2px;">' +
    data.reviewer +
    '</div>' +
    '<div>' +
    data.note +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
  document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

(function initMakeupPage() {
  const rows = document.querySelectorAll('#historyTableBody tr');
  if (rows.length >= 3) {
    rows[2].innerHTML =
      '<td><div style="font-weight: 700;">Tọa đàm Kỹ năng Sinh viên KMA</div><div style="font-size: 12px; color: var(--color-text-muted);">Hội trường A1</div></td>' +
      '<td><span class="badge badge-neutral">Check-in</span></td>' +
      '<td>10/04/2025</td>' +
      '<td><span class="badge badge-error">Từ chối</span></td>' +
      '<td style="text-align: right;"><button class="btn btn-ghost btn-sm" style="color: var(--color-error);" onclick="showHistoryDetail(\'hackathon\')">Xem chi tiết</button></td>';
  }
  populateMakeupEvents();
  setInterval(populateMakeupEvents, 30000);
})();
