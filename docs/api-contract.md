# KMA Hub — API Contract & Quy Ước Giao Tiếp Frontend — Backend

Hệ thống API RESTful của **KMA Hub** xây dựng trên nền tảng **FastAPI (Python)**, sử dụng cơ sở dữ liệu **MySQL 8.0**, phục vụ toàn bộ các luồng nghiệp vụ Quản lý sự kiện, Điểm danh AI Face Recognition (128-D), Định vị GPS Geofencing và Phê duyệt ngoại lệ điểm danh bù.

---

## 1. Thông Tin Chung

- **Base URL:** `http://localhost:8000/api`
- **Tài liệu trực quan Swagger UI:** `http://localhost:8000/api/docs`
- **Tài liệu trực quan ReDoc:** `http://localhost:8000/api/redoc`
- **Tiêu chuẩn dữ liệu:** `application/json` (trừ endpoint upload dùng `multipart/form-data`)
- **Xác thực:** Bearer Token qua Header:
  ```http
  Authorization: Bearer <access_token>
  ```

---

## 2. Mã Trạng Thái HTTP (Status Codes)

| Mã | Ý nghĩa | Mô tả |
|:---|:---|:---|
| `200 OK` | Thành công | Yêu cầu được xử lý thành công |
| `201 Created` | Đã tạo | Tài nguyên mới đã được tạo thành công |
| `400 Bad Request` | Dữ liệu không hợp lệ | Lỗi nghiệp vụ (hết hạn, sai quy tắc thời gian...) |
| `401 Unauthorized` | Chưa xác thực | Thiếu token hoặc token đã hết hạn |
| `403 Forbidden` | Không có quyền | Vai trò người dùng không được phép truy cập |
| `404 Not Found` | Không tìm thấy | Bản ghi không tồn tại |
| `500 Internal Error`| Lỗi máy chủ | Lỗi xử lý bên phía Backend |

---

## 3. Danh Sách Các Nhóm API

### 3.1. Nhóm Xác Thực (Authentication) — `/api/auth`

#### `POST /api/auth/login`
- **Mô tả:** Đăng nhập hệ thống (tự động nhận diện Sinh viên, BTC hoặc Quản trị viên).
- **Body:**
  ```json
  {
    "username": "AT180123",
    "password": "123456"
  }
  ```
- **Response `200`:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "Bearer",
    "user_id": "AT180123",
    "username": "at180123",
    "full_name": "Nguyễn Văn A",
    "role": "student",
    "email": "at180123@actvn.edu.vn",
    "student_code": "AT180123",
    "avatar_url": null
  }
  ```

#### `GET /api/auth/me`
- **Mô tả:** Lấy thông tin hồ sơ của tài khoản đang đăng nhập.
- **Header:** `Authorization: Bearer <token>`
- **Response `200`:** Chi tiết hồ sơ, lớp, khóa, đơn vị công tác.

#### `POST /api/auth/change-password`
- **Mô tả:** Đổi mật khẩu tài khoản.
- **Body:**
  ```json
  {
    "old_password": "123456",
    "new_password": "new_secure_password"
  }
  ```

---

### 3.2. Nhóm Sự Kiện (Events) — `/api/events`

#### `GET /api/events`
- **Mô tả:** Danh sách sự kiện, hỗ trợ lọc theo `category_id` và `status`.
- **Query Params:** `?category_id=1&status=ongoing`
- **Response `200`:** Mảng danh sách các sự kiện kèm số chỗ còn lại và cờ `is_registered`.

#### `GET /api/events/{event_id}`
- **Mô tả:** Chi tiết sự kiện kèm timeline lịch trình (`agendas`).

#### `POST /api/events/{event_id}/register`
- **Mô tả:** Sinh viên đăng ký tham gia sự kiện.
- **Header:** `Authorization: Bearer <token>`
- **Response `200`:**
  ```json
  {
    "message": "Đăng ký tham gia 'Hội thảo An ninh mạng 2025' thành công.",
    "success": true
  }
  ```

---

### 3.3. Nhóm Điểm Danh (Attendance) — `/api/attendance`

#### `POST /api/attendance/verify`
- **Mô tả:** Xác thực điểm danh kết hợp AI Face ID & GPS Geofencing.
- **Body:**
  ```json
  {
    "event_id": "cyber_2025",
    "check_type": "CHECKIN",
    "user_latitude": 20.980833,
    "user_longitude": 105.795833,
    "face_encoding": [-0.123, 0.456, ...]
  }
  ```
- **Response `200`:**
  ```json
  {
    "success": true,
    "is_valid": true,
    "validation_status": "VALID",
    "message": "Xác nhận CHECKIN thành công!",
    "distance_meters": 1.25,
    "radius_meters": 50,
    "gps_valid": true,
    "face_match_percent": 96.5,
    "face_valid": true,
    "check_type": "CHECKIN",
    "checked_at": "2026-11-21T09:40:00Z"
  }
  ```

#### `GET /api/attendance/my-history`
- **Mô tả:** Lịch sử điểm danh cá nhân của sinh viên.

---

### 3.4. Nhóm Điểm Danh Bù (Makeup Requests) — `/api/makeup`

#### `POST /api/makeup/submit`
- **Mô tả:** Nộp đơn xin điểm danh bù (chỉ mở trong vòng 24h sau khi sự kiện kết thúc).
- **Body:**
  ```json
  {
    "event_id": "workshop_ai_ended",
    "check_type": "CHECKIN",
    "reason": "Lỗi kết nối mạng tại Hội trường B2 đầu giờ",
    "evidence_image_urls": ["/uploads/evidences/mc_01.jpg"]
  }
  ```

#### `GET /api/makeup/my-requests`
- **Mô tả:** Danh sách các đơn xin bù của sinh viên kèm trạng thái (`PENDING_REVIEW`, `APPROVED`, `REJECTED`).

---

### 3.5. Nhóm Nghiệp Vụ Ban Tổ Chức (BTC) — `/api/btc`

| Endpoint | Method | Chức năng |
|:---|:---:|:---|
| `/api/btc/dashboard` | `GET` | Thống kê KPI sự kiện, số lượng sinh viên đăng ký & điểm danh |
| `/api/btc/events` | `POST` | Tạo và xuất bản sự kiện mới kèm bán kính GPS và lịch trình |
| `/api/btc/events/{event_id}/registrants` | `GET` | Danh sách sinh viên đăng ký theo từng sự kiện (có tìm kiếm) |
| `/api/btc/attendance` | `GET` | Giám sát điểm danh thời gian thực, lọc các ca ngoại lệ |
| `/api/btc/attendance/{attendance_id}/approve` | `POST` | Phê duyệt thủ công lượt điểm danh bị lệch GPS/Face |
| `/api/btc/attendance/{attendance_id}/reject` | `POST` | Từ chối lượt điểm danh |
| `/api/btc/makeup/{makeup_id}/review` | `POST` | Duyệt / Từ chối đơn xin điểm danh bù của sinh viên |

---

### 3.6. Nhóm Quản Trị Hệ Thống (Admin) — `/api/admin`

| Endpoint | Method | Chức năng |
|:---|:---:|:---|
| `/api/admin/dashboard` | `GET` | Tổng quan số liệu toàn Học viện |
| `/api/admin/users` | `GET` / `POST` | Xem danh sách & tạo tài khoản người dùng |
| `/api/admin/users/{user_id}` | `PUT` | Cập nhật thông tin / Khóa tài khoản |
| `/api/admin/categories` | `GET` / `POST` | Quản lý danh mục sự kiện & khung điểm ĐRL cơ sở |
| `/api/admin/system-config` | `GET` / `POST` | Cấu hình tham số AI Face ID, bán kính GPS & khung giờ |

---

### 3.7. Nhóm Thông Báo (Notifications) — `/api/notifications`

- `GET /api/notifications`: Lấy danh sách thông báo theo tài khoản và vai trò.
- `POST /api/notifications/{id}/read`: Đánh dấu một thông báo đã đọc.
- `POST /api/notifications/read-all`: Đánh dấu tất cả thông báo đã đọc.
