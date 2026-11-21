# KMA Hub — Hệ thống Quản lý Sự kiện & Điểm danh Sinh viên

## Giới thiệu

**KMA Hub** là hệ thống web quản lý sự kiện học thuật, phong trào và điểm danh sinh viên tự động dành riêng cho **Học viện Kỹ thuật Mật mã (KMA)**, kết hợp công nghệ nhận diện khuôn mặt AI (**Face Verification 128-D**) và định vị **GPS Geofencing** độ chính xác cao.

---

## Sơ đồ Cấu trúc Dự án

```text
KMA Hub/
├── README.md                                 # Tài liệu hướng dẫn chung & tài khoản test
├── .gitignore                                # Chặn đẩy file rác (.env, __pycache__, node_modules...) lên Git
│
├── frontend/                                 # [ĐÃ HOÀN THIỆN] Giao diện người dùng (HTML5 / CSS3 / JS)
│   ├── index.html                            # Điểm vào mặc định -> chuyển mượt vào pages/auth/login.html
│   │
│   ├── pages/                                # Giao diện HTML thuần (chia theo đúng nhóm vai trò)
│   │   ├── auth/
│   │   │   └── login.html                    # Đăng nhập nhận diện tự động Sinh viên / BTC / Admin
│   │   ├── common/
│   │   │   └── account-info.html             # Hồ sơ cá nhân dùng chung cho cả 3 vai trò
│   │   ├── student/                          # Phân hệ Sinh viên
│   │   │   ├── home.html                     # Trang chủ sự kiện nổi bật & tiến độ ĐRL
│   │   │   ├── event-detail.html             # Chi tiết sự kiện & đăng ký tham gia
│   │   │   ├── attendance.html               # Điểm danh Camera AI Face + định vị GPS theo thời gian thực
│   │   │   ├── makeup.html                   # Gửi đơn xin điểm danh bù (mở trong 24h sau sự kiện)
│   │   │   └── history.html                  # Lịch sử điểm danh cá nhân
│   │   ├── btc/                              # Phân hệ Ban Tổ Chức (Đoàn Thanh Niên / CLB)
│   │   │   ├── dashboard.html                # Tổng quan KPI sự kiện của BTC
│   │   │   ├── events.html                   # Danh sách quản lý & xuất bản sự kiện
│   │   │   ├── event-create.html             # Form tạo sự kiện, cấu hình bán kính GPS & điểm ĐRL
│   │   │   ├── registrants.html              # Danh sách SV đăng ký theo từng sự kiện & xuất Excel
│   │   │   ├── attendance.html               # Giám sát điểm danh & duyệt minh chứng ngoại lệ
│   │   │   └── reports.html                  # Thống kê báo cáo chuyên sâu
│   │   └── admin/                            # Phân hệ Quản trị viên toàn trường
│   │       ├── dashboard.html                # Bảng điều khiển quản trị tổng thể
│   │       ├── users.html                    # Quản lý tài khoản & phân quyền
│   │       ├── events.html                   # Giám sát sự kiện toàn trường & hậu kiểm điểm danh bù
│   │       ├── categories.html               # Quản lý danh mục sự kiện & khung điểm ĐRL
│   │       └── system.html                   # Cấu hình ngưỡng AI Face ID & bán kính GPS
│   │
│   └── assets/                               # Toàn bộ tài nguyên CSS / JS / Ảnh tách rời khỏi HTML
│       ├── css/
│       │   ├── base.css                      # Biến màu KMA (--color-*), reset, typography, grid
│       │   ├── components.css                # Button, badge, card, table, form, modal dùng chung
│       │   └── layouts.css                   # Navbar Sinh viên, Sidebar BTC/Admin & Responsive Mobile
│       ├── js/
│       │   ├── core/                         # Các module lõi nạp trên mọi trang
│       │   │   ├── config.js                 # Cấu hình trung tâm (API_BASE_URL, ngưỡng AI/GPS, Storage keys)
│       │   │   ├── api.js                    # Bộ hàm gọi API chuẩn (KmaApi.get/post/uploadForm kèm JWT)
│       │   │   ├── icons.js                  # Thư viện render icon vector SVG đồng bộ
│       │   │   ├── notifications.js          # Khung thông báo động (Popover) & đồng hồ thời gian thực cho 3 vai trò
│       │   │   └── security.js               # Anti-DevTools (kể cả Mobile Mode), chặn VPN/1.1.1.1, chặn DNS/AdBlock
│       │   └── pages/                        # Logic JS riêng của từng trang tương ứng với thư mục pages/
│       │       ├── auth/
│       │       │   └── login.js
│       │       ├── common/
│       │       │   └── account-info.js
│       │       ├── student/
│       │       │   ├── home.js
│       │       │   ├── event-detail.js
│       │       │   ├── attendance.js
│       │       │   └── makeup.js
│       │       ├── btc/
│       │       │   ├── events.js
│       │       │   ├── event-create.js
│       │       │   ├── registrants.js
│       │       │   └── attendance.js
│       │       └── admin/
│       │           ├── users.js
│       │           ├── events.js
│       │           └── system.js
│       └── images/                           # Thư mục lưu logo, ảnh minh họa, favicon
│
├── backend/                                  # [DÀNH CHO TEAM BACKEND - Python FastAPI / Node.js]
│   ├── .env.example                          # Mẫu biến môi trường (DB_URL, JWT_SECRET - không đẩy .env thật)
│   ├── requirements.txt                      # Thư viện cài đặt (fastapi, uvicorn, face_recognition, sqlalchemy...)
│   └── app/
│       ├── main.py                           # Khởi tạo server & cấu hình CORS cho Frontend gọi sang
│       ├── core/                             # Kết nối CSDL, mã hóa mật khẩu, xác thực JWT + Role Guard
│       ├── models/                           # Khai báo ORM cho 11 bảng CSDL
│       ├── routers/                          # Các nhóm API: auth.py, events.py, attendance.py, btc.py, admin.py
│       └── services/                         # Xử lý nghiệp vụ lõi:
│           ├── face_ai.py                    # Trích xuất & so khớp vector khuôn mặt 128 chiều (face_recognition)
│           └── gps_geofence.py               # Tính khoảng cách thực tế Haversine (mét)
│
├── database/                                 # [DÀNH CHO TEAM CSDL]
│   ├── schema.sql                            # Script khởi tạo 11 bảng chuẩn
│   └── seed_data.sql                         # Dữ liệu mẫu ban đầu để cả nhóm chạy test đồng bộ
│
└── docs/                                     # [TÀI LIỆU BÁO CÁO NHÓM]
    ├── erd-diagram.png                       # Sơ đồ thực thể liên kết (ERD)
    └── api-contract.md                       # Quy ước đầu vào/đầu ra JSON giữa Frontend và Backend
```

---

## Quy ước làm việc nhóm (Team Conventions)

1. **Đặt tên file & thư mục:** Sử dụng chữ thường nối bằng dấu gạch ngang `kebab-case` (ví dụ: `event-detail.html`) để tương thích 100% khi triển khai lên máy chủ Linux / Cloud.
2. **Tách biệt giao diện và xử lý:** Không viết khối `<script>` dài trực tiếp trong file `.html`. Mọi logic xử lý hoặc gọi API của trang nào được đặt tại file tương ứng trong `frontend/assets/js/pages/...` để tránh xung đột (`merge conflict`) khi nhiều thành viên cùng làm việc trên Git.
3. **Kết nối Backend tập trung:**
   - Thay đổi địa chỉ máy chủ API duy nhất tại `frontend/assets/js/core/config.js` (`window.KMA_CONFIG.API_BASE_URL`, mặc định `http://localhost:8000/api`).
   - Sử dụng bộ hàm `window.KmaApi` trong `frontend/assets/js/core/api.js` để tự động gắn `Authorization: Bearer <token>` cho mọi yêu cầu.

---

## Tài khoản mẫu để kiểm thử Frontend

| Vai trò | Tên đăng nhập | Mật khẩu mẫu | Trang đích sau đăng nhập |
|:---|:---|:---:|:---|
| **Sinh viên** | `AT180123` *(hoặc CT/DT)* | `123456` | `frontend/pages/student/home.html` |
| **Ban Tổ Chức (BTC)** | `btc_doantruong@actvn.edu.vn` | `123456` | `frontend/pages/btc/dashboard.html` |
| **Quản trị viên (Admin)** | `admin@actvn.edu.vn` | `123456` | `frontend/pages/admin/dashboard.html` |

---

## Hướng dẫn Cài đặt & Khởi chạy Hệ thống Toàn diện

### 1. Khởi tạo Cơ sở dữ liệu MySQL 8.0
1. Mở MySQL Workbench, DBeaver, phpMyAdmin hoặc Terminal MySQL:
```bash
mysql -u root -p
```
2. Thực thi tuần tự 2 script SQL đã chuẩn bị sẵn trong thư mục `database/`:
```sql
-- Bước 1: Tạo Database kma_hub và 11 bảng chuẩn hóa quan hệ
SOURCE database/schema.sql;

-- Bước 2: Nạp dữ liệu mẫu ban đầu (tài khoản, sự kiện, GPS, Face AI, thông báo)
SOURCE database/seed_data.sql;
```

---

### 2. Khởi chạy Backend (Python FastAPI)
1. Di chuyển vào thư mục backend:
```bash
cd backend
```
2. Cấu hình file môi trường:
- Mở file `.env` và điều chỉnh tài khoản/mật khẩu MySQL nếu khác với mặc định:
```ini
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/kma_hub?charset=utf8mb4
```
3. Cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```
4. Khởi chạy FastAPI Server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Tài liệu API Swagger UI:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Kiểm tra trạng thái:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 3. Khởi chạy Frontend
Mở trực tiếp file `frontend/index.html` trên trình duyệt hoặc sử dụng extension **Live Server** trong VS Code tại thư mục `frontend/`. Frontend sẽ tự động kết nối với API Backend tại `http://localhost:8000/api`.
