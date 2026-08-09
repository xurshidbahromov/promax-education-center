-- Migration 024: Reset test profiles and ensure single main Admin account
-- Target main admin phone: +998955137776

-- 1. NULL out non-cascade FK references to profiles first
UPDATE tests SET created_by = NULL WHERE created_by != '276665ec-05e7-4fd5-bedb-84430c6212b8';
UPDATE announcements SET created_by = NULL WHERE created_by != '276665ec-05e7-4fd5-bedb-84430c6212b8';
UPDATE platform_settings SET updated_by = NULL WHERE updated_by != '276665ec-05e7-4fd5-bedb-84430c6212b8';
UPDATE payment_transactions SET created_by = NULL WHERE created_by != '276665ec-05e7-4fd5-bedb-84430c6212b8';

-- 2. Delete transactional child data (correct table names, FK order)
DELETE FROM parent_students;
DELETE FROM group_students;
DELETE FROM question_responses;
DELETE FROM test_attempts;
DELETE FROM payment_transactions;
DELETE FROM monthly_payment_status;
DELETE FROM student_courses;
DELETE FROM notifications;
DELETE FROM tests;
DELETE FROM questions;
DELETE FROM announcements;

-- 3. Finally delete non-admin profiles (cascade will clean student_courses, payment_transactions etc.)
DELETE FROM profiles 
WHERE phone NOT IN ('+998955137776', '+998 95 513 77 76') 
  AND role != 'admin';
