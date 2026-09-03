-- Store Rating Platform - Seed Data
-- All passwords are: Password@1 (bcrypt hashed)
-- $2b$10$AkjDWbn1BBnWehDbOXCSxuyfxUHsqYIhoTD2g5OFCZhXvChGhXlvq

-- Clear existing data
TRUNCATE ratings, stores, users RESTART IDENTITY CASCADE;

-- Insert Users
-- Password for all users: Password@1
INSERT INTO users (name, email, password_hash, address, role) VALUES
('Administrator Of Platform', 'admin@example.com', '$2b$10$AkjDWbn1BBnWehDbOXCSxuyfxUHsqYIhoTD2g5OFCZhXvChGhXlvq', '123 Admin Street, Mumbai, Maharashtra', 'ADMIN'),
('Normal User One Testing', 'user1@example.com', '$2b$10$AkjDWbn1BBnWehDbOXCSxuyfxUHsqYIhoTD2g5OFCZhXvChGhXlvq', '456 User Lane, Pune, Maharashtra', 'NORMAL_USER'),
('Normal User Two Testing', 'user2@example.com', '$2b$10$AkjDWbn1BBnWehDbOXCSxuyfxUHsqYIhoTD2g5OFCZhXvChGhXlvq', '789 Another Road, Delhi, India', 'NORMAL_USER'),
('Store Owner One Testing', 'owner@example.com', '$2b$10$AkjDWbn1BBnWehDbOXCSxuyfxUHsqYIhoTD2g5OFCZhXvChGhXlvq', '101 Owner Blvd, Bangalore, Karnataka', 'STORE_OWNER');

-- Insert Store (linked to store owner, id=4)
INSERT INTO stores (name, email, address, owner_id) VALUES
('ABC Store For Rating Test', 'abcstore@example.com', 'Pune, Maharashtra, India', 4);

-- Insert Ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES
(2, 1, 5),  -- user1 rates store1: 5
(3, 1, 4);  -- user2 rates store1: 4
