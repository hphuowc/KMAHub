/**
 * KMA Hub — Page Logic: Ban Tổ Chức tạo sự kiện
 * File: assets/js/pages/btc/event-create.js
 */

function handleLocationChange(select) {
  const customDiv = document.getElementById('customLocationDiv');
  const predefinedSection = document.getElementById('predefinedCoordsSection');
  const selectedOption = select.options[select.selectedIndex];

  if (select.value === 'custom') {
    customDiv.style.display = 'block';
    predefinedSection.style.display = 'none';

    document.getElementById('hiddenLocationName').value = document.getElementById('customLocationName').value;
    document.getElementById('hiddenLat').value = document.getElementById('customLat').value;
    document.getElementById('hiddenLng').value = document.getElementById('customLng').value;
    document.getElementById('hiddenRadius').value = document.getElementById('customRadius').value;
  } else {
    customDiv.style.display = 'none';
    predefinedSection.style.display = 'grid';

    const lat = selectedOption.getAttribute('data-lat');
    const lng = selectedOption.getAttribute('data-lng');
    const radius = selectedOption.getAttribute('data-radius');

    document.getElementById('predefinedLat').value = lat;
    document.getElementById('predefinedLng').value = lng;
    document.getElementById('predefinedRadius').value = radius;

    document.getElementById('hiddenLocationName').value = selectedOption.value;
    document.getElementById('hiddenLat').value = lat;
    document.getElementById('hiddenLng').value = lng;
    document.getElementById('hiddenRadius').value = radius;
  }
}

async function handlePublish(e) {
  e.preventDefault();

  const title =
    (document.getElementById('eventTitleInput') && document.getElementById('eventTitleInput').value.trim()) ||
    'Hội thảo sự kiện mới';
  const categoryId =
    parseInt(document.getElementById('categorySelect') ? document.getElementById('categorySelect').value : 1, 10) || 1;
  const drlPoints =
    parseInt(document.getElementById('trainingPoints') ? document.getElementById('trainingPoints').value : 5, 10) || 5;
  const maxSeats =
    parseInt(document.getElementById('maxSeatsInput') ? document.getElementById('maxSeatsInput').value : 120, 10) || 120;

  const startVal = document.getElementById('startTimeInput') ? document.getElementById('startTimeInput').value : '';
  const endVal = document.getElementById('endTimeInput') ? document.getElementById('endTimeInput').value : '';
  const startTime = startVal ? new Date(startVal).toISOString() : new Date().toISOString();
  const endTime = endVal ? new Date(endVal).toISOString() : new Date(Date.now() + 4 * 3600 * 1000).toISOString();

  const locName =
    (document.getElementById('hiddenLocationName') && document.getElementById('hiddenLocationName').value) ||
    'Hội trường A1 — Học viện KMA';
  const lat =
    parseFloat(document.getElementById('hiddenLat') && document.getElementById('hiddenLat').value) || 20.98064;
  const lng =
    parseFloat(document.getElementById('hiddenLng') && document.getElementById('hiddenLng').value) || 105.79632;
  const radius =
    parseInt(document.getElementById('hiddenRadius') && document.getElementById('hiddenRadius').value, 10) || 50;

  const eventId = 'kma_btc_' + Date.now();
  const newEventObj = {
    id: eventId,
    title: title,
    category_id: categoryId,
    location_name: locName,
    latitude: lat,
    longitude: lng,
    radius_meters: radius,
    start_time: startTime,
    end_time: endTime,
    registration_deadline: startTime,
    drl_points: drlPoints,
    max_seats: maxSeats,
    current_seats: 0,
    status: 'upcoming',
    description: 'Sự kiện do Ban Tổ Chức KMA khởi tạo',
  };

  // 1. Luôn lưu vào LocalStorage để đảm bảo hiển thị tức thì trên giao diện
  const localList = JSON.parse(localStorage.getItem('kma_btc_created_events') || '[]');
  localList.unshift(newEventObj);
  localStorage.setItem('kma_btc_created_events', JSON.stringify(localList));

  // 2. Gửi API đồng bộ vào CSDL MySQL nếu có Backend
  if (window.KmaApi) {
    try {
      await window.KmaApi.post('/btc/events', {
        id: eventId,
        title: title,
        category_id: categoryId,
        location_name: locName,
        latitude: lat,
        longitude: lng,
        radius_meters: radius,
        start_time: startTime,
        end_time: endTime,
        registration_deadline: startTime,
        drl_points: drlPoints,
        max_seats: maxSeats,
        description: newEventObj.description,
      });

      alert('✓ Đã xuất bản và lưu sự kiện "' + title + '" thành công vào CSDL MySQL!');
      window.location.href = 'events.html';
      return;
    } catch (err) {
      console.warn('Lỗi đồng bộ Backend API:', err.message);
      alert(
        '✓ Đã tạo sự kiện trên giao diện thành công!\n(Lưu ý đồng bộ MySQL: ' +
          err.message +
          ' - Đảm bảo bạn đang đăng nhập bằng tài khoản BTC btc_doantruong).'
      );
      window.location.href = 'events.html';
      return;
    }
  }

  alert('✓ Đã xuất bản sự kiện thành công.');
  window.location.href = 'events.html';
}
