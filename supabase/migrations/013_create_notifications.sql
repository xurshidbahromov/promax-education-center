-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger: Notify on Test Completion
CREATE OR REPLACE FUNCTION public.notify_on_test_completion()
RETURNS TRIGGER AS $$
DECLARE
    test_title TEXT;
    student_profile RECORD;
BEGIN
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        -- Get test title
        SELECT title INTO test_title FROM public.tests WHERE id = NEW.test_id;
        
        -- Insert notification
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.student_id,
            'Test Yakunlandi! 🏆',
            'Siz "' || test_title || '" testini yakunladingiz. Natija: ' || NEW.score || ' ball.',
            'success'
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_test_completed_notify ON public.test_attempts;

CREATE TRIGGER on_test_completed_notify
AFTER UPDATE ON public.test_attempts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_test_completion();
