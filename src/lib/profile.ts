
import { createClient } from '@/utils/supabase/client';

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: string;
    email?: string; // From auth.users
    bio?: string | null;
    location?: string | null;
    coins?: number;
    settings?: {
        theme?: string;
        language?: string;
        notifications?: {
            email: boolean;
            push: boolean;
        };
    };
}

export interface UpdateProfileData {
    full_name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    settings?: any;
}

/**
 * Get current user's profile with email
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get profile data
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // If profile is missing (first time login without trigger), return basic auth info
    if (error || !profile) {
        console.warn('Profile not found in DB, returning auth info:', error);
        return {
            id: user.id,
            email: user.email,
            role: 'student', // Default fallback
            full_name: user.user_metadata?.full_name || '',
            phone: user.phone || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            bio: '',
            location: '',
            coins: 0,
            settings: {}
        };
    }

    return {
        ...profile,
        email: user.email,
        bio: profile.bio || '',
        location: profile.location || '',
        coins: profile.coins || 0,
        settings: profile.settings || {}
    };
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<{ success: boolean; error?: any }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'User not found' };

    const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating profile:', updateError);
        return { success: false, error: updateError };
    }

    return { success: true };
}

/**
 * Update specific settings
 */
export async function updateUserSettings(settings: any): Promise<{ success: boolean; error?: any }> {
    return updateUserProfile({ settings });
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
    }

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * Update user password
 */
export async function updatePassword(password: string): Promise<{ success: boolean; error?: any }> {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error('Error updating password:', error);
        return { success: false, error };
    }

    return { success: true };
}
