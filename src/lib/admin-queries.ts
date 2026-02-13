
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from './profile';

export interface Student extends UserProfile {
    status?: string; // Derived or placeholder
    course?: string; // Derived or placeholder
    joined_at: string;
}

export async function getStudents(searchTerm: string = ""): Promise<Student[]> {
    const supabase = createClient();

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching students:', error);
        return [];
    }

    return data.map(profile => ({
        ...profile,
        joined_at: profile.created_at,
        status: 'Active', // Placeholder until we have real status
        course: 'N/A' // Placeholder until we have courses
    }));
}
