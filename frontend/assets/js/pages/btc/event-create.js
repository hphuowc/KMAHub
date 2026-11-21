/**
 * KMA Hub — Page Logic
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

function handlePublish(e) {
  e.preventDefault();
  alert('Đã xuất bản sự kiện thành công.');
  window.location.href = 'events.html';
}
