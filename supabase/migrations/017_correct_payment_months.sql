-- Data Correction: Update all payments to current month/year
-- User indicated all payments should be in the current month (February)

UPDATE public.payment_transactions
SET 
    payment_month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    payment_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
WHERE 
    payment_year = 2026; -- Safety filter just in case
