/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/btc/events.js
 */

function filterBtcEvents(btn, status) {
  document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('table tbody tr[data-status]').forEach(function(row) {
    if (status === 'all' || row.getAttribute('data-status') === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}
