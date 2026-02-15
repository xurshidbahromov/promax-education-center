-- Secure Admin Dashboard Stats Function (Aligned with Payment Page Logic)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_students BIGINT,
    active_teachers BIGINT,
    total_tests BIGINT,
    monthly_revenue TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_count BIGINT;
    teacher_count BIGINT;
    test_count BIGINT;
    revenue_amount DECIMAL(10, 2);
    current_month INTEGER;
    current_year INTEGER;
BEGIN
    -- Count Students
    SELECT COUNT(*) INTO student_count
    FROM public.profiles
    WHERE role = 'student';

    -- Count Teachers
    SELECT COUNT(*) INTO teacher_count
    FROM public.profiles
    WHERE role = 'teacher';

    -- Count Tests (Available Tests)
    SELECT COUNT(*) INTO test_count
    FROM public.tests;

    -- Calculate Monthly Revenue (Aligned with getMonthlyRevenue in payments.ts)
    -- Uses payment_month and payment_year columns instead of created_at
    current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

    SELECT COALESCE(SUM(amount), 0) INTO revenue_amount
    FROM public.payment_transactions
    WHERE payment_month = current_month
    AND payment_year = current_year;

    -- Return single row
    RETURN QUERY SELECT 
        student_count, 
        teacher_count, 
        test_count,
        revenue_amount::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
