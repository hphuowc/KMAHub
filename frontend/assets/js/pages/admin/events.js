/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/admin/events.js
 */

let currentReviewMssv = '';

const adminEventsData = {
  cyber: {
    title: 'Hội thảo An ninh mạng 2025',
    sub: '24/04/2025 • 08:30 — Hội trường A1',
    attended: '78 hợp lệ',
    makeup: '3 chờ duyệt'
  },
  ai: {
    title: 'Cuộc thi AI Innovation 2025',
    sub: '28/04/2025 • 13:30 — Sân trường Học viện',
    attended: '130 hợp lệ',
    makeup: '5 chờ duyệt'
  },
  gala: {
    title: 'Ngày hội Sinh viên KMA',
    sub: '30/04/2025 • 07:00 — Sân trường chính',
    attended: '210 hợp lệ',
    makeup: '8 chờ duyệt'
  }
};

function openAdminMonitorModal(eventKey) {
  const data = adminEventsData[eventKey] || adminEventsData['cyber'];
  document.getElementById('monitorModalTitle').innerText = data.title;
  document.getElementById('monitorModalSub').innerText = data.sub;
  document.getElementById('countAttended').innerText = data.attended;
  document.getElementById('countMakeup').innerText = data.makeup;
  document.getElementById('adminMonitorModal').style.display = 'flex';
  switchAdminModalTab(1);
}

function closeAdminMonitorModal() {
  document.getElementById('adminMonitorModal').style.display = 'none';
}

function switchAdminModalTab(tabIndex) {
  if (tabIndex === 1) {
    document.getElementById('modalTabContent1').style.display = 'block';
    document.getElementById('modalTabContent2').style.display = 'none';
    document.getElementById('modalTabBtn1').style.borderBottom = '3px solid var(--color-primary)';
    document.getElementById('modalTabBtn1').style.color = 'var(--color-primary)';
    document.getElementById('modalTabBtn2').style.borderBottom = '3px solid transparent';
    document.getElementById('modalTabBtn2').style.color = 'var(--color-text-muted)';
  } else {
    document.getElementById('modalTabContent1').style.display = 'none';
    document.getElementById('modalTabContent2').style.display = 'block';
    document.getElementById('modalTabBtn2').style.borderBottom = '3px solid var(--color-primary)';
    document.getElementById('modalTabBtn2').style.color = 'var(--color-primary)';
    document.getElementById('modalTabBtn1').style.borderBottom = '3px solid transparent';
    document.getElementById('modalTabBtn1').style.color = 'var(--color-text-muted)';
  }
}

function openFullEvidenceReview(name, mssv, reason, faceMatch, gpsDiff, submitTime) {
  currentReviewMssv = mssv;
  document.getElementById('evidenceStudentTitle').innerText = 'Minh chứng điểm danh bù — ' + name + ' (' + mssv + ')';
  document.getElementById('evidenceStudentSubtitle').innerText = 'Trạng thái: ' + submitTime;
  document.getElementById('evidenceReasonText').innerText = reason;
  document.getElementById('evidenceFaceVal').innerText = faceMatch;
  document.getElementById('evidenceGpsVal').innerText = gpsDiff;
  document.getElementById('fullEvidenceReviewModal').style.display = 'flex';
}

function closeFullEvidenceReview() {
  document.getElementById('fullEvidenceReviewModal').style.display = 'none';
}

function findMakeupRowByMssv(mssv) {
  const rows = document.querySelectorAll('#modalTabContent2 table tbody tr');
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length > 0) {
      const rowText = cells[0].textContent;
      if (rowText.includes(mssv)) return rows[i];
    }
  }
  return null;
}

function approveMakeupRequest() {
  alert('Đã phê duyệt điểm danh bù cho sinh viên ' + currentReviewMssv + '.');
  const row = findMakeupRowByMssv(currentReviewMssv);
  if (row) {
    const badge = row.querySelector('.badge-info, .badge-warning, .badge-neutral');
    if (badge) { badge.className = 'badge badge-success'; badge.innerHTML = '✓ Đã duyệt'; }
    const actionCell = row.querySelector('td:last-child');
    if (actionCell) actionCell.innerHTML = '<span style="color:#059669;font-weight:700;">Đã xử lý</span>';
  }
  const counter = document.getElementById('countMakeup');
  if (counter) {
    const num = parseInt(counter.innerText) || 0;
    counter.innerText = Math.max(0, num - 1) + ' chờ duyệt';
  }
  closeFullEvidenceReview();
}

function rejectMakeupRequest() {
  const reason = prompt('Nhập lý do từ chối:', 'Minh chứng chưa hợp lệ');
  if (reason) {
    alert('Đã từ chối yêu cầu điểm danh bù của ' + currentReviewMssv + '.');
    const row = findMakeupRowByMssv(currentReviewMssv);
    if (row) {
      row.style.backgroundColor = '#FEE2E2';
      const badge = row.querySelector('.badge-info, .badge-warning, .badge-neutral');
      if (badge) { badge.className = 'badge badge-error'; badge.innerHTML = 'Đã từ chối'; }
      const actionCell = row.querySelector('td:last-child');
      if (actionCell) actionCell.innerHTML = '<span style="color:#991B1B;font-weight:700;">Đã từ chối</span>';
    }
    const counter = document.getElementById('countMakeup');
    if (counter) {
      const num = parseInt(counter.innerText) || 0;
      counter.innerText = Math.max(0, num - 1) + ' chờ duyệt';
    }
    closeFullEvidenceReview();
  }
}
