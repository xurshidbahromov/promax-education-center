-- Create a new storage bucket for course/subject images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to read course images
CREATE POLICY "Course images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-images' );

-- Policy to allow authenticated admins and teachers to upload course images
CREATE POLICY "Admins and teachers can upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-images' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
);

-- Policy to allow authenticated admins and teachers to update course images
CREATE POLICY "Admins and teachers can update course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'course-images' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
);

-- Policy to allow authenticated admins and teachers to delete course images
CREATE POLICY "Admins and teachers can delete course images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'course-images' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
);
