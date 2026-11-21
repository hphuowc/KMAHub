/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/student/event-detail.js
 */

var eventsData = {
  cyber_2025: {
    title: 'Hội thảo An ninh mạng 2025', category: 'Hội thảo chuyên môn',
    status: 'ongoing', statusLabel: '● Đang diễn ra', statusClass: 'badge-success',
    drl: '+10', organizer: 'Đơn vị tổ chức: Khoa An toàn Thông tin phối hợp cùng Đoàn Thanh niên KMA',
    time: '08:30 - 11:30', date: 'Thứ Sáu, 24/04/2025',
    location: 'Hội trường A1', gps: 'Bán kính GPS hợp lệ: 50m',
    seats: { current: 86, total: 120 }, deadline: 'Hạn đăng ký đến 23:59 ngày 23/04/2025',
    description: '<p style="color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 16px;">Hội thảo An ninh mạng 2025 là sự kiện học thuật thường niên quy mô lớn tại Học viện Kỹ thuật Mật mã, quy tụ các chuyên gia an toàn thông tin hàng đầu.</p><p style="color: var(--color-text-secondary); line-height: 1.7;">Sinh viên tham gia sẽ được tiếp cận các xu hướng tấn công mạng mới nhất, kỹ thuật phòng thủ chủ động bằng AI, đồng thời giao lưu trực tiếp cùng các nhà tuyển dụng hàng đầu.</p>',
    agenda: [
      { time: '08:00 - 08:30', title: 'Check-in đại biểu & sinh viên', desc: 'Điểm danh GPS + AI Face Verification tại sảnh A1' },
      { time: '08:30 - 09:45', title: 'Phiên 1: Xu hướng an ninh mạng thế hệ mới', desc: 'Báo cáo viên: TS. Nguyễn Văn Hùng - Cục ATTT' },
      { time: '09:45 - 11:00', title: 'Phiên 2: Thảo luận & Giải đáp sinh viên', desc: 'Hỏi đáp hướng nghiệp và kỹ năng thực chiến' },
      { time: '11:00 - 11:30', title: 'Check-out kết thúc sự kiện', desc: 'Hoàn tất 2 lượt điểm danh để nhận +10 điểm rèn luyện' }
    ]
  },
  ai_2025: {
    title: 'Cuộc thi AI Innovation 2025', category: 'Cuộc thi / Hackathon',
    status: 'upcoming', statusLabel: 'Sắp diễn ra', statusClass: 'badge-info',
    drl: '+15', organizer: 'Đơn vị tổ chức: Khoa Công nghệ Thông tin phối hợp CLB AI KMA',
    time: '13:30 - 17:00', date: 'Thứ Hai, 28/04/2025',
    location: 'Sân trường Học viện KMA', gps: 'Bán kính GPS hợp lệ: 100m',
    seats: { current: 142, total: 200 }, deadline: 'Hạn đăng ký đến 23:59 ngày 27/04/2025',
    description: '<p style="color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 16px;">Cuộc thi AI Innovation 2025 là sân chơi dành cho sinh viên đam mê Trí tuệ nhân tạo. Các đội thi sẽ xây dựng giải pháp AI sáng tạo giải quyết bài toán thực tế trong 24 giờ.</p><p style="color: var(--color-text-secondary); line-height: 1.7;">Ngoài phần thi chính, sinh viên còn được tham gia các workshop về Machine Learning, Computer Vision và NLP do các chuyên gia hướng dẫn.</p>',
    agenda: [
      { time: '13:00 - 13:30', title: 'Check-in & Nhận bộ KIT thi đấu', desc: 'Điểm danh GPS + AI Face tại cổng sân trường' },
      { time: '13:30 - 14:30', title: 'Keynote: Tương lai AI tại Việt Nam', desc: 'Diễn giả: PGS.TS Trần Minh Quang - FPT AI Center' },
      { time: '14:30 - 16:30', title: 'Phần thi chính: AI Challenge Round', desc: 'Các đội thi giải quyết bài toán AI trong 2 giờ' },
      { time: '16:30 - 17:00', title: 'Trao giải & Check-out', desc: 'Công bố kết quả, trao giải thưởng và điểm danh kết thúc' }
    ]
  },
  gala_2025: {
    title: 'Ngày hội Sinh viên KMA', category: 'Văn hóa & Thể thao',
    status: 'upcoming', statusLabel: 'Sắp diễn ra', statusClass: 'badge-info',
    drl: '+5', organizer: 'Đơn vị tổ chức: Hội Sinh viên Học viện Kỹ thuật Mật mã',
    time: '07:00 - 18:00', date: 'Thứ Tư, 30/04/2025',
    location: 'Nhà thi đấu KMA', gps: 'Bán kính GPS hợp lệ: 100m',
    seats: { current: 234, total: 500 }, deadline: 'Hạn đăng ký đến 23:59 ngày 29/04/2025',
    description: '<p style="color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 16px;">Ngày hội Sinh viên KMA là sự kiện thường niên lớn nhất, kết hợp văn hóa, thể thao, và giao lưu cộng đồng: giải bóng đá mini, hội chợ ẩm thực và đêm Gala văn nghệ.</p><p style="color: var(--color-text-secondary); line-height: 1.7;">Đây là cơ hội để sinh viên các khóa giao lưu, kết nối và tạo thêm kỷ niệm đẹp cùng KMA.</p>',
    agenda: [
      { time: '07:00 - 07:30', title: 'Check-in sáng tại Nhà thi đấu', desc: 'Điểm danh GPS + Face AI' },
      { time: '07:30 - 11:30', title: 'Giải Bóng đá mini & Thể thao đồng đội', desc: '8 đội lớp tranh cúp KMA 2025' },
      { time: '14:00 - 16:00', title: 'Hội chợ ẩm thực & Trò chơi team-building', desc: 'Các gian hàng do các CLB tổ chức' },
      { time: '16:00 - 18:00', title: 'Gala Văn nghệ & Trao giải', desc: 'Các tiết mục văn nghệ, trao giải, bốc thăm trúng thưởng' }
    ]
  }
};

var currentEventId = '';

document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);
  currentEventId = params.get('event') || 'cyber_2025';
  var ev = eventsData[currentEventId];
  if (!ev) { currentEventId = 'cyber_2025'; ev = eventsData[currentEventId]; }

  document.title = ev.title + ' — KMA Hub';
  document.getElementById('breadcrumbTitle').innerText = ev.title;
  document.getElementById('badgeCategory').innerText = ev.category;
  var statusBadge = document.getElementById('badgeStatus');
  statusBadge.innerText = ev.statusLabel;
  statusBadge.className = 'badge ' + ev.statusClass;
  statusBadge.style.fontWeight = '700';
  document.getElementById('badgeDrl').textContent = ev.drl + ' Điểm Rèn Luyện';
  document.getElementById('eventTitle').innerText = ev.title;
  document.getElementById('eventOrganizer').innerText = ev.organizer;
  document.getElementById('metaTime').innerText = ev.time;
  document.getElementById('metaDate').innerText = ev.date;
  document.getElementById('metaLocation').innerText = ev.location;
  document.getElementById('metaGps').innerText = ev.gps;
  document.getElementById('eventDescription').innerHTML = ev.description;

  var agendaHtml = '';
  ev.agenda.forEach(function (a) {
    agendaHtml += '<div class="agenda-item"><div class="agenda-time">' + a.time + '</div><div class="agenda-content"><div style="font-weight: 600;">' + a.title + '</div><div style="font-size: 13px; color: var(--color-text-muted);">' + a.desc + '</div></div></div>';
  });
  document.getElementById('agendaTimeline').innerHTML = agendaHtml;

  document.getElementById('rightCardDeadline').innerText = ev.deadline;
  var pct = Math.round((ev.seats.current / ev.seats.total) * 1000) / 10;
  document.getElementById('seatCount').innerText = ev.seats.current + ' / ' + ev.seats.total + ' chỗ';
  document.getElementById('seatProgress').style.width = pct + '%';
  document.getElementById('seatRemain').innerText = 'Còn lại ' + (ev.seats.total - ev.seats.current) + ' chỗ trống';

  var actionArea = document.getElementById('actionArea');
  if (ev.status === 'ongoing') {
    document.getElementById('rightCardTitle').innerText = 'Điểm danh sự kiện';
    actionArea.innerHTML = '<div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; font-size: 13px; color: #065F46; display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Đang mở điểm danh tại ' + ev.location + '</span></div><button class="btn btn-primary btn-block btn-lg" onclick="handleEventDetailCheckin()" style="font-size: 15px; font-weight: 800;">Điểm danh sự kiện</button>';
  } else {
    document.getElementById('rightCardTitle').innerText = 'Đăng ký tham gia';
    var studentId = localStorage.getItem('kma_user_id') || 'AT180123';
    var regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
    var isRegistered = regMap[currentEventId] && regMap[currentEventId].includes(studentId);
    if (isRegistered) {
      actionArea.innerHTML = '<button class="btn btn-secondary btn-block btn-lg" style="font-size: 15px; cursor: default;">✓ Đã đăng ký</button>';
    } else {
      actionArea.innerHTML = '<button class="btn btn-primary btn-block btn-lg" onclick="handleEventDetailRegister()" style="font-size: 15px; font-weight: 800;">Đăng ký tham gia</button>';
    }
  }
  document.getElementById('modalEventTitle').innerText = '"' + ev.title + '"';
});

function handleEventDetailCheckin() {
  var studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  var regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  if (!regMap[currentEventId]) { regMap[currentEventId] = ['AT180123', 'AT180245', 'AT180378']; localStorage.setItem('kma_event_registered_students', JSON.stringify(regMap)); }
  if (regMap[currentEventId].includes(studentId)) {
    window.location.href = 'attendance.html?event_id=' + currentEventId;
  } else {
    document.getElementById('notRegisteredModal').style.display = 'flex';
  }
}

function handleEventDetailRegister() {
  var studentId = localStorage.getItem('kma_user_id') || 'AT180123';
  var regMap = JSON.parse(localStorage.getItem('kma_event_registered_students') || '{}');
  if (!regMap[currentEventId]) regMap[currentEventId] = [];
  if (!regMap[currentEventId].includes(studentId)) regMap[currentEventId].push(studentId);
  localStorage.setItem('kma_event_registered_students', JSON.stringify(regMap));
  var ev = eventsData[currentEventId];
  alert('Đăng ký tham gia "' + ev.title + '" thành công.');
  document.getElementById('actionArea').innerHTML = '<button class="btn btn-secondary btn-block btn-lg" style="font-size: 15px; cursor: default;">✓ Đã đăng ký</button>';
}
