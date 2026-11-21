/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/btc/registrants.js
 */

const eventsData = {
  cyber: {
    title: "Hội thảo An ninh mạng 2025",
    badge: "● Đang diễn ra",
    badgeClass: "badge-success",
    points: "+10 ĐRL",
    meta: "Thời gian: 24/04/2025 • 08:30 - 11:30 | Địa điểm: Hội trường A1 (Bán kính 50m) | Đơn vị: Khoa ATTT & Đoàn TN",
    total: 86,
    attended: 68,
    pending: 5,
    students: [
      { stt: 1, mssv: "AT180123", name: "Nguyễn Minh Anh", lop: "AT18A", time: "18/04/2025 09:12", status: "ATTENDED", drl: "+10 ĐRL" },
      { stt: 2, mssv: "AT180245", name: "Trần Quốc Bảo", lop: "AT18B", time: "18/04/2025 10:05", status: "PENDING", drl: "Chờ duyệt (+10)" },
      { stt: 3, mssv: "AT180378", name: "Lê Hoàng Nam", lop: "AT18A", time: "19/04/2025 14:22", status: "PENDING", drl: "Chờ duyệt (+10)" },
      { stt: 4, mssv: "CT060112", name: "Phạm Thùy Linh", lop: "CT6C", time: "20/04/2025 08:45", status: "ATTENDED", drl: "+10 ĐRL" },
      { stt: 5, mssv: "DT040203", name: "Vũ Hải Đăng", lop: "DT4B", time: "20/04/2025 11:30", status: "ABSENT", drl: "0 ĐRL" },
      { stt: 6, mssv: "AT170554", name: "Hoàng Gia Bảo", lop: "AT17A", time: "21/04/2025 16:10", status: "ATTENDED", drl: "+10 ĐRL" },
      { stt: 7, mssv: "CT050419", name: "Đỗ Mai Phương", lop: "CT5A", time: "22/04/2025 09:00", status: "ATTENDED", drl: "+10 ĐRL" },
      { stt: 8, mssv: "AT180667", name: "Bùi Tuấn Kiệt", lop: "AT18D", time: "22/04/2025 15:40", status: "ABSENT", drl: "0 ĐRL" }
    ]
  },
  ai: {
    title: "Cuộc thi AI Innovation 2025",
    badge: "Sắp diễn ra",
    badgeClass: "badge-info",
    points: "+15 ĐRL",
    meta: "Thời gian: 28/04/2025 • 13:30 - 17:00 | Địa điểm: Sân trường Học viện KMA | Đơn vị: CLB Trí tuệ Nhân tạo",
    total: 142,
    attended: 0,
    pending: 0,
    students: [
      { stt: 1, mssv: "CT060112", name: "Phạm Thùy Linh", lop: "CT6C", time: "21/04/2025 14:15", status: "ABSENT", drl: "+15 ĐRL (Dự kiến)" },
      { stt: 2, mssv: "AT180123", name: "Nguyễn Minh Anh", lop: "AT18A", time: "22/04/2025 08:30", status: "ABSENT", drl: "+15 ĐRL (Dự kiến)" },
      { stt: 3, mssv: "DT050101", name: "Nguyễn Văn Hùng", lop: "DT5A", time: "22/04/2025 09:20", status: "ABSENT", drl: "+15 ĐRL (Dự kiến)" },
      { stt: 4, mssv: "AT170221", name: "Trịnh Thùy Trang", lop: "AT17C", time: "23/04/2025 11:05", status: "ABSENT", drl: "+15 ĐRL (Dự kiến)" },
      { stt: 5, mssv: "CT060344", name: "Lương Thế Thành", lop: "CT6B", time: "23/04/2025 16:40", status: "ABSENT", drl: "+15 ĐRL (Dự kiến)" }
    ]
  },
  career: {
    title: "Ngày hội Việc làm KMA 2025",
    badge: "Sắp diễn ra",
    badgeClass: "badge-info",
    points: "+5 ĐRL",
    meta: "Thời gian: 15/05/2025 • 08:00 - 17:00 | Địa điểm: Hội trường A1 & Sân học viện | Đơn vị: Phòng Đào tạo & Đoàn Thanh niên",
    total: 320,
    attended: 0,
    pending: 0,
    students: [
      { stt: 1, mssv: "AT180378", name: "Lê Hoàng Nam", lop: "AT18A", time: "20/04/2025 10:11", status: "ABSENT", drl: "+5 ĐRL (Dự kiến)" },
      { stt: 2, mssv: "CT050419", name: "Đỗ Mai Phương", lop: "CT5A", time: "20/04/2025 10:15", status: "ABSENT", drl: "+5 ĐRL (Dự kiến)" },
      { stt: 3, mssv: "DT040203", name: "Vũ Hải Đăng", lop: "DT4B", time: "21/04/2025 09:00", status: "ABSENT", drl: "+5 ĐRL (Dự kiến)" }
    ]
  },
  football: {
    title: "Giải bóng đá sinh viên KMA",
    badge: "Đã kết thúc",
    badgeClass: "badge-neutral",
    points: "+5 ĐRL",
    meta: "Thời gian: 10/04/2025 • 07:00 - 17:00 | Địa điểm: Sân bóng KMA | Đơn vị: Ban Thể thao KMA",
    total: 64,
    attended: 60,
    pending: 0,
    students: [
      { stt: 1, mssv: "AT170554", name: "Hoàng Gia Bảo", lop: "AT17A", time: "05/04/2025 15:00", status: "ATTENDED", drl: "+5 ĐRL (Đã cộng)" },
      { stt: 2, mssv: "AT180245", name: "Trần Quốc Bảo", lop: "AT18B", time: "05/04/2025 15:10", status: "ATTENDED", drl: "+5 ĐRL (Đã cộng)" },
      { stt: 3, mssv: "CT060112", name: "Phạm Thùy Linh", lop: "CT6C", time: "06/04/2025 08:30", status: "ATTENDED", drl: "+5 ĐRL (Đã cộng)" }
    ]
  }
};

let currentEventKey = 'cyber';

function renderStatusBadge(status) {
  if (status === 'ATTENDED') {
    return '<span class="badge badge-success" style="font-weight:700;">✓ Đã điểm danh</span>';
  } else if (status === 'PENDING') {
    return '<span class="badge badge-warning" style="font-weight:700;display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>Chờ duyệt bù</span>';
  } else {
    return '<span class="badge badge-neutral">Chưa điểm danh</span>';
  }
}

function switchEvent(eventKey) {
  currentEventKey = eventKey;
  const ev = eventsData[eventKey] || eventsData.cyber;

  // Update tabs active state
  document.querySelectorAll('.event-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeTab = document.getElementById('tab-' + eventKey);
  if (activeTab) activeTab.classList.add('active');

  // Update event header info
  document.getElementById('curEventTitle').innerText = ev.title;
  const badgeEl = document.getElementById('curEventBadge');
  badgeEl.innerText = ev.badge;
  badgeEl.className = 'badge ' + ev.badgeClass;
  document.getElementById('curEventPoints').innerText = ev.points;
  document.getElementById('curEventMeta').innerText = ev.meta;

  // Update stats
  document.getElementById('statTotal').innerText = ev.total;
  document.getElementById('statAttended').innerText = ev.attended;
  document.getElementById('statPending').innerText = ev.pending;
  document.getElementById('tableCountText').innerText = ev.students.length + ' sinh viên hiển thị';

  // Render table
  renderTableRows(ev.students);
}

function renderTableRows(students) {
  const tbody = document.getElementById('tableBody');
  if (!students || students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--color-text-muted);">Không tìm thấy sinh viên nào phù hợp.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td style="color:var(--color-text-muted);font-weight:600;">${s.stt}</td>
      <td style="font-weight:700;color:var(--color-primary);">${s.mssv}</td>
      <td style="font-weight:600;">${s.name}</td>
      <td><span class="badge badge-neutral">${s.lop}</span></td>
      <td style="font-size:12px;color:var(--color-text-muted);">${s.time}</td>
      <td>${renderStatusBadge(s.status)}</td>
      <td style="font-weight:700;font-size:12px;color:#059669;">${s.drl}</td>
      <td style="text-align:right;">
        ${s.status === 'PENDING' 
          ? `<a href="attendance.html" class="action-link" style="color:var(--color-warning);font-weight:700;">Xử lý ngoại lệ</a>`
          : `<a href="attendance.html" class="action-link">Chi tiết</a>`
        }
      </td>
    </tr>
  `).join('');
}

function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const status = document.getElementById('statusFilter').value;
  const ev = eventsData[currentEventKey] || eventsData.cyber;

  const filtered = ev.students.filter(s => {
    const matchSearch = s.mssv.toLowerCase().includes(search) || 
                        s.name.toLowerCase().includes(search) || 
                        s.lop.toLowerCase().includes(search);
    const matchStatus = (status === 'ALL') || (s.status === status);
    return matchSearch && matchStatus;
  });

  document.getElementById('tableCountText').innerText = filtered.length + ' sinh viên hiển thị';
  renderTableRows(filtered);
}

function exportCurrentEventExcel() {
  const ev = eventsData[currentEventKey] || eventsData.cyber;
  alert('Đã xuất danh sách Excel cho sự kiện "' + ev.title + '".');
}

// Read URL query parameter ?event=...
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const evParam = urlParams.get('event');
  if (evParam && eventsData[evParam]) {
    switchEvent(evParam);
  } else {
    switchEvent('cyber');
  }
});
