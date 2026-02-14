-- Create platform_settings table for dynamic system configuration

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB, -- Flexible value storage (string, number, boolean, object)
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'test', 'email', 'payment', 'notification', 'security')),
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and staff can manage settings
CREATE POLICY "Admins manage settings"
    ON platform_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Policy: Specific settings publicly readable (e.g., platform name, contact info)
CREATE POLICY "Public read specific settings"
    ON platform_settings FOR SELECT
    USING (
        category = 'general' -- Only general settings are public
    );
    
-- Insert default settings
INSERT INTO platform_settings (key, value, category, description) VALUES
    ('platform_name', '"Promax Education"', 'general', 'Official name of the platform'),
    ('contact_email', '"info@promax.uz"', 'general', 'Public contact email'),
    ('contact_phone', '"+998 90 123 45 67"', 'general', 'Public contact phone'),
    ('maintenance_mode', 'false', 'general', 'Put site in maintenance mode'),
    
    ('test_duration_default', '60', 'test', 'Default test duration in minutes'),
    ('passing_score_percent', '70', 'test', 'Minimum percentage to pass a test'),
    ('allow_retakes', 'true', 'test', 'Allow students to retake tests'),
    
    ('currency', '"UZS"', 'payment', 'Default currency symbol'),
    ('monthly_fee', '500000', 'payment', 'Standard monthly fee amount'),
    
    ('email_notifications', 'true', 'notification', 'Enable email notifications'),
    ('system_notifications', 'true', 'notification', 'Enable in-app notifications')
ON CONFLICT (key) DO NOTHING;

-- Function to auto-update updated_at timestamp
-- (Reusing existing function if available, or creating/replacing)
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS settings_updated_at ON platform_settings;
CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Grant permissions
GRANT SELECT ON platform_settings TO anon, authenticated;
GRANT ALL ON platform_settings TO service_role;
