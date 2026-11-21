/**
 * KMA Hub — Page Logic: Đăng nhập
 * File: assets/js/pages/auth/login.js
 */

function togglePasswordVisibility() {
  const input = document.getElementById("passwordInput");
  const btn = document.getElementById("togglePasswordBtn");
  const eyeOpen = document.getElementById("eyeIconOpen");
  const eyeClosed = document.getElementById("eyeIconClosed");
  if (!input) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  if (eyeOpen && eyeClosed) {
    eyeOpen.style.display = isHidden ? "none" : "block";
    eyeClosed.style.display = isHidden ? "block" : "none";
  }
  if (btn) {
    const label = isHidden ? "Ẩn mật khẩu" : "Hiện mật khẩu";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const rawUser = document.getElementById("usernameInput").value.trim();
  const rawPassword = document.getElementById("passwordInput").value;
  const username = rawUser.toLowerCase();

  // Thử đăng nhập qua API Backend nếu server FastAPI đang hoạt động
  if (window.KmaApi && typeof window.KmaApi.post === "function") {
    try {
      const res = await window.KmaApi.post("/auth/login", {
        username: rawUser,
        password: rawPassword,
      });

      if (res && res.access_token) {
        localStorage.setItem("kma_access_token", res.access_token);
        localStorage.setItem("kma_user_role", res.role);
        localStorage.setItem("kma_user_name", res.full_name);
        localStorage.setItem("kma_user_id", res.user_id || rawUser);

        if (res.role === "btc") {
          window.location.href = "../btc/dashboard.html";
        } else if (res.role === "admin") {
          window.location.href = "../admin/dashboard.html";
        } else {
          window.location.href = "../student/home.html";
        }
        return;
      }
    } catch (err) {
      console.warn("Backend API không khả dụng hoặc từ chối, chuyển sang chế độ dự phòng:", err.message);
      // Nếu có lỗi mật khẩu cụ thể từ server (HTTP 401), báo người dùng
      if (err.message && err.message.includes("không chính xác")) {
        alert(err.message);
        return;
      }
    }
  }

  // Chế độ nhận diện phân hệ dự phòng (Offline Mock Mode)
  if (
    username.startsWith("btc") ||
    username.includes("doantruong") ||
    username.includes("bantocthuc")
  ) {
    localStorage.setItem("kma_user_role", "btc");
    localStorage.setItem("kma_user_name", "Ban Tổ Chức KMA");
    localStorage.setItem("kma_user_id", rawUser);
    window.location.href = "../btc/dashboard.html";
  } else if (username.startsWith("admin")) {
    localStorage.setItem("kma_user_role", "admin");
    localStorage.setItem("kma_user_name", "Quản trị viên Hệ thống");
    localStorage.setItem("kma_user_id", rawUser);
    window.location.href = "../admin/dashboard.html";
  } else {
    localStorage.setItem("kma_user_role", "student");
    localStorage.setItem("kma_user_name", "Nguyễn Văn A");
    localStorage.setItem(
      "kma_user_id",
      rawUser.toUpperCase() || "AT180123",
    );
    window.location.href = "../student/home.html";
  }
}
