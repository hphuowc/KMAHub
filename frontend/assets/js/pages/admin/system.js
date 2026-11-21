/**
 * KMA Hub — Page Logic: Cấu hình AI & Hệ thống
 * File: assets/js/pages/admin/system.js
 */

(function initSystemConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('kma_admin_system_config') || 'null');
    if (!saved) return;
    if (saved.aiModel && document.getElementById('aiModelSelect')) {
      document.getElementById('aiModelSelect').value = saved.aiModel;
    }
    if (saved.minFaceRes && document.getElementById('minFaceResInput')) {
      document.getElementById('minFaceResInput').value = saved.minFaceRes;
    }
    if (saved.defaultRadius && document.getElementById('defaultRadiusInput')) {
      document.getElementById('defaultRadiusInput').value = saved.defaultRadius;
    }
    if (saved.maxGpsAcc && document.getElementById('maxGpsAccInput')) {
      document.getElementById('maxGpsAccInput').value = saved.maxGpsAcc;
    }
    if (saved.checkinWindow && document.getElementById('checkinWindowSelect')) {
      document.getElementById('checkinWindowSelect').value = saved.checkinWindow;
    }
    if (saved.checkoutWindow && document.getElementById('checkoutWindowSelect')) {
      document.getElementById('checkoutWindowSelect').value = saved.checkoutWindow;
    }
  } catch (e) {}
})();

function handleSaveConfig(e) {
  e.preventDefault();
  const cfg = {
    aiModel: document.getElementById('aiModelSelect').value,
    faceThresholdPercent: 85, // Cố định ≥ 85%, không cho phép chỉnh sửa
    minFaceRes: document.getElementById('minFaceResInput').value,
    defaultRadius: Number(document.getElementById('defaultRadiusInput').value) || 50,
    maxGpsAcc: Number(document.getElementById('maxGpsAccInput').value) || 100,
    checkinWindow: document.getElementById('checkinWindowSelect').value,
    checkoutWindow: document.getElementById('checkoutWindowSelect').value,
    makeupHoursAfterEnd: 24,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('kma_admin_system_config', JSON.stringify(cfg));
  alert('Đã lưu cấu hình hệ thống thành công.');
}
