-- Function to calculate and update coins
CREATE OR REPLACE FUNCTION public.sync_student_coins()
RETURNS TRIGGER AS $$
DECLARE
    target_student_id UUID;
    total_score_val INTEGER;
    new_coins INTEGER;
BEGIN
    -- Determine student_id based on operation
    IF (TG_OP = 'DELETE') THEN
        target_student_id := OLD.student_id;
    ELSE
        target_student_id := NEW.student_id;
    END IF;

    -- Calculate total score from 'results' (DTM tests)
    SELECT COALESCE(SUM(total_score), 0)
    INTO total_score_val
    FROM public.results
    WHERE student_id = target_student_id;

    -- Add score from 'test_attempts' (Online tests) where status is completed
    total_score_val := total_score_val + (
        SELECT COALESCE(SUM(score), 0)
        FROM public.test_attempts
        WHERE student_id = target_student_id AND status = 'completed'
    );

    -- Calculate coins (1 coin per 10 points)
    new_coins := FLOOR(total_score_val / 10);

    -- Update profiles table
    UPDATE public.profiles
    SET coins = new_coins
    WHERE id = target_student_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for 'results'
DROP TRIGGER IF EXISTS on_results_update_coins ON public.results;
CREATE TRIGGER on_results_update_coins
AFTER INSERT OR UPDATE OR DELETE ON public.results
FOR EACH ROW EXECUTE FUNCTION public.sync_student_coins();

-- Triggers for 'test_attempts'
DROP TRIGGER IF EXISTS on_test_attempts_update_coins ON public.test_attempts;
CREATE TRIGGER on_test_attempts_update_coins
AFTER INSERT OR UPDATE OR DELETE ON public.test_attempts
FOR EACH ROW EXECUTE FUNCTION public.sync_student_coins();

-- One-time sync for existing users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles WHERE role = 'student' LOOP
        UPDATE public.profiles
        SET coins = FLOOR((
            (SELECT COALESCE(SUM(total_score), 0) FROM public.results WHERE student_id = r.id) +
            (SELECT COALESCE(SUM(score), 0) FROM public.test_attempts WHERE student_id = r.id AND status = 'completed')
        ) / 10)
        WHERE id = r.id;
    END LOOP;
END $$;
