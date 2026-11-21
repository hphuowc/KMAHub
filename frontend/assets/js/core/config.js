/**
 * KMA Hub — Cấu hình trung tâm & Bộ quy tắc Thời gian thực (Real-time Engine)
 * File: assets/js/core/config.js
 */
window.KMA_CONFIG = Object.freeze({
  APP_NAME: 'KMA Hub',
  API_BASE_URL: 'http://localhost:8000/api',
  // Cố định từ 85% trở lên, không cho phép hạ hoặc chỉnh sửa thủ công
  FACE_MATCH_MIN_PERCENT: 85,
  FACE_MATCH_THRESHOLD_DISTANCE: 0.45,
  DEFAULT_GPS_RADIUS_METERS: 50,
  TIME_WINDOWS: Object.freeze({
    CHECKIN_BEFORE_START_MIN: 30,  // Mở Check-in 30 phút trước khi bắt đầu
    CHECKIN_AFTER_START_MIN: 30,   // Đóng Check-in 30 phút sau khi bắt đầu (Tổng: 60 phút)
    CHECKOUT_BEFORE_END_MIN: 30,   // Mở Check-out 30 phút trước khi kết thúc
    CHECKOUT_AFTER_END_MIN: 30,    // Đóng Check-out 30 phút sau khi kết thúc (Tổng: 60 phút)
    MAKEUP_AFTER_END_HOURS: 24,    // Điểm danh bù chỉ mở trong vòng 24h SAU khi sự kiện kết thúc
  }),
  STORAGE_KEYS: Object.freeze({
    TOKEN: 'kma_access_token',
    USER_ID: 'kma_user_id',
    USER_NAME: 'kma_user_name',
    USER_ROLE: 'kma_user_role',
    REGISTERED_MAP: 'kma_event_registered_students',
    ATTENDANCE_LOGS: 'kma_realtime_attendance_logs',
    MAKEUP_REQUESTS: 'kma_realtime_makeup_requests',
    NOTIFICATIONS_PREFIX: 'kma_notifications_',
  }),
});

/**
 * Bộ tính toán khung giờ Check-in / Check-out / Điểm danh bù hoàn toàn theo THỜI GIAN THỰC (new Date())
 */
window.KmaTimeRules = (function () {
  const MIN_MS = 60 * 1000;
  const HOUR_MS = 60 * MIN_MS;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDateTime(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return (
      pad(dt.getHours()) +
      ':' +
      pad(dt.getMinutes()) +
      ' • ' +
      pad(dt.getDate()) +
      '/' +
      pad(dt.getMonth() + 1) +
      '/' +
      dt.getFullYear()
    );
  }

  function formatClock(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return (
      pad(dt.getHours()) +
      ':' +
      pad(dt.getMinutes()) +
      ':' +
      pad(dt.getSeconds()) +
      ' — ' +
      pad(dt.getDate()) +
      '/' +
      pad(dt.getMonth() + 1) +
      '/' +
      dt.getFullYear()
    );
  }

  function formatDuration(ms) {
    if (ms <= 0) return '0 phút';
    const totalMin = Math.ceil(ms / MIN_MS);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0 && m > 0) return h + ' giờ ' + m + ' phút';
    if (h > 0) return h + ' giờ';
    return m + ' phút';
  }

  /**
   * Khởi tạo lịch sự kiện neo theo thời gian thực để hệ thống luôn vận hành đúng đồng hồ thực tế:
   * - cyber_2025: Đang diễn ra ngay lúc này (bắt đầu cách đây 15 phút, kết thúc sau 105 phút) -> Mở Check-in, Chặn Điểm danh bù
   * - checkout_live_2025: Sự kiện sắp/vừa kết thúc (bắt đầu cách đây 2h, kết thúc sau 15 phút) -> Mở Check-out (test SV chưa Check-in vẫn Check-out được!)
   * - workshop_ai_ended: Đã kết thúc cách đây 5 giờ -> Nằm trong hạn 24h Điểm danh bù (còn ~19h)
   * - seminar_expired_24h: Đã kết thúc cách đây 28 giờ -> Đã quá hạn 24h (Tự động từ chối nếu chỉ Check-out mà chưa xin bù)
   * - ai_2025 & gala_2025: Sắp diễn ra (sau 2 ngày và 5 ngày)
   */
  function getRealtimeEvents(refNow) {
    const now = refNow ? new Date(refNow).getTime() : Date.now();
    return {
      cyber_2025: {
        id: 'cyber_2025',
        title: 'Hội thảo An ninh mạng 2025',
        location: 'Hội trường A1 • Học viện KMA',
        radius: 50,
        drl: 10,
        startTime: now - 15 * MIN_MS,
        endTime: now + 105 * MIN_MS,
      },
      checkout_live_2025: {
        id: 'checkout_live_2025',
        title: 'Chuyên đề Mật mã & An toàn Dữ liệu số',
        location: 'Hội trường B2 • Học viện KMA',
        radius: 50,
        drl: 8,
        startTime: now - 120 * MIN_MS,
        endTime: now + 15 * MIN_MS,
      },
      workshop_ai_ended: {
        id: 'workshop_ai_ended',
        title: 'Workshop AI Innovation',
        location: 'Hội trường B2 • Học viện KMA',
        radius: 50,
        drl: 5,
        startTime: now - 8 * HOUR_MS,
        endTime: now - 5 * HOUR_MS,
      },
      seminar_expired_24h: {
        id: 'seminar_expired_24h',
        title: 'Tọa đàm Kỹ năng Sinh viên KMA',
        location: 'Hội trường A1 • Học viện KMA',
        radius: 50,
        drl: 5,
        startTime: now - 31 * HOUR_MS,
        endTime: now - 28 * HOUR_MS,
      },
      ai_2025: {
        id: 'ai_2025',
        title: 'Cuộc thi AI Innovation 2025',
        location: 'Sân trường Học viện KMA',
        radius: 100,
        drl: 15,
        startTime: now + 48 * HOUR_MS,
        endTime: now + 51.5 * HOUR_MS,
      },
      gala_2025: {
        id: 'gala_2025',
        title: 'Ngày hội Sinh viên KMA',
        location: 'Nhà thi đấu KMA',
        radius: 100,
        drl: 5,
        startTime: now + 120 * HOUR_MS,
        endTime: now + 130 * HOUR_MS,
      },
    };
  }

  /**
   * Kiểm tra khung giờ Check-in [start - 30p, start + 30p] & Check-out [end - 30p, end + 30p]
   */
  function evaluateAttendanceWindow(ev, nowMs) {
    const now = nowMs || Date.now();
    const w = window.KMA_CONFIG.TIME_WINDOWS;
    const checkinOpen = ev.startTime - w.CHECKIN_BEFORE_START_MIN * MIN_MS;
    const checkinClose = ev.startTime + w.CHECKIN_AFTER_START_MIN * MIN_MS;
    const checkoutOpen = ev.endTime - w.CHECKOUT_BEFORE_END_MIN * MIN_MS;
    const checkoutClose = ev.endTime + w.CHECKOUT_AFTER_END_MIN * MIN_MS;

    const inCheckin = now >= checkinOpen && now <= checkinClose;
    const inCheckout = now >= checkoutOpen && now <= checkoutClose;

    return {
      inCheckin: inCheckin,
      inCheckout: inCheckout,
      checkinOpen: checkinOpen,
      checkinClose: checkinClose,
      checkoutOpen: checkoutOpen,
      checkoutClose: checkoutClose,
      checkinRemainingMs: inCheckin ? checkinClose - now : 0,
      checkoutRemainingMs: inCheckout ? checkoutClose - now : 0,
      activePhase: inCheckin ? 'CHECKIN' : inCheckout ? 'CHECKOUT' : 'CLOSED',
    };
  }

  /**
   * Kiểm tra khung giờ Điểm danh bù: Chỉ mở khi (now > endTime) và (now <= endTime + 24h)
   */
  function evaluateMakeupWindow(ev, nowMs) {
    const now = nowMs || Date.now();
    const makeupDeadline = ev.endTime + window.KMA_CONFIG.TIME_WINDOWS.MAKEUP_AFTER_END_HOURS * HOUR_MS;

    if (now <= ev.endTime) {
      return {
        allowed: false,
        code: 'EVENT_NOT_ENDED',
        deadline: makeupDeadline,
        remainingMs: 0,
        message: 'Chưa đến thời gian điểm danh bù.',
      };
    }

    if (now > makeupDeadline) {
      return {
        allowed: false,
        code: 'EXPIRED_24H',
        deadline: makeupDeadline,
        remainingMs: 0,
        message: 'Sự kiện đã quá hạn điểm danh bù.',
      };
    }

    return {
      allowed: true,
      code: 'OPEN_WITHIN_24H',
      deadline: makeupDeadline,
      remainingMs: makeupDeadline - now,
      message: '',
    };
  }

  /**
   * Đánh giá trạng thái của trường hợp Sinh viên KHÔNG Check-in nhưng CÓ Check-out
   */
  function resolveCheckoutOnlyStatus(ev, hasSubmittedMakeup, nowMs) {
    const now = nowMs || Date.now();
    const makeupDeadline = ev.endTime + window.KMA_CONFIG.TIME_WINDOWS.MAKEUP_AFTER_END_HOURS * HOUR_MS;
    if (hasSubmittedMakeup) {
      return {
        status: 'PENDING_REVIEW',
        badgeClass: 'badge-warning',
        label: 'Chờ duyệt điểm danh bù',
      };
    }
    if (now > makeupDeadline) {
      return {
        status: 'AUTO_REJECTED',
        badgeClass: 'badge-error',
        label: 'Từ chối (Quá hạn điểm danh bù)',
      };
    }
    return {
      status: 'AWAITING_STUDENT_MAKEUP',
      badgeClass: 'badge-info',
      label: 'Thiếu Check-in (Chờ điểm danh bù)',
    };
  }

  return {
    formatDateTime: formatDateTime,
    formatClock: formatClock,
    formatDuration: formatDuration,
    getRealtimeEvents: getRealtimeEvents,
    evaluateAttendanceWindow: evaluateAttendanceWindow,
    evaluateMakeupWindow: evaluateMakeupWindow,
    resolveCheckoutOnlyStatus: resolveCheckoutOnlyStatus,
  };
})();
