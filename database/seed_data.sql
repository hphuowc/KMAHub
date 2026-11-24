-- ============================================================================
-- KMA Hub — Dữ liệu mẫu khởi tạo (Seed Data)
-- File: database/seed_data.sql
-- Tương thích 100% với Frontend và kịch bản thực tế của Học viện Kỹ thuật Mật mã
-- ============================================================================

USE `kma_hub`;

-- 1. SEED DỮ LIỆU BẢNG `categories`
INSERT INTO `categories` (`id`, `code`, `name`, `description`, `min_drl`, `max_drl`, `is_active`) VALUES
(1, 'DM-HOITHAO', 'Hội thảo khoa học & Công nghệ', 'Hội thảo chuyên đề An toàn thông tin, Công nghệ thông tin, Điện tử viễn thông', 5, 15, 1),
(2, 'DM-KYNANG', 'Kỹ năng mềm & Hướng nghiệp', 'Tọa đàm kỹ năng sinh viên, ngày hội việc làm và giao lưu doanh nghiệp', 5, 5, 1),
(3, 'DM-TINHNGUYEN', 'Tình nguyện & Phong trào KMA', 'Hiến máu nhân đạo, Mùa hè xanh, Tiếp sức mùa thi và hoạt động Đoàn - Hội', 8, 8, 1),
(4, 'DM-VANHOA', 'Văn hóa & Thể dục thể thao', 'Giải thể thao truyền thống, hội diễn văn nghệ và ngày hội sinh viên KMA', 4, 5, 1);


-- 2. SEED DỮ LIỆU BẢNG `locations` (Tọa độ thực tế khuôn viên Học viện KMA - 141 Chiến Thắng)
INSERT INTO `locations` (`id`, `name`, `address`, `latitude`, `longitude`, `default_radius`, `is_active`) VALUES
(1, 'Hội trường A1', 'Tầng 1 Nhà A1 • Học viện Kỹ thuật Mật mã', 20.98083300, 105.79583300, 50, 1),
(2, 'Hội trường B2', 'Tầng 2 Nhà B2 • Học viện Kỹ thuật Mật mã', 20.98125000, 105.79611100, 50, 1),
(3, 'Sân trường Học viện KMA', 'Khuôn viên trung tâm • 141 Chiến Thắng', 20.98100000, 105.79600000, 100, 1),
(4, 'Nhà thi đấu KMA', 'Khu liên hợp thể thao KMA • 141 Chiến Thắng', 20.98150000, 105.79650000, 100, 1);


-- 3. SEED DỮ LIỆU BẢNG `users`
-- Mật khẩu băm mẫu cho '123456': $2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2
-- Đầy đủ 3 vai trò: Admin, Ban Tổ Chức (BTC), Sinh viên (AT180123, AT180245, AT180378, CT060112...)
INSERT INTO `users` (
  `id`, `username`, `email`, `password_hash`, `role`, `full_name`, `phone`, `avatar_url`,
  `student_code`, `class_name`, `cohort`, `faculty`, `birth_date`, `unit_code`, `management_scope`,
  `face_encoding`, `face_registered_at`, `is_active`
) VALUES
-- Quản trị viên
(
  'u_admin_001', 'admin', 'admin@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'admin', 'Admin Quản trị Hệ thống', '024.3854.3930', '../../assets/images/kma-logo.png',
  NULL, NULL, NULL, 'Phòng Đào tạo & CNTT', NULL, 'KMA_ADMIN', 'Toàn quyền hệ thống',
  NULL, NULL, 1
),
-- Ban Tổ Chức
(
  'u_btc_001', 'btc_doantruong', 'btc_doantruong@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'btc', 'Đoàn Thanh Niên — Ban Tổ Chức KMA', '024.3854.3930', '../../assets/images/kma-logo.png',
  NULL, NULL, NULL, NULL, NULL, 'BTC_DOANTRUONG', 'Sự kiện sinh viên toàn Học viện',
  NULL, NULL, 1
),
(
  'u_btc_002', 'clb_ai_kma', 'clb_ai@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'btc', 'CLB Trí tuệ Nhân tạo KMA', '0988.123.456', NULL,
  NULL, NULL, NULL, NULL, NULL, 'CLB_AI_KMA', 'Cuộc thi & Hội thảo AI',
  NULL, NULL, 1
),
-- Sinh viên AT180123 (Sinh viên chính trong kịch bản test Frontend)
(
  'u_std_001', 'at180123', 'at180123@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'student', 'Nguyễn Văn A', '0987123456', NULL,
  'AT180123', 'AT18A', 'AT18 (2021 - 2026)', 'An toàn Thông tin', '2003-08-12', NULL, NULL,
  -- Vector 128 chiều giả lập Face ID
  '[-0.123, 0.456, 0.789, -0.012, 0.345, -0.678, 0.234, 0.567, -0.891, 0.123, -0.456, 0.789, 0.012, -0.345, 0.678, -0.234, 0.111, -0.222, 0.333, -0.444, 0.555, -0.666, 0.777, -0.888, 0.999, -0.101, 0.202, -0.303, 0.404, -0.505, 0.606, -0.707, -0.123, 0.456, 0.789, -0.012, 0.345, -0.678, 0.234, 0.567, -0.891, 0.123, -0.456, 0.789, 0.012, -0.345, 0.678, -0.234, 0.111, -0.222, 0.333, -0.444, 0.555, -0.666, 0.777, -0.888, 0.999, -0.101, 0.202, -0.303, 0.404, -0.505, 0.606, -0.707, -0.123, 0.456, 0.789, -0.012, 0.345, -0.678, 0.234, 0.567, -0.891, 0.123, -0.456, 0.789, 0.012, -0.345, 0.678, -0.234, 0.111, -0.222, 0.333, -0.444, 0.555, -0.666, 0.777, -0.888, 0.999, -0.101, 0.202, -0.303, 0.404, -0.505, 0.606, -0.707, -0.123, 0.456, 0.789, -0.012, 0.345, -0.678, 0.234, 0.567, -0.891, 0.123, -0.456, 0.789, 0.012, -0.345, 0.678, -0.234, 0.111, -0.222, 0.333, -0.444, 0.555, -0.666, 0.777, -0.888, 0.999, -0.101, 0.202, -0.303, 0.404, -0.505, 0.606, -0.707]',
  '2024-09-05 08:30:00', 1
),
-- Các sinh viên khác
(
  'u_std_002', 'at180245', 'at180245@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'student', 'Trần Thị B', '0912345678', NULL,
  'AT180245', 'AT18B', 'AT18 (2021 - 2026)', 'An toàn Thông tin', '2003-05-19', NULL, NULL,
  NULL, NULL, 1
),
(
  'u_std_003', 'at180378', 'at180378@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'student', 'Lê Hoàng C', '0978999888', NULL,
  'AT180378', 'AT18A', 'AT18 (2021 - 2026)', 'An toàn Thông tin', '2003-11-02', NULL, NULL,
  NULL, NULL, 1
),
(
  'u_std_004', 'ct060112', 'ct060112@actvn.edu.vn',
  '$2b$12$BGdrqoHawsyKEEfQxHF27u6AAege5peABJZNGnAaFqwiReOw.wYQ2',
  'student', 'Phạm Minh D', '0933221100', NULL,
  'CT060112', 'CT06A', 'CT06 (2022 - 2027)', 'Công nghệ Thông tin', '2004-03-25', NULL, NULL,
  NULL, NULL, 1
);


-- 4. SEED DỮ LIỆU BẢNG `events`
-- Các sự kiện tương ứng với config.js frontend:
-- cyber_2025: Đang diễn ra (Check-in mở)
-- checkout_live_2025: Sắp kết thúc (Check-out mở)
-- workshop_ai_ended: Đã kết thúc cách đây 5h (Hạn xin bù 24h còn hiệu lực)
-- seminar_expired_24h: Đã kết thúc cách đây 28h (Quá hạn xin bù)
-- ai_2025: Sắp diễn ra
-- gala_2025: Sắp diễn ra
INSERT INTO `events` (
  `id`, `title`, `category_id`, `organizer_id`, `organizer_name`,
  `location_id`, `location_name`, `latitude`, `longitude`, `radius_meters`,
  `start_time`, `end_time`, `registration_deadline`, `drl_points`,
  `max_seats`, `current_seats`, `description`, `status`
) VALUES
(
  'cyber_2025', 'Hội thảo An ninh mạng 2025', 1, 'u_btc_001',
  'Khoa An toàn Thông tin phối hợp cùng Đoàn Thanh niên KMA',
  1, 'Hội trường A1 • Học viện KMA', 20.98083300, 105.79583300, 50,
  DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_ADD(NOW(), INTERVAL 105 MINUTE),
  DATE_SUB(NOW(), INTERVAL 1 DAY), 10,
  120, 86,
  '<p>Hội thảo An ninh mạng 2025 là sự kiện học thuật thường niên quy mô lớn tại Học viện Kỹ thuật Mật mã, quy tụ các chuyên gia an toàn thông tin hàng đầu.</p>',
  'ongoing'
),
(
  'checkout_live_2025', 'Chuyên đề Mật mã & An toàn Dữ liệu số', 1, 'u_btc_001',
  'Viện Khoa học Công nghệ Mật mã',
  2, 'Hội trường B2 • Học viện KMA', 20.98125000, 105.79611100, 50,
  DATE_SUB(NOW(), INTERVAL 120 MINUTE), DATE_ADD(NOW(), INTERVAL 15 MINUTE),
  DATE_SUB(NOW(), INTERVAL 2 DAY), 8,
  100, 72,
  '<p>Chuyên đề chuyên sâu về các thuật toán mã hóa hiện đại và xu hướng mật mã hậu lượng tử.</p>',
  'ongoing'
),
(
  'workshop_ai_ended', 'Workshop AI Innovation', 1, 'u_btc_002',
  'CLB Trí tuệ Nhân tạo KMA',
  2, 'Hội trường B2 • Học viện KMA', 20.98125000, 105.79611100, 50,
  DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR),
  DATE_SUB(NOW(), INTERVAL 3 DAY), 5,
  80, 78,
  '<p>Workshop thực hành xây dựng mô hình Deep Learning và Computer Vision ứng dụng nhận diện khuôn mặt.</p>',
  'ended'
),
(
  'seminar_expired_24h', 'Tọa đàm Kỹ năng Sinh viên KMA', 2, 'u_btc_001',
  'Hội Sinh viên Học viện KMA',
  1, 'Hội trường A1 • Học viện KMA', 20.98083300, 105.79583300, 50,
  DATE_SUB(NOW(), INTERVAL 31 HOUR), DATE_SUB(NOW(), INTERVAL 28 HOUR),
  DATE_SUB(NOW(), INTERVAL 4 DAY), 5,
  150, 140,
  '<p>Tọa đàm rèn luyện kỹ năng mềm, kỹ năng viết CV và phỏng vấn vào các tập đoàn công nghệ lớn.</p>',
  'ended'
),
(
  'ai_2025', 'Cuộc thi AI Innovation 2025', 1, 'u_btc_002',
  'Khoa Công nghệ Thông tin phối hợp CLB AI KMA',
  3, 'Sân trường Học viện KMA', 20.98100000, 105.79600000, 100,
  DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY),
  DATE_ADD(NOW(), INTERVAL 1 DAY), 15,
  200, 142,
  '<p>Cuộc thi lập trình Hackathon 24h giải quyết bài toán thị giác máy tính và an ninh dữ liệu số.</p>',
  'upcoming'
),
(
  'gala_2025', 'Ngày hội Sinh viên KMA', 4, 'u_btc_001',
  'Hội Sinh viên Học viện Kỹ thuật Mật mã',
  4, 'Nhà thi đấu KMA', 20.98150000, 105.79650000, 100,
  DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY),
  DATE_ADD(NOW(), INTERVAL 4 DAY), 5,
  500, 234,
  '<p>Ngày hội thể thao, gian hàng ẩm thực sinh viên và đêm Gala nghệ thuật chào tân sinh viên KMA.</p>',
  'upcoming'
);


-- 5. SEED DỮ LIỆU BẢNG `event_agendas`
INSERT INTO `event_agendas` (`event_id`, `time_slot`, `title`, `description`, `order_index`) VALUES
('cyber_2025', '08:00 - 08:30', 'Check-in đại biểu & sinh viên', 'Điểm danh GPS + AI Face Verification tại sảnh A1', 1),
('cyber_2025', '08:30 - 09:45', 'Phiên 1: Xu hướng an ninh mạng thế hệ mới', 'Báo cáo viên: TS. Nguyễn Văn Hùng - Cục ATTT', 2),
('cyber_2025', '09:45 - 11:00', 'Phiên 2: Thảo luận & Giải đáp sinh viên', 'Hỏi đáp hướng nghiệp và kỹ năng thực chiến', 3),
('cyber_2025', '11:00 - 11:30', 'Check-out kết thúc sự kiện', 'Hoàn tất 2 lượt điểm danh để nhận +10 điểm rèn luyện', 4),

('ai_2025', '13:00 - 13:30', 'Check-in & Nhận bộ KIT thi đấu', 'Điểm danh GPS + AI Face tại cổng sân trường', 1),
('ai_2025', '13:30 - 14:30', 'Keynote: Tương lai AI tại Việt Nam', 'Diễn giả: PGS.TS Trần Minh Quang - FPT AI Center', 2),
('ai_2025', '14:30 - 16:30', 'Phần thi chính: AI Challenge Round', 'Các đội thi giải quyết bài toán AI trong 2 giờ', 3),
('ai_2025', '16:30 - 17:00', 'Trao giải & Check-out', 'Công bố kết quả, trao giải thưởng và điểm danh kết thúc', 4);


-- 6. SEED DỮ LIỆU BẢNG `event_registrations`
INSERT INTO `event_registrations` (`event_id`, `user_id`, `status`, `registered_at`) VALUES
('cyber_2025', 'u_std_001', 'registered', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('cyber_2025', 'u_std_002', 'registered', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('cyber_2025', 'u_std_003', 'registered', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('checkout_live_2025', 'u_std_001', 'registered', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('checkout_live_2025', 'u_std_002', 'registered', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('workshop_ai_ended', 'u_std_001', 'registered', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ai_2025', 'u_std_001', 'registered', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('gala_2025', 'u_std_002', 'registered', DATE_SUB(NOW(), INTERVAL 1 DAY));


-- 7. SEED DỮ LIỆU BẢNG `attendances`
INSERT INTO `attendances` (
  `id`, `event_id`, `user_id`, `check_type`, `checked_at`,
  `user_latitude`, `user_longitude`, `distance_meters`, `gps_valid`,
  `face_match_percent`, `face_distance`, `face_valid`, `captured_image_url`,
  `is_valid`, `validation_status`, `note`
) VALUES
-- Checkin hợp lệ tại cyber_2025
(
  1, 'cyber_2025', 'u_std_001', 'CHECKIN', DATE_SUB(NOW(), INTERVAL 10 MINUTE),
  20.98084000, 105.79584000, 1.25, 1,
  96.50, 0.2100, 1, NULL,
  1, 'VALID', 'Điểm danh hợp lệ: GPS 1.25m, Face AI khớp 96.5%'
),
-- Điểm danh bị lệch GPS (ngoài bán kính)
(
  2, 'cyber_2025', 'u_std_002', 'CHECKIN', DATE_SUB(NOW(), INTERVAL 8 MINUTE),
  20.98150000, 105.79680000, 115.40, 0,
  94.20, 0.2800, 1, NULL,
  0, 'INVALID', 'Vị trí vượt quá bán kính cho phép (115.4m > 50m)'
),
-- Điểm danh Check-out tại checkout_live_2025 (Trường hợp thiếu Check-in)
(
  3, 'checkout_live_2025', 'u_std_001', 'CHECKOUT', DATE_SUB(NOW(), INTERVAL 5 MINUTE),
  20.98125500, 105.79612000, 1.10, 1,
  95.00, 0.2400, 1, NULL,
  1, 'VALID', 'Check-out thành công lúc kết thúc sự kiện'
);


-- 8. SEED DỮ LIỆU BẢNG `makeup_requests`
INSERT INTO `makeup_requests` (
  `id`, `event_id`, `user_id`, `check_type`, `reason`,
  `status`, `submitted_at`, `reviewer_id`, `reviewed_at`, `review_note`
) VALUES
(
  1, 'workshop_ai_ended', 'u_std_001', 'CHECKIN',
  'Lỗi kết nối mạng Wifi khu vực Hội trường B2 thời điểm đầu giờ nên không thể xác thực.',
  'APPROVED', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'u_btc_002', DATE_SUB(NOW(), INTERVAL 3 HOUR),
  'Đã xác minh hình ảnh có mặt trong hội trường lúc 08:15.'
),
(
  2, 'checkout_live_2025', 'u_std_001', 'CHECKIN',
  'Đến tham dự nhưng do camera điện thoại bị mờ đầu giờ nên chỉ kịp check-out cuối giờ.',
  'PENDING_REVIEW', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL, NULL
);


-- 9. SEED DỮ LIỆU BẢNG `makeup_evidences`
INSERT INTO `makeup_evidences` (`makeup_request_id`, `image_url`, `file_name`, `image_order`) VALUES
(1, '/uploads/evidences/mc_workshop_01.jpg', 'hoi_truong_b2_minh_chung.jpg', 1),
(1, '/uploads/evidences/mc_workshop_02.jpg', 'anh_tap_the_workshop.jpg', 2),
(2, '/uploads/evidences/mc_checkout_01.jpg', 'anh_co_mat_b2.jpg', 1);


-- 10. SEED DỮ LIỆU BẢNG `system_configs`
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES
('ai_model', 'FaceNet / Dlib 128-D', 'Mô hình trích xuất đặc trưng khuôn mặt'),
('face_threshold_percent', '85', 'Ngưỡng so khớp khuôn mặt tối thiểu cố định (85%)'),
('min_face_res', '150x150', 'Độ phân giải khuôn mặt tối thiểu khi chụp'),
('default_radius', '50', 'Bán kính GPS hợp lệ mặc định (mét)'),
('max_gps_acc', '100', 'Độ lệch GPS tối đa cho phép của thiết bị di động (mét)'),
('checkin_window_before', '30', 'Thời gian mở Check-in trước sự kiện (phút)'),
('checkin_window_after', '30', 'Thời gian đóng Check-in sau bắt đầu (phút)'),
('checkout_window_before', '30', 'Thời gian mở Check-out trước kết thúc (phút)'),
('checkout_window_after', '30', 'Thời gian đóng Check-out sau kết thúc (phút)'),
('makeup_hours_after_end', '24', 'Khung giờ cho phép nộp đơn điểm danh bù sau sự kiện (giờ)');


-- 11. SEED DỮ LIỆU BẢNG `notifications`
INSERT INTO `notifications` (`user_id`, `target_role`, `title`, `content`, `type`, `link`, `is_read`, `created_at`) VALUES
('u_std_001', 'student', 'Check-out thiếu Check-in', 'Bạn chưa có dữ liệu Check-in tại <strong>"Workshop AI Innovation"</strong>. Vui lòng gửi yêu cầu điểm danh bù.', 'warning', 'student/makeup.html', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('u_std_001', 'student', 'Đăng ký sự kiện thành công', 'Bạn đã đăng ký tham gia <strong>"Hội thảo An ninh mạng 2025"</strong>.', 'primary', 'student/event-detail.html?event=cyber_2025', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('u_std_001', 'student', 'Điểm danh hợp lệ (+5 ĐRL)', 'Hệ thống đã xác nhận kết quả điểm danh chuyên đề tuần trước.', 'success', 'student/history.html', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(NULL, 'student', 'Sự kiện mới mở đăng ký', 'Đoàn Thanh niên KMA vừa đăng tải <strong>"Ngày hội Sinh viên KMA"</strong>.', 'accent', 'student/event-detail.html?event=gala_2025', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(NULL, 'btc', 'Yêu cầu điểm danh bù mới', 'Sinh viên AT180123 vừa gửi đơn xin điểm danh bù cho sự kiện <strong>"Chuyên đề Mật mã & An toàn Dữ liệu số"</strong>.', 'warning', 'btc/attendance.html', 0, DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
(NULL, 'admin', 'Cảnh báo thiết bị lạ', 'Phát hiện đăng nhập tài khoản quản trị từ địa chỉ IP mới.', 'warning', 'admin/system.html', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));
