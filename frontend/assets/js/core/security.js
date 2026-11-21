/**
 * ============================================================================
 * KMA Hub — Anti-Cheat, Anti-Spoofing & Network Security Engine (v4.0)
 * File: assets/js/core/security.js
 *
 * Các lớp bảo vệ:
 * 1. Chặn DevTools (Neo cạnh, Cửa sổ tách rời Undocked, Phím tắt) & Chặn Mobile Mode (kể cả khi F5).
 * 2. Chặn Camera ảo (OBS VirtualCam, ManyCam, DroidCam...) & Kiểm tra tính nguyên vẹn [native code] của GPS/Camera API.
 * 3. Phát hiện VPN / Cloudflare 1.1.1.1 WARP / Proxy (có bộ nhớ đệm theo IP tránh nghẽn mạng hội trường) & DNS Sinkhole/AdBlock.
 * 4. Tự động bảo vệ màn hình khóa bằng MutationObserver + Khóa sự kiện Capture-phase & Ngắt luồng Camera khi vi phạm.
 * 5. Xác thực tọa độ GPS chống giả lập vị trí (Null Island, sai số giả tạo, tọa độ cũ).
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KMAHubSecurity = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const config = {
    enableDevToolsDetection: true,
    enableShortcutBlock: true,
    enableNetworkShield: true,
    enableDeviceIntegrity: true,
    enableGpsValidation: true,
    checkIntervalMs: 600,
    undockedCheckIntervalMs: 2000,
    networkRecheckMs: 20000,
    ipAsnCacheTtlMs: 5 * 60 * 1000, // Cache ASN 5 phút trên cùng 1 IP để tránh rate-limit khi dùng chung Wi-Fi hội trường
    threshold: 220,
  };

  const state = {
    isLocked: false,
    isRenderingOverlay: false,
    currentViolation: null, // 'DEVTOOLS' | 'DEVTOOLS_MOBILE' | 'VPN_WARP' | 'DNS_ADBLOCK' | 'SPOOF_DEVICE'
    cachedGpuRenderer: null,
    domObserver: null,
    lastGpsSample: null,
    pendingNetworkCheck: null,
  };

  const VIRTUAL_CAMERA_REGEX =
    /OBS|Virtual|ManyCam|SplitCam|YouCam|Snap Camera|DroidCam|EpocCam|Iriun|Camo|XSplit|AlterCam|FakeCam|v4l2loopback|Unity Video Capture|Animaze|Logi Capture/i;

  const VPN_ASN_LIST = [
    13335, 9009, 60068, 212238, 14061, 20473, 63949, 16276, 24940, 396982, 16509, 14618,
  ];

  const VPN_KEYWORDS_REGEX =
    /Cloudflare|WARP|NordVPN|ProtonVPN|ExpressVPN|Surfshark|Mullvad|Windscribe|CyberGhost|Datacamp|M247|Private Internet Access|Tzulo|Choopa|DigitalOcean|Linode|Vultr/i;

  const VIOLATION_META = {
    DEVTOOLS: {
      title: 'Truy cập bị tạm khóa',
      desc: 'Không thể sử dụng hệ thống khi đang mở công cụ kiểm tra trình duyệt.',
      btnText: 'Thử lại',
    },
    DEVTOOLS_MOBILE: {
      title: 'Truy cập bị tạm khóa',
      desc: 'Không hỗ trợ chế độ giả lập thiết bị trên trình duyệt.',
      btnText: 'Thử lại',
    },
    VPN_WARP: {
      title: 'Kết nối mạng không hợp lệ',
      desc: 'Vui lòng tắt VPN hoặc ứng dụng 1.1.1.1 để tiếp tục truy cập.',
      btnText: 'Thử lại',
    },
    DNS_ADBLOCK: {
      title: 'Kết nối mạng bị gián đoạn',
      desc: 'Vui lòng tắt trình chặn kết nối hoặc DNS tùy chỉnh để tiếp tục.',
      btnText: 'Thử lại',
    },
    SPOOF_DEVICE: {
      title: 'Thiết bị không hợp lệ',
      desc: 'Không hỗ trợ camera ảo hoặc công cụ giả lập vị trí trên thiết bị.',
      btnText: 'Thử lại',
    },
  };

  /* ==========================================================================
   * 1. KIỂM TRA TÍNH NGUYÊN VẸN API TRÌNH DUYỆT & CHỐNG CAMERA ẢO
   * ========================================================================== */

  function isNativeFunction(fn) {
    if (typeof fn !== 'function') return false;
    try {
      const fnToString = Function.prototype.toString;
      if (!/\[native code\]/.test(fnToString.call(fnToString))) {
        return false;
      }
      const src = fnToString.call(fn);
      return /\{\s*\[native code\]\s*\}/.test(src);
    } catch (e) {
      return false;
    }
  }

  function detectApiTampering() {
    if (!config.enableDeviceIntegrity || typeof navigator === 'undefined') return null;

    if (navigator.geolocation) {
      if (
        !isNativeFunction(navigator.geolocation.getCurrentPosition) ||
        !isNativeFunction(navigator.geolocation.watchPosition)
      ) {
        return 'SPOOF_DEVICE';
      }
    }

    if (navigator.mediaDevices) {
      if (
        (navigator.mediaDevices.getUserMedia && !isNativeFunction(navigator.mediaDevices.getUserMedia)) ||
        (navigator.mediaDevices.enumerateDevices && !isNativeFunction(navigator.mediaDevices.enumerateDevices))
      ) {
        return 'SPOOF_DEVICE';
      }
    }

    return null;
  }

  async function checkVirtualCameraDevices() {
    if (!config.enableDeviceIntegrity || typeof navigator === 'undefined') return null;

    // Kiểm tra các luồng video đang phát trực tiếp trên trang
    if (typeof document !== 'undefined') {
      const videos = document.querySelectorAll('video');
      for (let i = 0; i < videos.length; i++) {
        const stream = videos[i].srcObject;
        if (stream && typeof stream.getVideoTracks === 'function') {
          const tracks = stream.getVideoTracks();
          for (let j = 0; j < tracks.length; j++) {
            const label = String(tracks[j].label || '');
            if (label && VIRTUAL_CAMERA_REGEX.test(label)) {
              return 'SPOOF_DEVICE';
            }
          }
        }
      }
    }

    // Kiểm tra danh sách thiết bị đầu vào video nếu trình duyệt đã cấp quyền đọc nhãn
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (Array.isArray(devices)) {
          for (let i = 0; i < devices.length; i++) {
            const d = devices[i];
            if (d && d.kind === 'videoinput' && d.label && VIRTUAL_CAMERA_REGEX.test(d.label)) {
              return 'SPOOF_DEVICE';
            }
          }
        }
      } catch (e) {
        // Bỏ qua nếu thiết bị không có camera hoặc chưa cấp quyền
      }
    }

    return null;
  }

  function stopActiveMediaStreams() {
    if (typeof document === 'undefined') return;
    const videos = document.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      const stream = videos[i].srcObject;
      if (stream && typeof stream.getTracks === 'function') {
        stream.getTracks().forEach(function (track) {
          try {
            track.stop();
          } catch (e) {}
        });
        videos[i].srcObject = null;
      }
    }
  }

  /* ==========================================================================
   * 2. PHÁT HIỆN DEVTOOLS (NEO CẠNH, CỬA SỔ RỜI & GIẢ LẬP MOBILE)
   * ========================================================================== */

  function getDesktopGpuRenderer() {
    if (state.cachedGpuRenderer !== null) return state.cachedGpuRenderer;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        state.cachedGpuRenderer = '';
        return '';
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      state.cachedGpuRenderer = debugInfo
        ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
        : '';
    } catch (e) {
      state.cachedGpuRenderer = '';
    }
    return state.cachedGpuRenderer;
  }

  function detectDevToolsOrMobileEmulation() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const gpu = getDesktopGpuRenderer();

    const claimsMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) ||
      Boolean(navigator.userAgentData && navigator.userAgentData.mobile === true);
    const isDesktopPlatform = /^(Win32|Win64|Windows|MacIntel|MacPPC|Mac68K|Linux x86_64|Linux i686)/i.test(platform);
    const isDesktopGpu = /Direct3D|NVIDIA|GeForce|RTX|GTX|Quadro|Radeon|Intel\(R\)|AMD |Mesa/i.test(gpu);

    // 1. Bắt Mobile Mode trong DevTools ngay cả khi F5 tải lại trang
    if (claimsMobileUA && (isDesktopPlatform || isDesktopGpu)) {
      return 'DEVTOOLS_MOBILE';
    }

    if (
      window.outerWidth > 0 &&
      window.screen &&
      window.screen.width > 0 &&
      (window.outerWidth > window.screen.width + 65 || window.outerHeight > window.screen.height + 65)
    ) {
      return 'DEVTOOLS_MOBILE';
    }

    if (
      isDesktopGpu &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(hover: hover)').matches
    ) {
      return 'DEVTOOLS_MOBILE';
    }

    // 2. Bắt DevTools neo cạnh (có hiệu chỉnh tỷ lệ thu phóng trang để tránh báo nhầm khi người dùng Ctrl +/-)
    const pinchScale = window.visualViewport && window.visualViewport.scale ? window.visualViewport.scale : 1;
    if (pinchScale === 1 && window.outerWidth > 0 && window.innerWidth > 0) {
      const widthDelta = window.outerWidth - window.innerWidth > config.threshold;
      const heightDelta = window.outerHeight - window.innerHeight > config.threshold;
      if (widthDelta || heightDelta) {
        return 'DEVTOOLS';
      }
    }

    return null;
  }

  /**
   * Phát hiện DevTools mở dạng cửa sổ tách rời (Undocked into separate window)
   * Chỉ chạy khi tab đang hiển thị trực tiếp để không bao giờ báo nhầm do tiết kiệm pin nền
   */
  function detectUndockedDevToolsTiming() {
    if (typeof document === 'undefined' || typeof performance === 'undefined') return null;
    if (document.visibilityState !== 'visible') return null;
    if (typeof document.hasFocus === 'function' && !document.hasFocus()) return null;

    const start = performance.now();
    // Khi đóng DevTools: lệnh debugger tốn < 1ms. Khi mở DevTools (kể cả cửa sổ rời): trình gỡ lỗi tạm dừng thực thi.
    // eslint-disable-next-line no-debugger
    debugger;
    const elapsed = performance.now() - start;

    if (document.visibilityState === 'visible' && elapsed > 120) {
      return 'DEVTOOLS';
    }
    return null;
  }

  function installShortcutAndInteractionGuards() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (config.enableShortcutBlock) {
      window.addEventListener(
        'keydown',
        function (e) {
          const key = (e.key || '').toUpperCase();
          const ctrlOrMeta = e.ctrlKey || e.metaKey;
          const isF12 = key === 'F12' || e.keyCode === 123;
          const isInspectCombo = ctrlOrMeta && e.shiftKey && ['I', 'J', 'C', 'M', 'K'].indexOf(key) !== -1;
          const isMacAltInspect = e.metaKey && e.altKey && ['I', 'J', 'C', 'U'].indexOf(key) !== -1;
          const isViewSource = ctrlOrMeta && !e.shiftKey && key === 'U';

          if (isF12 || isInspectCombo || isMacAltInspect || isViewSource) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        },
        true
      );

      window.addEventListener(
        'contextmenu',
        function (e) {
          const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
          if (tag === 'INPUT' || tag === 'TEXTAREA') return;
          e.preventDefault();
        },
        true
      );
    }

    // Khóa cứng mọi thao tác click / submit ở Capture-phase khi hệ thống đang trong trạng thái khóa
    const blockWhenLocked = function (e) {
      if (!state.isLocked) return;
      const target = e.target;
      if (target && (target.id === 'kma-retry-btn' || (target.closest && target.closest('#kma-retry-btn')))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('click', blockWhenLocked, true);
    window.addEventListener('submit', blockWhenLocked, true);
  }

  /* ==========================================================================
   * 3. KIỂM TRA VPN / 1.1.1.1 WARP & DNS SINKHOLE / ADBLOCK (TỐI ƯU CHỐNG CHẶN NHẦM)
   * ========================================================================== */

  function checkDomAdblockBait() {
    if (typeof document === 'undefined' || !document.body) return false;
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ad-placement doubleclick pub_300x250 textads banner-ads';
    bait.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:12px;height:12px;pointer-events:none;';
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);

    const style = window.getComputedStyle(bait);
    const blocked =
      bait.offsetParent === null && style.position !== 'fixed'
        ? true
        : bait.offsetHeight === 0 ||
          bait.clientHeight === 0 ||
          style.display === 'none' ||
          style.visibility === 'hidden';

    if (bait.parentNode) bait.parentNode.removeChild(bait);
    return blocked;
  }

  function getCachedAsnVerdict(ip) {
    if (!ip || typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('kma_net_asn_cache');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.ip === ip && Date.now() - parsed.ts < config.ipAsnCacheTtlMs) {
        return parsed.isVpn ? 'VPN_WARP' : 'CLEAN';
      }
    } catch (e) {}
    return null;
  }

  function setCachedAsnVerdict(ip, isVpn) {
    if (!ip || typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem(
        'kma_net_asn_cache',
        JSON.stringify({ ip: ip, isVpn: Boolean(isVpn), ts: Date.now() })
      );
    } catch (e) {}
  }

  async function probeDnsDomain(url, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () {
      ctrl.abort();
    }, timeoutMs);
    try {
      await fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + '_t=' + Date.now(), {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      return true;
    } catch (err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') {
        return true; // Mạng hội trường chậm không bị coi là chặn DNS
      }
      return false;
    }
  }

  async function checkNetworkSecurity() {
    if (!config.enableNetworkShield) return null;
    if (state.pendingNetworkCheck) return state.pendingNetworkCheck;

    state.pendingNetworkCheck = (async function () {
      try {
        if (checkDomAdblockBait()) {
          return { type: 'DNS_ADBLOCK' };
        }

        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          return null;
        }

        let isOnlineConfirmed = false;
        let clientIp = '';

        // Bước 1: Cloudflare Trace — Phát hiện chính xác 1.1.1.1 WARP, Zero Trust Gateway, IP quốc tế & lấy IP hiện tại
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(function () {
            ctrl.abort();
          }, 4000);
          const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace?t=' + Date.now(), {
            cache: 'no-store',
            signal: ctrl.signal,
          });
          clearTimeout(timer);

          if (res.ok) {
            isOnlineConfirmed = true;
            const txt = await res.text();
            const map = {};
            txt.split('\n').forEach(function (line) {
              const idx = line.indexOf('=');
              if (idx > 0) {
                map[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
              }
            });

            clientIp = map.ip || '';
            if (map.warp === 'on' || map.warp === 'plus' || map.gateway === 'on') {
              return { type: 'VPN_WARP' };
            }
            if (map.loc && map.loc !== 'VN') {
              return { type: 'VPN_WARP' };
            }
          }
        } catch (e) {
          // Bỏ qua nếu làm việc offline nội bộ
        }

        if (!isOnlineConfirmed) return null;

        // Bước 2: Kiểm tra ASN nhà mạng (chỉ gọi API ngoài khi IP thay đổi hoặc hết hạn cache 5 phút)
        const cachedVerdict = getCachedAsnVerdict(clientIp);
        if (cachedVerdict === 'VPN_WARP') {
          return { type: 'VPN_WARP' };
        }

        if (cachedVerdict !== 'CLEAN') {
          try {
            const ctrl2 = new AbortController();
            const timer2 = setTimeout(function () {
              ctrl2.abort();
            }, 4000);
            const ipRes = await fetch('https://ipwho.is/?t=' + Date.now(), {
              cache: 'no-store',
              signal: ctrl2.signal,
            });
            clearTimeout(timer2);

            if (ipRes.ok) {
              const info = await ipRes.json();
              if (info && info.success) {
                if (info.country_code && info.country_code !== 'VN') {
                  setCachedAsnVerdict(clientIp || info.ip, true);
                  return { type: 'VPN_WARP' };
                }
                const asn = info.connection && info.connection.asn;
                const ispOrg =
                  ((info.connection && info.connection.isp) || '') +
                  ' ' +
                  ((info.connection && info.connection.org) || '');

                const isVpnAsn = VPN_ASN_LIST.indexOf(asn) !== -1 || VPN_KEYWORDS_REGEX.test(ispOrg);
                setCachedAsnVerdict(clientIp || info.ip, isVpnAsn);
                if (isVpnAsn) {
                  return { type: 'VPN_WARP' };
                }
              }
            }
          } catch (e) {
            // Nếu dịch vụ phụ quá tải, không chặn nhầm sinh viên
          }
        }

        // Bước 3: Kiểm tra DNS Sinkhole kép — Chỉ kết luận chặn DNS khi CẢ 2 tên miền kiểm chứng độc lập đều bị từ chối phân giải
        const [probeA, probeB] = await Promise.all([
          probeDnsDomain('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 3500),
          probeDnsDomain('https://adservice.google.com/adsid/integrator.js', 3500),
        ]);

        if (!probeA && !probeB) {
          return { type: 'DNS_ADBLOCK' };
        }

        return null;
      } finally {
        state.pendingNetworkCheck = null;
      }
    })();

    return state.pendingNetworkCheck;
  }

  /* ==========================================================================
   * 4. MÀN HÌNH KHÓA TỰ PHỤC HỒI (MUTATION OBSERVER SELF-HEALING)
   * ========================================================================== */

  function applyBodyBlurLock() {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.filter = 'blur(12px)';
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
    }
  }

  function startDomSelfHealingObserver() {
    if (state.domObserver || typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
      return;
    }

    state.domObserver = new MutationObserver(function () {
      if (!state.isLocked || state.isRenderingOverlay) return;

      const overlay = document.getElementById('kma-security-lockdown-overlay');
      const bodyTampered =
        document.body &&
        (document.body.style.pointerEvents !== 'none' || document.body.style.filter.indexOf('blur') === -1);

      const overlayTampered =
        !overlay ||
        overlay.style.display !== 'flex' ||
        overlay.style.visibility === 'hidden' ||
        overlay.style.opacity === '0';

      if (overlayTampered || bodyTampered) {
        renderLockdownOverlay(state.currentViolation || 'DEVTOOLS');
      }
    });

    state.domObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
  }

  function stopDomSelfHealingObserver() {
    if (state.domObserver) {
      state.domObserver.disconnect();
      state.domObserver = null;
    }
  }

  function renderLockdownOverlay(violationType) {
    if (typeof document === 'undefined') return;
    state.isRenderingOverlay = true;

    try {
      const meta = VIOLATION_META[violationType] || VIOLATION_META.DEVTOOLS;
      stopActiveMediaStreams();
      applyBodyBlurLock();

      let overlay = document.getElementById('kma-security-lockdown-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'kma-security-lockdown-overlay';
        document.documentElement.appendChild(overlay);
      }

      overlay.removeAttribute('hidden');
      overlay.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100vw',
        'height: 100vh',
        'background: rgba(94, 14, 18, 0.92)',
        'color: #FFFFFF',
        'z-index: 2147483647',
        'display: flex',
        'flex-direction: column',
        'align-items: center',
        'justify-content: center',
        'padding: 24px',
        'text-align: center',
        "font-family: 'Nunito', sans-serif",
        'backdrop-filter: blur(10px)',
        'box-sizing: border-box',
        'visibility: visible',
        'opacity: 1',
        'pointer-events: auto',
      ].join(';');

      overlay.innerHTML =
        '<div style="max-width: 440px; width: 100%; background: #FFFFFF; color: #18181B; border-radius: 20px; padding: 32px 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); border: 1px solid #EFE0E0;">' +
        '<div style="width: 56px; height: 56px; border-radius: 50%; background: #FEE2E2; color: #9B1B1E; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' +
        '<line x1="12" y1="8" x2="12" y2="12"></line>' +
        '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
        '</svg>' +
        '</div>' +
        '<h2 style="font-size: 20px; font-weight: 800; color: #9B1B1E; margin-bottom: 8px;">' +
        meta.title +
        '</h2>' +
        '<p style="font-size: 14px; color: #475569; line-height: 1.55; margin-bottom: 24px;">' +
        meta.desc +
        '</p>' +
        '<div style="display: flex; justify-content: center;">' +
        '<button id="kma-retry-btn" type="button" style="background: #9B1B1E; color: #FFFFFF; border: none; padding: 10px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">' +
        meta.btnText +
        '</button>' +
        '</div>' +
        '</div>';

      const retryBtn = document.getElementById('kma-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', async function () {
          retryBtn.disabled = true;
          retryBtn.innerText = 'Đang kiểm tra...';

          const apiViolation = detectApiTampering();
          if (apiViolation) {
            renderLockdownOverlay(apiViolation);
            return;
          }

          const dtViolation = config.enableDevToolsDetection
            ? detectDevToolsOrMobileEmulation() || detectUndockedDevToolsTiming()
            : null;
          if (dtViolation) {
            renderLockdownOverlay(dtViolation);
            return;
          }

          const camViolation = await checkVirtualCameraDevices();
          if (camViolation) {
            renderLockdownOverlay(camViolation);
            return;
          }

          const netViolation = await checkNetworkSecurity();
          if (netViolation) {
            renderLockdownOverlay(netViolation.type);
            return;
          }

          clearLockdown();
        });
      }

      startDomSelfHealingObserver();
    } finally {
      state.isRenderingOverlay = false;
    }
  }

  function clearLockdown() {
    stopDomSelfHealingObserver();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('kma_lockdown_reloaded');
      sessionStorage.removeItem('kma_lockdown_type');
    }

    if (typeof document !== 'undefined') {
      const overlay = document.getElementById('kma-security-lockdown-overlay');
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (document.body) {
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
      }
    }

    state.isLocked = false;
    state.currentViolation = null;
  }

  function triggerLockdown(violationType) {
    state.currentViolation = violationType;

    if (state.isLocked) {
      renderLockdownOverlay(violationType);
      return;
    }
    state.isLocked = true;

    if (
      typeof sessionStorage !== 'undefined' &&
      (violationType === 'DEVTOOLS' || violationType === 'DEVTOOLS_MOBILE') &&
      !sessionStorage.getItem('kma_lockdown_reloaded')
    ) {
      sessionStorage.setItem('kma_lockdown_reloaded', 'true');
      sessionStorage.setItem('kma_lockdown_type', violationType);
      window.location.reload();
      return;
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('kma_lockdown_type', violationType);
    }
    renderLockdownOverlay(violationType);
  }

  /* ==========================================================================
   * 5. XÁC THỰC TỌA ĐỘ GPS CHỐNG GIẢ LẬP VỊ TRÍ (ANTI-MOCK LOCATION)
   * ========================================================================== */

  function validateGpsPosition(pos) {
    if (!config.enableGpsValidation) return { valid: true };

    if (detectApiTampering()) {
      return { valid: false, reason: 'GEOLOCATION_API_TAMPERED' };
    }

    if (!pos || !pos.coords) {
      return { valid: false, reason: 'INVALID_POSITION_OBJECT' };
    }

    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, speed } = pos.coords;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return { valid: false, reason: 'OUT_OF_RANGE_COORDINATES' };
    }

    if (latitude === 0 && longitude === 0) {
      return { valid: false, reason: 'NULL_ISLAND' };
    }

    if (typeof accuracy !== 'number' || Number.isNaN(accuracy) || accuracy <= 0) {
      return { valid: false, reason: 'SYNTHETIC_ACCURACY' };
    }

    if (accuracy > 150) {
      return { valid: false, reason: 'ACCURACY_TOO_LOW' };
    }

    if (typeof speed === 'number' && speed < 0) {
      return { valid: false, reason: 'INVALID_SPEED' };
    }

    // Chặn tọa độ cũ bị lưu đệm quá 60 giây
    if (typeof pos.timestamp === 'number' && Math.abs(Date.now() - pos.timestamp) > 60000) {
      return { valid: false, reason: 'STALE_TIMESTAMP' };
    }

    // Dấu hiệu đặc trưng của nhiều phần mềm Mock Location: altitude = 0 và altitudeAccuracy = 0 tuyệt đối
    if (altitude === 0 && altitudeAccuracy === 0) {
      return { valid: false, reason: 'MOCK_ALTITUDE_SIGNATURE' };
    }

    // Kiểm tra dịch chuyển tức thời phi vật lý (> 50 m/s ~ 180 km/h) giữa 2 lần lấy mẫu liên tiếp
    if (state.lastGpsSample && typeof pos.timestamp === 'number') {
      const dtSec = (pos.timestamp - state.lastGpsSample.timestamp) / 1000;
      if (dtSec > 0 && dtSec < 30) {
        const rad = Math.PI / 180;
        const dLat = (latitude - state.lastGpsSample.latitude) * rad;
        const dLon = (longitude - state.lastGpsSample.longitude) * rad;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(state.lastGpsSample.latitude * rad) *
            Math.cos(latitude * rad) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const distMeters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (distMeters / dtSec > 50) {
          return { valid: false, reason: 'IMPOSSIBLE_VELOCITY_JUMP' };
        }
      }
    }

    state.lastGpsSample = {
      latitude: latitude,
      longitude: longitude,
      timestamp: typeof pos.timestamp === 'number' ? pos.timestamp : Date.now(),
    };

    return { valid: true };
  }

  /* ==========================================================================
   * 6. KHỞI CHẠY BỘ GIÁM SÁT TỰ ĐỘNG
   * ========================================================================== */

  async function runSecurityChecks() {
    const apiViolation = detectApiTampering();
    if (apiViolation) {
      triggerLockdown(apiViolation);
      return;
    }

    if (config.enableDevToolsDetection) {
      const dt = detectDevToolsOrMobileEmulation() || detectUndockedDevToolsTiming();
      if (dt) {
        triggerLockdown(dt);
        return;
      }
    }

    const camViolation = await checkVirtualCameraDevices();
    if (camViolation) {
      triggerLockdown(camViolation);
      return;
    }

    const net = await checkNetworkSecurity();
    if (net) {
      triggerLockdown(net.type);
    }
  }

  function startMonitors() {
    installShortcutAndInteractionGuards();

    if (typeof sessionStorage !== 'undefined') {
      const persistedType = sessionStorage.getItem('kma_lockdown_type');
      if (persistedType) {
        const dtNow = config.enableDevToolsDetection ? detectDevToolsOrMobileEmulation() : null;
        if (dtNow) {
          triggerLockdown(dtNow);
        } else {
          sessionStorage.removeItem('kma_lockdown_reloaded');
          sessionStorage.removeItem('kma_lockdown_type');
        }
      }
    }

    runSecurityChecks();

    // Quét nhanh DevTools neo cạnh, giả lập Mobile & tính nguyên vẹn API
    if (config.enableDevToolsDetection || config.enableDeviceIntegrity) {
      setInterval(function () {
        const apiTamper = detectApiTampering();
        if (apiTamper) {
          triggerLockdown(apiTamper);
          return;
        }
        if (config.enableDevToolsDetection) {
          const dt = detectDevToolsOrMobileEmulation();
          if (dt) {
            triggerLockdown(dt);
          }
        }
      }, config.checkIntervalMs);
    }

    // Quét DevTools mở dạng cửa sổ tách rời (Undocked) & Camera ảo
    if (config.enableDevToolsDetection || config.enableDeviceIntegrity) {
      setInterval(async function () {
        if (state.isLocked) return;
        if (config.enableDevToolsDetection) {
          const undocked = detectUndockedDevToolsTiming();
          if (undocked) {
            triggerLockdown(undocked);
            return;
          }
        }
        if (config.enableDeviceIntegrity) {
          const cam = await checkVirtualCameraDevices();
          if (cam) {
            triggerLockdown(cam);
          }
        }
      }, config.undockedCheckIntervalMs);
    }

    // Quét định kỳ trạng thái VPN / 1.1.1.1 / DNS
    if (config.enableNetworkShield) {
      setInterval(async function () {
        if (state.isLocked) return;
        const net = await checkNetworkSecurity();
        if (net) {
          triggerLockdown(net.type);
        }
      }, config.networkRecheckMs);
    }

    // Tự động kiểm tra lại ngay khi cắm/bật thêm thiết bị camera ảo (ví dụ bật OBS giữa chừng)
    if (
      config.enableDeviceIntegrity &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.addEventListener === 'function'
    ) {
      navigator.mediaDevices.addEventListener('devicechange', async function () {
        const cam = await checkVirtualCameraDevices();
        if (cam) triggerLockdown(cam);
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startMonitors);
    } else {
      startMonitors();
    }
  }

  return {
    validateGps: validateGpsPosition,
    checkVirtualCamera: checkVirtualCameraDevices,
    isLocked: function () {
      return state.isLocked;
    },
    recheckNow: runSecurityChecks,
  };
}));
