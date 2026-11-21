/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/btc/attendance.js
 */

let currentStudentName = '';

function openEvidenceModal(name, mssv, distance, faceMatch, resultStatus, reason, isValid) {
  currentStudentName = name;
  document.getElementById('modalStudentTitle').innerText = 'Bằng chứng điểm danh — ' + name;
  document.getElementById('modalStudentSubtitle').innerText = 'MSSV: ' + mssv + ' • Phiên: Check-in (08:14:22 — 24/04/2025)';
  document.getElementById('modalDistance').innerText = distance;
  document.getElementById('modalAiBadge').innerText = faceMatch;
  document.getElementById('modalReason').innerText = reason;

  const approveBtn = document.getElementById('modalApproveBtn');
  const rejectBtn = document.getElementById('modalRejectBtn');

  if (isValid) {
    approveBtn.style.display = 'none';
    rejectBtn.innerText = 'Hủy kết quả điểm danh';
  } else {
    approveBtn.style.display = 'inline-flex';
    rejectBtn.innerText = 'Từ chối điểm danh';
  }

  document.getElementById('evidenceModal').classList.add('active');
}

function closeEvidenceModal() {
  document.getElementById('evidenceModal').classList.remove('active');
}

function handleBackdropClick(e) {
  if (e.target.id === 'evidenceModal') {
    closeEvidenceModal();
  }
}

function findRowByName(name) {
  const rows = document.querySelectorAll('table tbody tr');
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i].querySelector('td');
    if (firstCell) {
      const nameDiv = firstCell.querySelector('div');
      if (nameDiv && nameDiv.textContent.trim() === name) return rows[i];
    }
  }
  return null;
}

function approveAttendance(name) {
  if (confirm('Xác nhận DUYỆT điểm danh thủ công cho sinh viên ' + name + '?')) {
    alert('Đã phê duyệt lượt điểm danh của ' + name + ' thành HỢP LỆ.');
    const row = findRowByName(name);
    if (row) {
      row.style.backgroundColor = '';
      const badge = row.querySelector('.badge-warning');
      if (badge) { badge.className = 'badge badge-success'; badge.innerText = 'Đã duyệt bù'; }
      const actionCell = row.querySelector('td:last-child');
      if (actionCell) actionCell.innerHTML = '<span style="color:#059669;font-weight:700;">Đã xử lý</span>';
    }
  }
}

function rejectAttendance(name) {
  const reason = prompt('Nhập lý do từ chối điểm danh của ' + name + ':', 'Không đủ bằng chứng có mặt tại sự kiện');
  if (reason) {
    alert('Đã từ chối lượt điểm danh của ' + name + '. Lý do: ' + reason);
    const row = findRowByName(name);
    if (row) {
      row.style.backgroundColor = '#FEE2E2';
      const badge = row.querySelector('.badge-warning');
      if (badge) { badge.className = 'badge'; badge.style.cssText = 'background:#FEE2E2;color:#991B1B;font-weight:700;'; badge.innerText = 'Đã từ chối'; }
      const actionCell = row.querySelector('td:last-child');
      if (actionCell) actionCell.innerHTML = '<span style="color:#991B1B;font-weight:700;">Đã từ chối</span>';
    }
  }
}

function approveCurrentModal() {
  approveAttendance(currentStudentName);
  closeEvidenceModal();
}

function rejectCurrentModal() {
  rejectAttendance(currentStudentName);
  closeEvidenceModal();
}

function refreshData() {
  alert('Đã cập nhật dữ liệu điểm danh mới nhất.');
}

function filterTable(type) {
  document.querySelectorAll('.filter-tab').forEach(function (t) {
    t.classList.remove('active');
  });
  if (typeof event !== 'undefined' && event && event.target) {
    event.target.classList.add('active');
  }
  document.querySelectorAll('table tbody tr').forEach(function (row) {
    const badge = row.querySelector('.badge');
    const txt = badge ? badge.textContent.trim() : '';
    if (type === 'all') {
      row.style.display = '';
    } else if (type === 'valid') {
      row.style.display = txt.includes('Đã điểm danh') || txt.includes('Đã duyệt') ? '' : 'none';
    } else if (type === 'review') {
      row.style.display = txt.includes('Chờ xem xét') ? '' : 'none';
    } else if (type === 'rejected') {
      row.style.display = txt.includes('từ chối') || txt.includes('Từ chối') ? '' : 'none';
    }
  });
}
