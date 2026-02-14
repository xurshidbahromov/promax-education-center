-- Student Payment Management System
-- Migration to create tables for course enrollment and payment tracking

-- Table 1: Student Courses (Studentlarni kurslarga yozish)
CREATE TABLE IF NOT EXISTS student_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL, -- 'matematika', 'ingliz_tili', 'fizika', etc.
    monthly_fee DECIMAL(10, 2) NOT NULL, -- Oylik to'lov summasi
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = active, filled = completed/paused
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Payment Transactions (Har bir to'lov)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    student_course_id UUID REFERENCES student_courses(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_month INTEGER NOT NULL CHECK (payment_month >= 1 AND payment_month <= 12),
    payment_year INTEGER NOT NULL CHECK (payment_year >= 2020 AND payment_year <= 2100),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id), -- Admin who recorded payment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Monthly Payment Status (Oylik to'lov holati)
CREATE TABLE IF NOT EXISTS monthly_payment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    student_course_id UUID REFERENCES student_courses(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    required_amount DECIMAL(10, 2) NOT NULL, -- To'lanishi kerak
    paid_amount DECIMAL(10, 2) DEFAULT 0, -- To'langan
    remaining_amount DECIMAL(10, 2) DEFAULT 0, -- Qolgan
    status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'overdue')),
    due_date DATE NOT NULL, -- Oxirgi to'lov sanasi (har oy 5-kun)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_course_id, month, year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_status ON student_courses(status);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON payment_transactions(student_course_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON payment_transactions(payment_year, payment_month);

CREATE INDEX IF NOT EXISTS idx_monthly_status_student ON monthly_payment_status(student_id);
CREATE INDEX IF NOT EXISTS idx_monthly_status_period ON monthly_payment_status(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_status_status ON monthly_payment_status(status);

-- Function: Auto-update monthly_payment_status when payment is added
CREATE OR REPLACE FUNCTION update_monthly_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update paid_amount
    UPDATE monthly_payment_status
    SET 
        paid_amount = paid_amount + NEW.amount,
        remaining_amount = required_amount - (paid_amount + NEW.amount),
        status = CASE
            WHEN (paid_amount + NEW.amount) >= required_amount THEN 'paid'
            WHEN (paid_amount + NEW.amount) > 0 THEN 'partial'
            ELSE status
        END,
        updated_at = NOW()
    WHERE 
        student_course_id = NEW.student_course_id
        AND month = NEW.payment_month
        AND year = NEW.payment_year;
    
    -- If monthly_payment_status doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO monthly_payment_status (
            student_id,
            student_course_id,
            month,
            year,
            required_amount,
            paid_amount,
            remaining_amount,
            status,
            due_date
        )
        SELECT 
            NEW.student_id,
            NEW.student_course_id,
            NEW.payment_month,
            NEW.payment_year,
            sc.monthly_fee,
            NEW.amount,
            sc.monthly_fee - NEW.amount,
            CASE
                WHEN NEW.amount >= sc.monthly_fee THEN 'paid'
                WHEN NEW.amount > 0 THEN 'partial'
                ELSE 'pending'
            END,
            make_date(NEW.payment_year, NEW.payment_month, 5) -- Due date is 5th of each month
        FROM student_courses sc
        WHERE sc.id = NEW.student_course_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update when payment is added
CREATE TRIGGER trigger_update_monthly_status
AFTER INSERT ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_monthly_payment_status();

-- Function: Create monthly_payment_status when student is enrolled in course
CREATE OR REPLACE FUNCTION create_initial_monthly_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Create status for current month
    INSERT INTO monthly_payment_status (
        student_id,
        student_course_id,
        month,
        year,
        required_amount,
        paid_amount,
        remaining_amount,
        status,
        due_date
    ) VALUES (
        NEW.student_id,
        NEW.id,
        EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        NEW.monthly_fee,
        0,
        NEW.monthly_fee,
        'pending',
        make_date(
            EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
            EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
            5
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create initial monthly status when student enrolled
CREATE TRIGGER trigger_create_initial_status
AFTER INSERT ON student_courses
FOR EACH ROW
EXECUTE FUNCTION create_initial_monthly_status();

-- Function: Mark overdue payments (run daily via cron)
CREATE OR REPLACE FUNCTION mark_overdue_payments()
RETURNS void AS $$
BEGIN
    UPDATE monthly_payment_status
    SET 
        status = 'overdue',
        updated_at = NOW()
    WHERE 
        due_date < CURRENT_DATE
        AND status IN ('pending', 'partial')
        AND status != 'paid';
END;
$$ LANGUAGE plpgsql;

-- Comment on tables
COMMENT ON TABLE student_courses IS 'Tracks which courses each student is enrolled in';
COMMENT ON TABLE payment_transactions IS 'Records all payment transactions (can be partial)';
COMMENT ON TABLE monthly_payment_status IS 'Tracks monthly payment status per course';
