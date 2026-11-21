/**
 * KMA Hub — Page Logic
 * File: assets/js/pages/admin/users.js
 */

function filterUsers(btn, role) {
  document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('table tbody tr[data-role]').forEach(function(row) {
    if (role === 'all' || row.getAttribute('data-role') === role) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}
