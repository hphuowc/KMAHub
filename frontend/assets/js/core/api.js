/**
 * KMA Hub — HTTP Client dùng chung cho toàn bộ Frontend
 * File: assets/js/core/api.js
 * Sẵn sàng kết nối với Backend (FastAPI / Express) qua JWT Bearer Token.
 */
window.KmaApi = (function () {
  function getBaseUrl() {
    return (window.KMA_CONFIG && window.KMA_CONFIG.API_BASE_URL) || 'http://localhost:8000/api';
  }

  function getAuthHeaders(extraHeaders) {
    const tokenKey =
      (window.KMA_CONFIG && window.KMA_CONFIG.STORAGE_KEYS && window.KMA_CONFIG.STORAGE_KEYS.TOKEN) ||
      'kma_access_token';
    const token = localStorage.getItem(tokenKey);
    const headers = Object.assign({}, extraHeaders || {});
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  async function request(endpoint, options) {
    const opts = options || {};
    const isFormData = opts.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
    const response = await fetch(getBaseUrl() + endpoint, {
      method: opts.method || 'GET',
      headers: getAuthHeaders(Object.assign(defaultHeaders, opts.headers || {})),
      body: opts.body,
    });
    const data = await response.json().catch(function () {
      return null;
    });
    if (!response.ok) {
      const msg = (data && (data.detail || data.message)) || 'Lỗi kết nối máy chủ (' + response.status + ')';
      throw new Error(msg);
    }
    return data;
  }

  return {
    get: function (endpoint) {
      return request(endpoint, { method: 'GET' });
    },
    post: function (endpoint, payload) {
      return request(endpoint, { method: 'POST', body: JSON.stringify(payload || {}) });
    },
    patch: function (endpoint, payload) {
      return request(endpoint, { method: 'PATCH', body: JSON.stringify(payload || {}) });
    },
    uploadForm: function (endpoint, formData) {
      return request(endpoint, { method: 'POST', body: formData });
    },
  };
})();
