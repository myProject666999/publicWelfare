CREATE DATABASE IF NOT EXISTS publicwelfare DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE publicwelfare;

INSERT INTO admins (username, password, real_name, phone, role, status, created_at, updated_at) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW', '超级管理员', '13800138000', 'admin', 1, NOW(), NOW());
