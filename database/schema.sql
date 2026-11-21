-- ============================================================================
-- KMA Hub — Hệ thống Quản lý Sự kiện & Điểm danh Sinh viên KMA
-- Database Schema: MySQL 8.0+
-- File: database/schema.sql
-- Gồm 11 bảng chuẩn hóa quan hệ 3NF, hỗ trợ UTF8MB4 & InnoDB Foreign Keys
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `kma_hub`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `kma_hub`;

-- Tắt kiểm tra khóa ngoại khi khởi tạo lại bảng
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `system_configs`;
DROP TABLE IF EXISTS `makeup_evidences`;
DROP TABLE IF EXISTS `makeup_requests`;
DROP TABLE IF EXISTS `attendances`;
DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `event_agendas`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Bảng `users`: Người dùng (Sinh viên, Ban Tổ Chức, Quản trị viên)
-- Lưu trữ thông tin tài khoản, thông tin sinh viên/đơn vị & vector khuôn mặt AI 128D
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID định danh',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã SV (AT180123) hoặc username',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email học viện @actvn.edu.vn',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu băm Bcrypt / Argon2',
  `role` ENUM('student', 'btc', 'admin') NOT NULL DEFAULT 'student' COMMENT 'Vai trò người dùng',
  `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên hoặc tên đơn vị',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại liên lạc',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh đại diện',
  
  -- Thuộc tính riêng cho Sinh viên
  `student_code` VARCHAR(20) DEFAULT NULL UNIQUE COMMENT 'Mã số sinh viên (AT180123...)',
  `class_name` VARCHAR(30) DEFAULT NULL COMMENT 'Lớp niên chế (ví dụ: AT18A, CT6B)',
  `cohort` VARCHAR(30) DEFAULT NULL COMMENT 'Khóa đào tạo (ví dụ: AT18 (2021 - 2026))',
  `faculty` VARCHAR(100) DEFAULT NULL COMMENT 'Khoa (An toàn Thông tin, CNTT, ĐTVT)',
  `birth_date` DATE DEFAULT NULL COMMENT 'Ngày tháng năm sinh',
  
  -- Thuộc tính riêng cho Ban Tổ Chức
  `unit_code` VARCHAR(50) DEFAULT NULL COMMENT 'Mã đơn vị tổ chức (BTC_DOANTRUONG, CLB_AI...)',
  `management_scope` VARCHAR(150) DEFAULT NULL COMMENT 'Phạm vi quản lý sự kiện',

  -- Dữ liệu nhận diện khuôn mặt AI (128-D Embedding vector)
  `face_encoding` JSON DEFAULT NULL COMMENT 'Mảng vector số thực 128 chiều khuôn mặt',
  `face_registered_at` DATETIME DEFAULT NULL COMMENT 'Thời điểm đăng ký Face ID',
  
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái hoạt động (1: Hoạt động, 0: Khóa)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_student_code` (`student_code`),
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng và phân quyền';


-- ----------------------------------------------------------------------------
-- 2. Bảng `categories`: Danh mục sự kiện & Khung điểm Rèn luyện (ĐRL)
-- ----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã danh mục: DM-HOITHAO, DM-KYNANG...',
  `name` VARCHAR(120) NOT NULL COMMENT 'Tên danh mục sự kiện',
  `description` TEXT DEFAULT NULL COMMENT 'Mô tả phạm vi hoạt động của danh mục',
  `min_drl` INT NOT NULL DEFAULT 5 COMMENT 'Điểm rèn luyện tối thiểu',
  `max_drl` INT NOT NULL DEFAULT 15 COMMENT 'Điểm rèn luyện tối đa',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cat_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục sự kiện và khung điểm ĐRL';


-- ----------------------------------------------------------------------------
-- 3. Bảng `locations`: Địa điểm tổ chức sự kiện & Tọa độ GPS Geofencing
-- ----------------------------------------------------------------------------
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL COMMENT 'Tên địa điểm (Hội trường A1, Sân trường...)',
  `address` VARCHAR(255) NOT NULL DEFAULT 'Học viện Kỹ thuật Mật mã, 141 Chiến Thắng, Tân Triều, Thanh Trì, Hà Nội',
  `latitude` DECIMAL(10, 8) NOT NULL COMMENT 'Vĩ độ GPS chuẩn',
  `longitude` DECIMAL(11, 8) NOT NULL COMMENT 'Kinh độ GPS chuẩn',
  `default_radius` INT NOT NULL DEFAULT 50 COMMENT 'Bán kính hợp lệ mặc định (mét)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_loc_coords` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Địa điểm và tọa độ GPS Geofence';


-- ----------------------------------------------------------------------------
-- 4. Bảng `events`: Thông tin sự kiện
-- ----------------------------------------------------------------------------
CREATE TABLE `events` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Mã sự kiện: cyber_2025, ai_2025...',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện',
  `category_id` INT NOT NULL COMMENT 'Khóa ngoại danh mục',
  `organizer_id` VARCHAR(36) NOT NULL COMMENT 'Khóa ngoại người/đơn vị tạo (users.id)',
  `organizer_name` VARCHAR(150) NOT NULL COMMENT 'Đơn vị phối hợp hiển thị',
  
  -- Địa điểm & Tọa độ Geofence của sự kiện
  `location_id` INT DEFAULT NULL COMMENT 'Khóa ngoại địa điểm chuẩn (nếu chọn sẵn)',
  `location_name` VARCHAR(200) NOT NULL COMMENT 'Tên địa điểm thực tế tổ chức',
  `latitude` DECIMAL(10, 8) NOT NULL COMMENT 'Vĩ độ tâm GPS',
  `longitude` DECIMAL(11, 8) NOT NULL COMMENT 'Kinh độ tâm GPS',
  `radius_meters` INT NOT NULL DEFAULT 50 COMMENT 'Bán kính Geofence hợp lệ (mét)',
  
  -- Thời gian & Điểm rèn luyện
  `start_time` DATETIME NOT NULL COMMENT 'Thời gian bắt đầu sự kiện',
  `end_time` DATETIME NOT NULL COMMENT 'Thời gian kết thúc sự kiện',
  `registration_deadline` DATETIME NOT NULL COMMENT 'Hạn cuối sinh viên được đăng ký',
  `drl_points` INT NOT NULL DEFAULT 5 COMMENT 'Điểm rèn luyện cộng khi hoàn tất điểm danh',
  
  -- Quy mô chỗ ngồi
  `max_seats` INT NOT NULL DEFAULT 100 COMMENT 'Tổng số chỗ tối đa',
  `current_seats` INT NOT NULL DEFAULT 0 COMMENT 'Số sinh viên đã đăng ký',
  
  -- Nội dung & Trạng thái
  `description` LONGTEXT DEFAULT NULL COMMENT 'Mô tả chi tiết dạng HTML / Text',
  `banner_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh bìa sự kiện',
  `status` ENUM('upcoming', 'ongoing', 'ended', 'cancelled') NOT NULL DEFAULT 'upcoming' COMMENT 'Trạng thái sự kiện',
  
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_events_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_events_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  INDEX `idx_events_status` (`status`),
  INDEX `idx_events_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh sách sự kiện';


-- ----------------------------------------------------------------------------
-- 5. Bảng `event_agendas`: Lịch trình chi tiết trong sự kiện
-- ----------------------------------------------------------------------------
CREATE TABLE `event_agendas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(50) NOT NULL COMMENT 'Khóa ngoại sự kiện',
  `time_slot` VARCHAR(50) NOT NULL COMMENT 'Ví dụ: 08:00 - 08:30',
  `title` VARCHAR(200) NOT NULL COMMENT 'Tiêu đề phiên',
  `description` TEXT DEFAULT NULL COMMENT 'Chi tiết phiên / Báo cáo viên',
  `order_index` INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  
  CONSTRAINT `fk_agendas_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  INDEX `idx_agendas_event` (`event_id`, `order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch trình chi tiết từng sự kiện';


-- ----------------------------------------------------------------------------
-- 6. Bảng `event_registrations`: Sinh viên đăng ký tham gia sự kiện
-- ----------------------------------------------------------------------------
CREATE TABLE `event_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `status` ENUM('registered', 'cancelled') NOT NULL DEFAULT 'registered',
  `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY `uk_event_user` (`event_id`, `user_id`),
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_reg_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh sách đăng ký tham gia của sinh viên';


-- ----------------------------------------------------------------------------
-- 7. Bảng `attendances`: Nhật ký điểm danh Check-in & Check-out
-- Lưu tọa độ GPS thực tế, tính khoảng cách, % so khớp Face AI và bằng chứng ảnh
-- ----------------------------------------------------------------------------
CREATE TABLE `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `check_type` ENUM('CHECKIN', 'CHECKOUT') NOT NULL COMMENT 'Loại điểm danh',
  `checked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi yêu cầu điểm danh',
  
  -- Dữ liệu định vị GPS
  `user_latitude` DECIMAL(10, 8) NOT NULL COMMENT 'Vĩ độ thực tế của thiết bị sinh viên',
  `user_longitude` DECIMAL(11, 8) NOT NULL COMMENT 'Kinh độ thực tế của thiết bị sinh viên',
  `distance_meters` DECIMAL(8, 2) NOT NULL COMMENT 'Khoảng cách Haversine tới tâm sự kiện (mét)',
  `gps_valid` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 nếu khoảng cách <= bán kính quy định',
  
  -- Dữ liệu nhận diện khuôn mặt Face AI
  `face_match_percent` DECIMAL(5, 2) NOT NULL COMMENT '% Trùng khớp khuôn mặt (≥85%)',
  `face_distance` DECIMAL(6, 4) DEFAULT NULL COMMENT 'Khoảng cách vector Euclid (<=0.45)',
  `face_valid` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 nếu % khớp >= 85%',
  `captured_image_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh chụp từ camera lúc điểm danh',
  
  -- Kết quả đánh giá
  `is_valid` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 nếu cả GPS và Face đều đạt',
  `validation_status` ENUM(
    'VALID',            -- Hợp lệ tự động
    'INVALID',          -- Không hợp lệ (xa quá hoặc lệch mặt)
    'PENDING_REVIEW',   -- Chờ BTC/Admin duyệt ngoại lệ
    'MANUAL_APPROVED',  -- Đã duyệt bổ sung thủ công
    'REJECTED'          -- Bị từ chối
  ) NOT NULL DEFAULT 'VALID',
  `note` VARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú hệ thống (Lệch GPS 62m, Face khớp 94%...)',
  
  -- Thông tin xét duyệt (nếu duyệt bù thủ công)
  `reviewer_id` VARCHAR(36) DEFAULT NULL COMMENT 'Người duyệt',
  `reviewed_at` DATETIME DEFAULT NULL COMMENT 'Thời gian duyệt',
  
  CONSTRAINT `fk_att_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_att_event_user` (`event_id`, `user_id`, `check_type`),
  INDEX `idx_att_checked_at` (`checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký điểm danh thời gian thực';


-- ----------------------------------------------------------------------------
-- 8. Bảng `makeup_requests`: Đơn xin điểm danh bù
-- Áp dụng khi SV thiếu Check-in hoặc gặp lỗi kỹ thuật trong vòng 24h sau sự kiện
-- ----------------------------------------------------------------------------
CREATE TABLE `makeup_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `check_type` ENUM('CHECKIN', 'CHECKOUT', 'BOTH') NOT NULL DEFAULT 'CHECKIN' COMMENT 'Lượt xin điểm danh bù',
  `reason` TEXT NOT NULL COMMENT 'Lý do xin điểm danh bù',
  `status` ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_REVIEW',
  
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewer_id` VARCHAR(36) DEFAULT NULL COMMENT 'BTC hoặc Admin duyệt đơn',
  `reviewed_at` DATETIME DEFAULT NULL,
  `review_note` TEXT DEFAULT NULL COMMENT 'Lý do duyệt hoặc từ chối',
  
  CONSTRAINT `fk_makeup_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_makeup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_makeup_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_makeup_status` (`status`),
  INDEX `idx_makeup_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu xin điểm danh bù';


-- ----------------------------------------------------------------------------
-- 9. Bảng `makeup_evidences`: Ảnh minh chứng đính kèm đơn xin bù (tối đa 3 ảnh)
-- ----------------------------------------------------------------------------
CREATE TABLE `makeup_evidences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `makeup_request_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL COMMENT 'Đường dẫn ảnh minh chứng có mặt tại sự kiện',
  `file_name` VARCHAR(150) DEFAULT NULL COMMENT 'Tên file gốc',
  `image_order` TINYINT NOT NULL DEFAULT 1 COMMENT 'Thứ tự ảnh 1, 2, 3',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_evidence_makeup` FOREIGN KEY (`makeup_request_id`) REFERENCES `makeup_requests` (`id`) ON DELETE CASCADE,
  INDEX `idx_evidence_req` (`makeup_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Minh chứng ảnh đính kèm đơn điểm danh bù';


-- ----------------------------------------------------------------------------
-- 10. Bảng `system_configs`: Cấu hình hệ thống toàn trường
-- Lưu trữ ngưỡng AI Face ID, bán kính GPS mặc định, khung thời gian điểm danh
-- ----------------------------------------------------------------------------
CREATE TABLE `system_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Khóa cấu hình',
  `config_value` TEXT NOT NULL COMMENT 'Giá trị cấu hình (chuỗi hoặc JSON)',
  `description` VARCHAR(255) DEFAULT NULL COMMENT 'Mô tả cấu hình',
  `updated_by` VARCHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_cfg_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cấu hình tham số hệ thống AI và GPS';


-- ----------------------------------------------------------------------------
-- 11. Bảng `notifications`: Thông báo hệ thống cho các nhóm người dùng
-- ----------------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) DEFAULT NULL COMMENT 'Người nhận cụ thể (NULL nếu gửi theo role/toàn trường)',
  `target_role` ENUM('all', 'student', 'btc', 'admin') NOT NULL DEFAULT 'all' COMMENT 'Vai trò đích nhận thông báo',
  `title` VARCHAR(150) NOT NULL COMMENT 'Tiêu đề thông báo',
  `content` TEXT NOT NULL COMMENT 'Nội dung thông báo',
  `type` ENUM('primary', 'warning', 'success', 'danger', 'info', 'accent') NOT NULL DEFAULT 'info',
  `link` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn hành động khi nhấp',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Chưa đọc, 1: Đã đọc',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notif_role_user` (`target_role`, `user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hệ thống thông báo đẩy';
