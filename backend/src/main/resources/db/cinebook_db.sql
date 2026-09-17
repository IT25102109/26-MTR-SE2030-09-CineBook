-- ========================================================
-- CineBook Database Schema & Seed Data
-- Database: `cinebook_db`
-- Conforms to: EER Diagram (docs/erd/26-MTR-IT2140-09_Assignment01_EER.drawio.png)
-- Compatible with: Spring Boot 3.x JPA Entities & React Frontend
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- 1. DROP EXISTING TABLES (Reverse Dependency Order)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notification_templates`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `loyalty_vouchers`;
DROP TABLE IF EXISTS `waitlists`;
DROP TABLE IF EXISTS `wishlist_items`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `refunds`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booked_seats`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `showtimes`;
DROP TABLE IF EXISTS `seats`;
DROP TABLE IF EXISTS `cinema_halls`;
DROP TABLE IF EXISTS `movie_genres`;
DROP TABLE IF EXISTS `genres`;
DROP TABLE IF EXISTS `movies`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `cinemas`;

-- --------------------------------------------------------
-- 2. TABLE: `cinemas` (EER Entity: `Branch`)
-- --------------------------------------------------------
CREATE TABLE `cinemas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_halls` int DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 3. TABLE: `cinema_halls` (EER Entity: `Hall`)
-- --------------------------------------------------------
CREATE TABLE `cinema_halls` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cinema_id` bigint DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `hall_number` int DEFAULT 1,
  `hall_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Standard',
  `rows` int NOT NULL DEFAULT 8,
  `seats_per_row` int NOT NULL DEFAULT 12,
  `premium_rows` int NOT NULL DEFAULT 2,
  `capacity` int NOT NULL DEFAULT 96,
  PRIMARY KEY (`id`),
  KEY `idx_hall_cinema` (`cinema_id`),
  CONSTRAINT `fk_cinema_halls_cinema` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. TABLE: `seats` (EER Entity: `Seat`)
-- --------------------------------------------------------
CREATE TABLE `seats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `hall_id` bigint NOT NULL,
  `seat_code` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `row_label` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `seat_number` int NOT NULL,
  `seat_category` enum('Standard','Premium','VIP','Recliner') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Standard',
  `is_active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hall_row_seat` (`hall_id`, `row_label`, `seat_number`),
  CONSTRAINT `fk_seats_hall` FOREIGN KEY (`hall_id`) REFERENCES `cinema_halls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 5. TABLE: `genres` (EER Entity: `Genre`)
-- --------------------------------------------------------
CREATE TABLE `genres` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_genre_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 6. TABLE: `movies` (EER Entity: `Movie`)
-- --------------------------------------------------------
CREATE TABLE `movies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `synopsis` varchar(2000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cast_csv` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `director` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `genres_csv` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `language` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rating` double NOT NULL DEFAULT 0,
  `duration_min` int NOT NULL DEFAULT 0,
  `certification` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'PG-13',
  `release_date` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `poster_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `backdrop_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `trailer_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'now_showing',
  `featured` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 7. TABLE: `movie_genres` (EER Relationship: `BELONGS_TO`)
-- --------------------------------------------------------
CREATE TABLE `movie_genres` (
  `movie_id` bigint NOT NULL,
  `genre_id` bigint NOT NULL,
  PRIMARY KEY (`movie_id`, `genre_id`),
  KEY `idx_mg_genre` (`genre_id`),
  CONSTRAINT `fk_mg_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mg_genre` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 8. TABLE: `users` (EER Entity: `User` with Customer, CinemaManager, Admin attributes)
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('ADMIN','CINEMA_MANAGER','CUSTOMER') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CUSTOMER',
  `date_registered` datetime DEFAULT CURRENT_TIMESTAMP,
  `branch_id` bigint DEFAULT NULL,
  `loyalty_points` int DEFAULT 0,
  `membership_tier` enum('Bronze','Silver','Gold','Platinum') COLLATE utf8mb4_general_ci DEFAULT 'Bronze',
  `employee_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `access_level` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatar_color` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '#F5C518',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_branch` (`branch_id`),
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `cinemas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 9. TABLE: `showtimes` (EER Entity: `Showtime`)
-- --------------------------------------------------------
CREATE TABLE `showtimes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `movie_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `branch_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `hall_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hall_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `time` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `end_time` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `base_price` double NOT NULL DEFAULT 12,
  `premium_price` double NOT NULL DEFAULT 18,
  `booked_seats_csv` varchar(2000) COLLATE utf8mb4_general_ci DEFAULT '',
  `status` enum('scheduled','in_progress','completed','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'scheduled',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_showtimes_movie` (`movie_id`),
  KEY `idx_showtimes_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 10. TABLE: `bookings` (EER Entity: `Booking`)
-- --------------------------------------------------------
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_ref` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `movie_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `movie_title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `movie_poster` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hall_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `showtime_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `time` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seats_csv` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_amount` double NOT NULL DEFAULT 0,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'confirmed',
  `refund_status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'none',
  `refund_amount` double DEFAULT NULL,
  `rescheduled_from` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'card',
  `payment_status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'paid',
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_ref` (`booking_ref`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_showtime` (`showtime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 11. TABLE: `booked_seats` (EER Aggregation: `Seat Reservation`)
-- --------------------------------------------------------
CREATE TABLE `booked_seats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `seat_id` bigint DEFAULT NULL,
  `seat_code` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `price_charged` double NOT NULL DEFAULT 0,
  `seat_status` enum('reserved','confirmed','released','cancelled') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (`id`),
  KEY `idx_bs_booking` (`booking_id`),
  KEY `idx_bs_seat` (`seat_id`),
  CONSTRAINT `fk_bs_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bs_seat` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 12. TABLE: `payments` (EER Entity: `Payment`)
-- --------------------------------------------------------
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `amount` double NOT NULL,
  `method` enum('CARD','WALLET','ONLINE_BANKING','CASH') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CARD',
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SUCCESS',
  `gateway_ref` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_code` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `check_in_status` enum('NOT_CHECKED_IN','CHECKED_IN') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NOT_CHECKED_IN',
  `transaction_data` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_booking` (`booking_id`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 13. TABLE: `refunds` (EER Entity: `Refund`)
-- --------------------------------------------------------
CREATE TABLE `refunds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `refund_amount` double NOT NULL,
  `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_data` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('PENDING','PROCESSED','REJECTED') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `reason` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'Customer requested cancellation',
  `deduction_amount` double DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_refunds_booking` (`booking_id`),
  CONSTRAINT `fk_refunds_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 14. TABLE: `promotions` (EER Entity: `PromoCode`)
-- --------------------------------------------------------
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `discount_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `discount_value` double NOT NULL,
  `min_spend` double NOT NULL DEFAULT 0,
  `valid_from` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_until` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `usage_limit` int DEFAULT 100,
  `times_used` int DEFAULT 0,
  `active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promotions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 15. TABLE: `reviews` (EER Entity: `Review`)
-- --------------------------------------------------------
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `movie_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rating` int NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` text COLLATE utf8mb4_general_ci,
  `review_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `moderation_status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'APPROVED',
  PRIMARY KEY (`id`),
  KEY `idx_reviews_movie` (`movie_id`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 16. TABLE: `wishlist_items` (EER Entity: `WishlistItem`)
-- --------------------------------------------------------
CREATE TABLE `wishlist_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `movie_id` bigint NOT NULL,
  `date_added` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wishlist_user_movie` (`user_id`, `movie_id`),
  KEY `idx_wishlist_movie` (`movie_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 17. TABLE: `waitlists` (Roadmap: Sold-Out Showtime Waitlist Queue)
-- --------------------------------------------------------
CREATE TABLE `waitlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `showtime_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `seats_requested` int NOT NULL DEFAULT 1,
  `status` enum('WAITING','NOTIFIED','BOOKED','EXPIRED') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'WAITING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_waitlist_showtime` (`showtime_id`),
  KEY `idx_waitlist_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 18. TABLE: `loyalty_vouchers` (Roadmap: Customer Points Redemption)
-- --------------------------------------------------------
CREATE TABLE `loyalty_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `points_cost` int NOT NULL DEFAULT 100,
  `status` enum('ACTIVE','REDEEMED','EXPIRED') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ACTIVE',
  `redeemed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_code` (`code`),
  KEY `idx_voucher_user` (`user_id`),
  CONSTRAINT `fk_voucher_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 19. TABLE: `notifications` (Roadmap: Notifications & Alerts)
-- --------------------------------------------------------
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `audience` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'all',
  `audience_target` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'sent',
  `is_read` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 20. TABLE: `notification_templates` (Roadmap: Broadcast Templates)
-- --------------------------------------------------------
CREATE TABLE `notification_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================================
-- SEED DATA INSERTIONS
-- ========================================================

-- --------------------------------------------------------
-- Seed: `cinemas`
-- --------------------------------------------------------
INSERT INTO `cinemas` (`id`, `name`, `city`, `address`, `location`, `contact_phone`, `total_halls`) VALUES
(1, 'CineBook Downtown', 'New York', '123 Broadway, New York, NY 10001', 'New York - 123 Broadway, New York, NY 10001', '+1-212-555-0101', 3),
(2, 'CineBook Westside', 'Los Angeles', '456 Sunset Blvd, Los Angeles, CA 90028', 'Los Angeles - 456 Sunset Blvd, Los Angeles, CA 90028', '+1-310-555-0102', 2),
(3, 'CineBook Lakeside', 'Chicago', '789 Navy Pier, Chicago, IL 60611', 'Chicago - 789 Navy Pier, Chicago, IL 60611', '+1-312-555-0103', 3);

-- --------------------------------------------------------
-- Seed: `cinema_halls`
-- --------------------------------------------------------
INSERT INTO `cinema_halls` (`id`, `cinema_id`, `name`, `hall_number`, `hall_type`, `rows`, `seats_per_row`, `premium_rows`, `capacity`) VALUES
(1, 1, 'Hall A — IMAX', 1, 'IMAX', 10, 16, 2, 160),
(2, 1, 'Hall B — Standard', 2, 'Standard', 8, 12, 2, 96),
(3, 1, 'Hall C — Recliner', 3, 'Recliner', 6, 10, 3, 60),
(4, 2, 'Hall A — Dolby Atmos', 1, 'Dolby Atmos', 10, 14, 2, 140),
(5, 2, 'Hall B — Standard', 2, 'Standard', 8, 12, 2, 96),
(6, 3, 'Hall A — IMAX', 1, 'IMAX', 10, 16, 2, 160),
(7, 3, 'Hall B — Standard', 2, 'Standard', 8, 12, 2, 96),
(8, 3, 'Hall C — VIP', 3, 'VIP', 6, 8, 3, 48);

-- --------------------------------------------------------
-- Seed: `seats` (Representative layout for Hall 1, Hall 2, Hall 8)
-- --------------------------------------------------------
INSERT INTO `seats` (`hall_id`, `seat_code`, `row_label`, `seat_number`, `seat_category`) VALUES
-- Hall 1 (IMAX - Row A standard, Row I & J Premium)
(1, 'A1', 'A', 1, 'Standard'), (1, 'A2', 'A', 2, 'Standard'), (1, 'A3', 'A', 3, 'Standard'), (1, 'A4', 'A', 4, 'Standard'),
(1, 'B1', 'B', 1, 'Standard'), (1, 'B2', 'B', 2, 'Standard'), (1, 'B3', 'B', 3, 'Standard'), (1, 'B4', 'B', 4, 'Standard'),
(1, 'F4', 'F', 4, 'Standard'), (1, 'F5', 'F', 5, 'Standard'), (1, 'F6', 'F', 6, 'Standard'), (1, 'F7', 'F', 7, 'Standard'),
(1, 'I1', 'I', 1, 'Premium'),  (1, 'I2', 'I', 2, 'Premium'),  (1, 'I3', 'I', 3, 'Premium'),  (1, 'I4', 'I', 4, 'Premium'),
(1, 'J1', 'J', 1, 'Premium'),  (1, 'J2', 'J', 2, 'Premium'),  (1, 'J3', 'J', 3, 'Premium'),  (1, 'J4', 'J', 4, 'Premium'),
-- Hall 2 (Standard)
(2, 'A1', 'A', 1, 'Standard'), (2, 'A2', 'A', 2, 'Standard'), (2, 'A3', 'A', 3, 'Standard'),
(2, 'C3', 'C', 3, 'Standard'), (2, 'C4', 'C', 4, 'Standard'), (2, 'C5', 'C', 5, 'Standard'),
(2, 'G1', 'G', 1, 'Premium'),  (2, 'G2', 'G', 2, 'Premium'),
-- Hall 8 (VIP Recliner)
(8, 'A1', 'A', 1, 'VIP'), (8, 'A2', 'A', 2, 'VIP'), (8, 'B1', 'B', 1, 'VIP'), (8, 'B2', 'B', 2, 'VIP'),
(8, 'D1', 'D', 1, 'VIP'), (8, 'D2', 'D', 2, 'VIP'), (8, 'E1', 'E', 1, 'VIP'), (8, 'E2', 'E', 2, 'VIP');

-- --------------------------------------------------------
-- Seed: `genres`
-- --------------------------------------------------------
INSERT INTO `genres` (`id`, `name`, `description`) VALUES
(1, 'Action', 'Fast-paced storytelling with high physical stakes and stunts'),
(2, 'Adventure', 'Exploration, epic journeys, and daring exploits'),
(3, 'Sci-Fi', 'Futuristic science, space travel, and speculative concepts'),
(4, 'Drama', 'Character-driven emotional depth and conflict'),
(5, 'Thriller', 'Suspenseful narratives full of unexpected twists'),
(6, 'Comedy', 'Light-hearted, humorous, and entertaining stories'),
(7, 'History', 'Narratives rooted in significant historical events and eras'),
(8, 'Romance', 'Passionate love stories and relational connections'),
(9, 'Crime', 'Underworld investigations, detectives, and criminal heists');

-- --------------------------------------------------------
-- Seed: `movies`
-- --------------------------------------------------------
INSERT INTO `movies` (`id`, `title`, `synopsis`, `cast_csv`, `director`, `genres_csv`, `language`, `rating`, `duration_min`, `certification`, `release_date`, `poster_url`, `backdrop_url`, `trailer_url`, `status`, `featured`) VALUES
(1, 'Father', 'A poignant journey exploring sacrifice, love, and redemption between a devoted father and his estranged family in contemporary Sri Lanka.', 'Dilhani Ekanayeke,Bimal Jayakodi,Saumya Liyanage', 'Chaminda Jayasooriya', 'Action,Drama,Thriller', 'Sinhala', 8.2, 120, 'PG-13', '2026-09-16', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiI1ovaeBvm75ctwrmOHOZDDL2x73_Z1q5YoKainzUORqr3jxZmRAMzVQ_&s=10', 'https://lk-aps.bmscdn.com/events/mobile/father-et00005963-06-01-2026-09-36-51.jpg', '#', 'now_showing', b'1'),
(2, 'Spider-Man: Brand New Day', 'Peter Parker lives entirely alone in New York City, voluntarily erased from the memories of everyone he loves, dedicating himself full-time to being Spider-Man until a dangerous threat emerges.', 'Tom Holland,Sadie Sink,Zendaya,Jacob Batalon', 'Destin Daniel Cretton', 'Action,Adventure,Sci-Fi', 'English', 8.0, 145, 'PG-13', '2026-09-16', 'https://a.ltrbxd.com/resized/film-poster/8/7/2/8/7/1/872871-spider-man-brand-new-day-0-230-0-345-crop.jpg?v=ebe6beb4fc', 'https://i.ytimg.com/vi/daXaTug8rL4/maxresdefault.jpg', '#', 'now_showing', b'1'),
(3, 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'Timothée Chalamet,Zendaya,Rebecca Ferguson,Javier Bardem,Austin Butler', 'Denis Villeneuve', 'Sci-Fi,Adventure,Drama', 'English', 8.7, 166, 'PG-13', '2024-03-01', 'https://image.tmdb.org/t/p/w500/1pdfLvkbL972k74zp9rnm7Oipsn.jpg', 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', '#', 'now_showing', b'1'),
(4, 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.', 'Cillian Murphy,Emily Blunt,Matt Damon,Robert Downey Jr.,Florence Pugh', 'Christopher Nolan', 'Drama,History,Thriller', 'English', 8.4, 180, 'R', '2024-02-15', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykQ5L8kR6qVr3.jpg', 'https://image.tmdb.org/t/p/original/rLb2cwH3nZJ2xgKqGw5Ov9mF5m5.jpg', '#', 'now_showing', b'0'),
(5, 'Poor Things', 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.', 'Emma Stone,Mark Ruffalo,Willem Dafoe,Ramy Youssef', 'Yorgos Lanthimos', 'Comedy,Drama,Romance', 'English', 7.9, 141, 'R', '2024-01-12', 'https://image.tmdb.org/t/p/w500/kCGlIMxk5tnXuIMiqU8Lfxd3AF2.jpg', 'https://image.tmdb.org/t/p/original/dWQ6UjBuHtcTTZmQ3BzbiqQfdSK.jpg', '#', 'now_showing', b'0'),
(6, 'The Holdovers', 'A curmudgeonly instructor at a prep school remains on campus over the holidays with a troubled student and the head cook, forming an unlikely bond.', 'Paul Giamatti,Da\'Vine Joy Randolph,Dominic Sessa', 'Alexander Payne', 'Comedy,Drama', 'English', 7.8, 133, 'R', '2024-02-20', 'https://image.tmdb.org/t/p/w500/VkOIHCd1x16dfJOZc2KU3RXKfc.jpg', 'https://image.tmdb.org/t/p/original/9cBftliS61B2AXmxygOZx6t3EQ4.jpg', '#', 'now_showing', b'0');

-- --------------------------------------------------------
-- Seed: `movie_genres`
-- --------------------------------------------------------
INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(1, 1), (1, 4), (1, 5),          -- Father: Action, Drama, Thriller
(2, 1), (2, 2), (2, 3),          -- Spider-Man: Action, Adventure, Sci-Fi
(3, 3), (3, 2), (3, 4),          -- Dune: Part Two: Sci-Fi, Adventure, Drama
(4, 4), (4, 7), (4, 5),          -- Oppenheimer: Drama, History, Thriller
(5, 6), (5, 4), (5, 8),          -- Poor Things: Comedy, Drama, Romance
(6, 6), (6, 4);                  -- The Holdovers: Comedy, Drama

-- --------------------------------------------------------
-- Seed: `users`
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `first_name`, `last_name`, `email`, `password`, `phone`, `role`, `branch_id`, `loyalty_points`, `membership_tier`, `employee_id`, `access_level`, `avatar_color`) VALUES
(1, 'Alex Carter', 'Alex', 'Carter', 'alex@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-212-555-0199', 'CUSTOMER', NULL, 480, 'Silver', NULL, NULL, '#F5C518'),
(2, 'Jordan Lee', 'Jordan', 'Lee', 'jordan@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-212-555-0198', 'CINEMA_MANAGER', 1, 0, 'Bronze', 'EMP-001', NULL, '#E50914'),
(3, 'Sam Rivera', 'Sam', 'Rivera', 'sam@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-212-555-0197', 'ADMIN', NULL, 0, 'Bronze', NULL, 'SUPER_ADMIN', '#3B82F6'),
(4, 'Taylor Swift', 'Taylor', 'Swift', 'taylor@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-310-555-0196', 'CUSTOMER', NULL, 1450, 'Platinum', NULL, NULL, '#10B981'),
(5, 'Morgan Freeman', 'Morgan', 'Freeman', 'morgan@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-312-555-0195', 'CUSTOMER', NULL, 860, 'Gold', NULL, NULL, '#F97316'),
(6, 'Casey Nguyen', 'Casey', 'Nguyen', 'casey@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-310-555-0194', 'CINEMA_MANAGER', 2, 0, 'Bronze', 'EMP-002', NULL, '#8B5CF6'),
(7, 'Riley Patel', 'Riley', 'Patel', 'riley@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-312-555-0193', 'CUSTOMER', NULL, 120, 'Bronze', NULL, NULL, '#EC4899'),
(8, 'Jamie Chen', 'Jamie', 'Chen', 'jamie@cinebook.com', '$2a$10$7R5h.rQz6WpD7uFwB0HhCOoK2sNq2t9HnS9L1R9z9GzYqM8T1H9jW', '+1-212-555-0192', 'ADMIN', NULL, 0, 'Bronze', NULL, 'BRANCH_AUDITOR', '#06B6D4');

-- --------------------------------------------------------
-- Seed: `showtimes`
-- --------------------------------------------------------
INSERT INTO `showtimes` (`id`, `movie_id`, `branch_id`, `hall_id`, `hall_name`, `date`, `time`, `end_time`, `base_price`, `premium_price`, `booked_seats_csv`, `status`) VALUES
(1, '1', '3', '8', 'Hall C — VIP', '2026-09-17', '1:15 PM', '3:15 PM', 14.99, 22.99, 'D1', 'scheduled'),
(2, '2', '1', '1', 'Hall A — IMAX', '2026-09-17', '7:00 PM', '9:25 PM', 16.99, 26.99, 'F5,F6', 'scheduled'),
(3, '3', '1', '1', 'Hall A — IMAX', '2026-09-18', '7:00 PM', '9:46 PM', 16.99, 26.99, 'F5,F6', 'scheduled'),
(4, '4', '1', '2', 'Hall B — Standard', '2026-09-18', '4:30 PM', '7:30 PM', 12.99, 18.99, 'C3,C4,C5', 'scheduled'),
(5, '5', '3', '7', 'Hall B — Standard', '2026-09-19', '10:00 AM', '12:21 PM', 9.99, 15.99, '', 'scheduled'),
(6, '6', '2', '5', 'Hall B — Standard', '2026-09-19', '1:15 PM', '3:28 PM', 12.99, 18.99, '', 'scheduled');

-- --------------------------------------------------------
-- Seed: `bookings`
-- --------------------------------------------------------
INSERT INTO `bookings` (`id`, `booking_ref`, `user_id`, `movie_id`, `movie_title`, `movie_poster`, `branch_id`, `branch_name`, `hall_name`, `showtime_id`, `date`, `time`, `seats_csv`, `total_amount`, `status`, `refund_status`, `refund_amount`, `rescheduled_from`, `payment_method`, `payment_status`, `created_at`) VALUES
(1, 'CB-491988', '1', '1', 'Father', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiI1ovaeBvm75ctwrmOHOZDDL2x73_Z1q5YoKainzUORqr3jxZmRAMzVQ_&s=10', '3', 'CineBook Lakeside', 'Hall C — VIP', '1', '2026-09-17', '1:15 PM', 'D1', 26.44, 'confirmed', 'none', NULL, NULL, 'card', 'paid', '2026-09-16 13:28:14.909084'),
(2, 'CB-849201', '1', '3', 'Dune: Part Two', 'https://image.tmdb.org/t/p/w500/1pdfLvkbL972k74zp9rnm7Oipsn.jpg', '1', 'CineBook Downtown', 'Hall A — IMAX', '3', '2026-09-18', '7:00 PM', 'F5,F6', 33.98, 'confirmed', 'none', NULL, NULL, 'card', 'paid', '2026-09-16 14:10:00.000000'),
(3, 'CB-103982', '1', '4', 'Oppenheimer', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykQ5L8kR6qVr3.jpg', '1', 'CineBook Downtown', 'Hall B — Standard', '4', '2026-09-18', '4:30 PM', 'C3,C4,C5', 44.97, 'cancelled', 'processed', 44.97, NULL, 'card', 'refunded', '2026-09-15 10:30:00.000000');

-- --------------------------------------------------------
-- Seed: `booked_seats`
-- --------------------------------------------------------
INSERT INTO `booked_seats` (`booking_id`, `seat_id`, `seat_code`, `price_charged`, `seat_status`) VALUES
(1, 23, 'D1', 26.44, 'confirmed'),
(2, 10, 'F5', 16.99, 'confirmed'),
(2, 11, 'F6', 16.99, 'confirmed'),
(3, 16, 'C3', 14.99, 'cancelled'),
(3, 17, 'C4', 14.99, 'cancelled'),
(3, 18, 'C5', 14.99, 'cancelled');

-- --------------------------------------------------------
-- Seed: `payments`
-- --------------------------------------------------------
INSERT INTO `payments` (`id`, `booking_id`, `amount`, `method`, `status`, `gateway_ref`, `qr_code`, `check_in_status`, `transaction_data`) VALUES
(1, 1, 26.44, 'CARD', 'SUCCESS', 'PAY-STRIPE-491988-LK', 'CB-QR-491988', 'NOT_CHECKED_IN', '{\"cardBrand\":\"VISA\",\"last4\":\"4242\",\"receiptUrl\":\"#\"}'),
(2, 2, 33.98, 'CARD', 'SUCCESS', 'PAY-STRIPE-849201-US', 'CB-QR-849201', 'NOT_CHECKED_IN', '{\"cardBrand\":\"MASTERCARD\",\"last4\":\"5555\",\"receiptUrl\":\"#\"}'),
(3, 3, 44.97, 'CARD', 'REFUNDED', 'PAY-STRIPE-103982-RF', 'CB-QR-103982', 'NOT_CHECKED_IN', '{\"cardBrand\":\"VISA\",\"last4\":\"4242\",\"refundRef\":\"RF-99182\"}');

-- --------------------------------------------------------
-- Seed: `refunds`
-- --------------------------------------------------------
INSERT INTO `refunds` (`id`, `booking_id`, `refund_amount`, `request_date`, `processed_data`, `status`, `reason`, `deduction_amount`) VALUES
(1, 3, 44.97, '2026-09-15 11:15:00', '{\"refundId\":\"re_3Nq2t9HnS9L1R9z9GzYq\",\"processedBy\":\"Jordan Lee\",\"tier\":\"FULL_REFUND\"}', 'PROCESSED', 'Customer requested cancellation 48h before showtime', 0.00);

-- --------------------------------------------------------
-- Seed: `promotions`
-- --------------------------------------------------------
INSERT INTO `promotions` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_spend`, `valid_from`, `valid_until`, `usage_limit`, `times_used`, `active`) VALUES
(1, 'CINE20', '20% off all ticket bookings over $30', 'percentage', 20, 30, '2026-01-01 00:00:00', '2026-12-31', 500, 42, b'1'),
(2, 'SLIIT5', '$5 flat discount for SLIIT Students', 'flat', 5, 15, '2026-01-01 00:00:00', '2026-12-31', 1000, 158, b'1'),
(3, 'WEEKEND10', '10% discount on weekend family passes', 'percentage', 10, 40, '2026-01-01 00:00:00', '2026-10-31', 200, 18, b'1');

-- --------------------------------------------------------
-- Seed: `reviews`
-- --------------------------------------------------------
INSERT INTO `reviews` (`id`, `movie_id`, `user_id`, `user_name`, `rating`, `comment`, `review_date`, `moderation_status`) VALUES
(1, 1, 1, 'Alex Carter', 5, 'An outstanding masterpiece of Sri Lankan cinema! Powerful storytelling and stellar performances.', '2026-09-16 18:30:00', 'APPROVED'),
(2, 2, 4, 'Taylor Swift', 4, 'Great start for the new Spider-Man saga. The darker, more grounded tone really worked well!', '2026-09-16 20:45:00', 'APPROVED'),
(3, 3, 1, 'Alex Carter', 5, 'An absolute masterpiece of cinema. The visual fidelity, Hans Zimmer score, and Denis Villeneuve direction are perfection.', '2026-03-05 12:00:00', 'APPROVED'),
(4, 4, 1, 'Alex Carter', 5, 'Cillian Murphy gives the performance of a lifetime. The sound design in the Trinity test scene was hauntingly brilliant.', '2026-02-20 15:30:00', 'APPROVED');

-- --------------------------------------------------------
-- Seed: `wishlist_items`
-- --------------------------------------------------------
INSERT INTO `wishlist_items` (`user_id`, `movie_id`, `date_added`) VALUES
(1, 2, '2026-09-15 09:12:00'),
(1, 5, '2026-09-16 11:45:00'),
(4, 1, '2026-09-16 14:20:00');

-- --------------------------------------------------------
-- Seed: `waitlists`
-- --------------------------------------------------------
INSERT INTO `waitlists` (`showtime_id`, `user_id`, `user_name`, `user_email`, `seats_requested`, `status`) VALUES
(2, 7, 'Riley Patel', 'riley@cinebook.com', 2, 'WAITING'),
(3, 5, 'Morgan Freeman', 'morgan@cinebook.com', 4, 'WAITING');

-- --------------------------------------------------------
-- Seed: `loyalty_vouchers`
-- --------------------------------------------------------
INSERT INTO `loyalty_vouchers` (`id`, `user_id`, `code`, `title`, `points_cost`, `status`, `redeemed_at`, `expires_at`) VALUES
(1, 1, 'VOUCH-5OFF-8491', '$5 Off Next Booking', 150, 'ACTIVE', '2026-09-16 12:00:00', '2026-12-31 23:59:59'),
(2, 4, 'VOUCH-POPCORN-9923', 'Free Large Popcorn & Soda', 200, 'ACTIVE', '2026-09-15 15:30:00', '2026-12-31 23:59:59');

-- --------------------------------------------------------
-- Seed: `notifications`
-- --------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `audience`, `audience_target`, `created_by`, `status`, `is_read`, `created_at`) VALUES
(1, 1, 'booking_confirmation', 'Booking Confirmed', 'Your booking for Father at CineBook Lakeside has been confirmed. Seat: D1.', '/ticket/CB-491988', 'all', NULL, 3, 'sent', b'0', '2026-09-16 13:28:15'),
(2, 1, 'booking_confirmation', 'Booking Confirmed', 'Your booking for Dune: Part Two at CineBook Downtown has been confirmed. 2 seats: F5, F6.', '/ticket/CB-849201', 'all', NULL, 3, 'sent', b'0', '2026-09-16 14:10:00'),
(3, 1, 'cancellation_refund', 'Refund Processed', 'Your refund of $44.97 for Oppenheimer has been processed to your original payment method.', NULL, 'all', NULL, 2, 'sent', b'1', '2026-09-15 11:20:00'),
(4, 1, 'system_announcement', 'Welcome to CineBook', 'Thank you for joining CineBook! Enjoy premium cinema booking with IMAX, Dolby Atmos, and VIP recliner halls.', NULL, 'all', NULL, 3, 'sent', b'1', '2026-09-10 08:00:00'),
(5, 2, 'new_booking', 'New Booking Alert', 'New booking for Dune: Part Two at CineBook Downtown, Hall A — IMAX. 2 seats booked.', NULL, 'branch', '1', 3, 'sent', b'0', '2026-09-16 14:11:00'),
(6, 2, 'low_availability', 'Low Seat Availability', 'Hall A — IMAX, 7:00 PM show is 90% booked. Only 6 seats remaining.', NULL, 'branch', '1', 3, 'sent', b'0', '2026-09-16 15:00:00'),
(7, 3, 'revenue_milestone', 'Revenue Milestone Reached', 'CineBook Downtown has crossed $50,000 in monthly revenue. Great work!', NULL, 'role', 'ADMIN', 3, 'sent', b'0', '2026-09-16 12:00:00'),
(8, 1, 'price_alert', 'Price Drop Alert', 'Tickets for Poor Things at CineBook Lakeside are now $9.99. Limited time offer!', '/movies/5', 'all', NULL, 3, 'sent', b'0', '2026-09-16 09:00:00');

-- --------------------------------------------------------
-- Seed: `notification_templates`
-- --------------------------------------------------------
INSERT INTO `notification_templates` (`id`, `type`, `title`, `message`) VALUES
(1, 'booking_confirmation', 'Booking Confirmed', 'Your booking for {{movie}} at {{branch}} has been confirmed. {{seats}} seats: {{seatList}}.'),
(2, 'cancellation_refund', 'Booking Cancelled', 'Your booking for {{movie}} has been cancelled. A refund of {{amount}} will be processed.'),
(3, 'showtime_reminder', 'Showtime Reminder', 'Reminder: {{movie}} is {{timeHint}} at {{branch}}, {{hall}}.'),
(4, 'price_alert', 'Price Drop Alert', 'Tickets for {{movie}} at {{branch}} are now {{price}}. Limited time offer!'),
(5, 'system_announcement', 'System Announcement', '{{message}}'),
(6, 'low_availability', 'Low Seat Availability', '{{hall}}, {{time}} show is {{percent}}% booked. Only {{remaining}} seats remaining.');

-- ========================================================
-- RE-ENABLE FOREIGN KEY CONSTRAINTS AND COMMIT
-- ========================================================
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
