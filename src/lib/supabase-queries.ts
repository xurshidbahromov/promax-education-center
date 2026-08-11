// Supabase Query Functions for Dashboard
// Centralized data fetching logic

import { createClient } from '@/utils/supabase/client';

export interface ExamResult {
 id: string;
 exam_id: string;
 student_id: string;
 total_score: number;
 compulsory_math_score: number | null;
 compulsory_history_score: number | null;
 compulsory_lang_score: number | null;
 subject_1_score: number | null;
 subject_2_score: number | null;
 created_at: string;
 exam?: {
 title: string;
 date: string;
 type: string;
 max_score: number;
 };
 direction?: {
 title: string;
 code: string;
 };
}

export interface Exam {
 id: string;
 title: string;
 date: string;
 max_score: number;
 type: 'dtm' | 'quiz' | 'topic';
 status: 'upcoming' | 'active' | 'finished';
 created_at: string;
}

export interface DashboardStats {
 totalTests: number;
 averageScore: number;
 bestScore: number;
 totalCoins: number;
}

/**
 * Get student's exam results with related data
 */
export async function getStudentResults(studentId: string): Promise<ExamResult[]> {
  const supabase = createClient();

  // 1. Get DTM results
  const { data: results } = await supabase
    .from('results')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  // 2. Get completed online test attempts
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('id, student_id, test_id, score, max_score, completed_at, created_at, test:tests(id, title)')
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  // 3. Map DTM exams
  const examIds = [...new Set((results || []).map(r => r.exam_id).filter(Boolean))];
  let examsMap: Record<string, ExamResult['exam']> = {};
  if (examIds.length > 0) {
    const { data: exams } = await supabase
      .from('exams')
      .select('id, title, date, type, max_score')
      .in('id', examIds);
    if (exams) {
      exams.forEach(e => { examsMap[e.id] = e; });
    }
  }

  // 4. Map DTM directions
  const dirIds = [...new Set((results || []).map(r => r.direction_id).filter(Boolean))];
  let directionsMap: Record<string, ExamResult['direction']> = {};
  if (dirIds.length > 0) {
    const { data: directions } = await supabase
      .from('directions')
      .select('id, title, code')
      .in('id', dirIds);
    if (directions) {
      directions.forEach(d => { directionsMap[d.id] = d; });
    }
  }

  const dtmResults = (results || []).map(r => ({
    ...r,
    exam: r.exam_id ? examsMap[r.exam_id] : undefined,
    direction: r.direction_id ? directionsMap[r.direction_id] : undefined,
  }));

  const onlineTestResults = (attempts || []).map((a: any) => ({
    id: a.id,
    student_id: a.student_id,
    exam_id: a.test_id,
    direction_id: null,
    total_score: a.score,
    created_at: a.completed_at || a.created_at,
    exam: {
      id: a.test?.id || a.test_id,
      title: a.test?.title || 'Online Test',
      date: a.completed_at || a.created_at,
      type: 'quiz',
      max_score: a.max_score || 100
    }
  }));

  const combined = [...dtmResults, ...onlineTestResults];
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return combined;
}


/**
 * Get a specific exam result by its ID
 */
export async function getExamResultById(resultId: string): Promise<ExamResult | null> {
 const supabase = createClient();

 // Step 1: Get the result row itself (no joins — avoids FK resolution errors)
 // Use .maybeSingle() — returns null (not error) when 0 rows found
 const { data: result, error } = await supabase
 .from('results')
 .select('*')
 .eq('id', resultId)
 .maybeSingle();

 if (error) {
 console.error('Error fetching exam result:', error.message, JSON.stringify(error));
 return null;

 }

 if (!result) return null;

 // Step 2: Try to get exam data separately (graceful fallback if table/FK missing)
 let examData: ExamResult['exam'] | undefined;
 if (result.exam_id) {
   const { data: exam } = await supabase
     .from('exams')
     .select('title, date, type, max_score')
     .eq('id', result.exam_id)
     .single();
   if (exam) examData = exam;
 }

 // Step 3: Try to get direction data separately (graceful fallback)
 let directionData: ExamResult['direction'] | undefined;
 if (result.direction_id) {
   const { data: direction } = await supabase
     .from('directions')
     .select('title, code')
     .eq('id', result.direction_id)
     .single();
   if (direction) directionData = direction;
 }

 return {
   ...result,
   exam: examData,
   direction: directionData,
 };
}


/**
 * Get available exams (for tests page)
 */
export async function getAvailableExams(): Promise<Exam[]> {
 const supabase = createClient();

 const { data, error } = await supabase
 .from('exams')
 .select('*')
 .in('status', ['active', 'upcoming'])
 .order('date', { ascending: true });

 if (error) {
 console.error('Error fetching exams:', error);
 return [];
 }

 return data || [];
}

/**
 * Get dashboard statistics for a student
 */
export async function getDashboardStats(studentId: string): Promise<DashboardStats> {
 const supabase = createClient();

 const { data: results, error } = await supabase
 .from('results')
 .select('total_score')
 .eq('student_id', studentId);

 const { data: attempts, error: attemptsError } = await supabase
 .from('test_attempts')
 .select('score')
 .eq('student_id', studentId)
 .eq('status', 'completed');

 if (error && attemptsError) {
 return {
 totalTests: 0,
 averageScore: 0,
 bestScore: 0,
 totalCoins: 0
 };
 }

 const resultScores = results?.map(r => r.total_score) || [];
 const attemptScores = attempts?.map(a => a.score) || [];
 const allScores = [...resultScores, ...attemptScores];

  // Fetch profile coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', studentId)
    .maybeSingle();

  if (allScores.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalCoins: profile?.coins || 0
    };
  }

  const totalTests = allScores.length;
  const averageScore = allScores.reduce((a, b) => a + b, 0) / totalTests;
  const bestScore = Math.max(...allScores);

  // Coins from profile or calculated
  const totalCoins = profile?.coins !== undefined && profile?.coins !== null
    ? profile.coins
    : Math.floor(allScores.reduce((a, b) => a + b, 0) / 10);

  return {
    totalTests,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore,
    totalCoins
  };
}

/**
 * Get recent 5 results for chart
 */
export async function getRecentResultsForChart(studentId: string) {
 const supabase = createClient();

 // Fetch DTM results
 const { data: results } = await supabase
 .from('results')
 .select(`
 total_score,
 created_at,
 exam:exams (title)
 `)
 .eq('student_id', studentId)
 .order('created_at', { ascending: false })
 .limit(5);

 // Fetch Online Test attempts
 const { data: attempts } = await supabase
 .from('test_attempts')
 .select(`
 score,
 completed_at,
 test:tests (title)
 `)
 .eq('student_id', studentId)
 .eq('status', 'completed')
 .order('completed_at', { ascending: false })
 .limit(5);

 // Combine and sort
 const combined = [
 ...((results as any[])?.map(r => ({
 score: r.total_score,
 date: new Date(r.created_at),
 title: Array.isArray(r.exam) ? r.exam[0]?.title : r.exam?.title
 })) || []),
 ...((attempts as any[])?.map(a => ({
 score: a.score,
 date: new Date(a.completed_at),
 title: Array.isArray(a.test) ? a.test[0]?.title : a.test?.title
 })) || [])
 ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

 // Reverse to show oldest to newest in chart
 return combined.reverse().map((result: any) => {
 const day = result.date.getDate().toString().padStart(2, '0');
 const month = (result.date.getMonth()+ 1).toString().padStart(2, '0');

 return {
 date: `${day}.${month}`,
 score: result.score,
 examTitle: result.title || 'Unknown'
 };
 });
}

/**
 * Get student's recent activity (e.g. completed tests)
 */
export async function getStudentActivity(studentId: string) {
 const supabase = createClient();

 // Fetch DTM results
 const { data: results } = await supabase
 .from('results')
 .select(`
 id,
 total_score,
 created_at,
 exam:exams (title, max_score)
 `)
 .eq('student_id', studentId)
 .order('created_at', { ascending: false })
 .limit(10);

 // Fetch Online Test attempts
 const { data: attempts } = await supabase
 .from('test_attempts')
 .select(`
 id,
 score,
 max_score,
 completed_at,
 test:tests (title)
 `)
 .eq('student_id', studentId)
 .eq('status', 'completed')
 .order('completed_at', { ascending: false })
 .limit(10);

 // Combine and sort
 const combined = [
 ...((results as any[])?.map(r => ({
 id: r.id,
 title: Array.isArray(r.exam) ? r.exam[0]?.title : r.exam?.title || 'Unknown Exam',
 score: r.total_score,
 maxScore: (Array.isArray(r.exam) ? r.exam[0]?.max_score : r.exam?.max_score) || 189,
 date: r.created_at,
 type: 'result'
 })) || []),
 ...((attempts as any[])?.map(a => ({
 id: a.id,
 title: Array.isArray(a.test) ? a.test[0]?.title : a.test?.title || 'Online Test',
 score: a.score,
 maxScore: a.max_score,
 date: a.completed_at,
 type: 'test'
 })) || [])
 ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

 return combined;
}

/**
 * Update user coins
 */
export async function updateUserCoins(userId: string, amount: number) {
 const supabase = createClient();

 // 1. Get current coins
 const { data: profile, error: fetchError } = await supabase
 .from('profiles')
 .select('coins')
 .eq('id', userId)
 .single();

 if (fetchError) {
 console.error('Error fetching coins:', fetchError);
 return { success: false, error: fetchError };
 }

 const currentCoins = profile?.coins || 0;
 const newBalance = currentCoins+ amount;

 // 2. Update coins
 const { error: updateError } = await supabase
 .from('profiles')
 .update({ coins: newBalance })
 .eq('id', userId);

 if (updateError) {
 console.error('Error updating coins:', updateError);
 return { success: false, error: updateError };
 }

 return { success: true, newBalance };
}

/**
 * Get leaderboard (top students by coins)
 */
export async function getLeaderboard(limit: number = 1000) {
 const supabase = createClient();

 const { data, error } = await supabase
 .rpc('get_leaderboard_data', { limit_count: limit });

 if (error) {
 console.error('Error fetching leaderboard:', error);
 return [];
 }

 return (data as any[]).map((user, index) => ({
 id: user.id,
 name: user.full_name,
 points: user.coins,
 rank: user.rank,
 avatar: user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : "👤"
 }));
}

/**
 * Get specific user rank and stats
 */
export async function getUserRank(userId: string) {
 const supabase = createClient();

 // 1. Get user basic info first (name, role) - RLS allows reading own profile
 const { data: user, error } = await supabase
 .from('profiles')
 .select('full_name, role, coins') // Get coins here as fallback/display
 .eq('id', userId)
 .single();

 if (error || !user) return null;

 // If admin/teacher, mock a rank for display purposes
 if (user.role !== 'student') {
 return {
 id: userId,
 name: user.full_name || 'User',
 points: user.coins || 0,
 rank: 0, // Special indicator
 avatar: "🛡️"
 };
 }

 // 2. Get secure rank from RPC
 const { data: rankData, error: rankError } = await supabase
 .rpc('get_student_rank', { target_student_id: userId })
 .single();

 if (rankError) {
 console.error("Error fetching rank:", rankError);
 // Fallback to basic data
 return {
 id: userId,
 name: user.full_name || 'Student',
 points: user.coins || 0,
 rank: 0,
 avatar: "👤"
 };
 }

 const rank = Number((rankData as any)?.rank) || 0;
 const points = (rankData as any)?.coins ?? user.coins ?? 0;

 return {
 id: userId,
 name: user.full_name || 'Student',
 points: points,
 rank,
 avatar: rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "👤"
 };
}

/**
 * Notification System Queries
 */
export async function getNotifications(limit: number = 20) {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return [];

 const { data, error } = await supabase
 .from('notifications')
 .select('*')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false })
 .limit(limit);

 if (error) {
 console.error('Error fetching notifications:', error);
 return [];
 }
 return data;
}

export async function getUnreadNotificationCount() {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return 0;

 const { count, error } = await supabase
 .from('notifications')
 .select('*', { count: 'exact', head: true })
 .eq('user_id', user.id)
 .eq('is_read', false);

 if (error) return 0;
 return count || 0;
}

export async function markNotificationAsRead(id: string) {
 const supabase = createClient();
 const { error } = await supabase
 .from('notifications')
 .update({ is_read: true })
 .eq('id', id);

 return !error;
}

export async function markAllNotificationsAsRead() {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return false;

 const { error } = await supabase
 .from('notifications')
 .update({ is_read: true })
 .eq('user_id', user.id)
 .eq('is_read', false);

 return !error;
}

export async function getAnnouncements(limit: number = 5) {
 const supabase = createClient();
 const { data, error } = await supabase
 .from('announcements')
 .select('*')
 .eq('is_active', true)
 .or('target_audience.eq.all,target_audience.eq.students')
 .order('created_at', { ascending: false })
 .order('priority', { ascending: false })
 .limit(limit);

 if (error) {
 console.error('Error fetching announcements:', error);
 return [];
 }
 return data;
}

export interface Subject {
 id: string;
 title: string;
 description: string;
 cover_image: string;
 created_at: string;
}

export interface Lesson {
 id: string;
 subject_id: string;
 title: string;
 description: string;
 order_num: number;
 created_at: string;
}

export interface Material {
 id: string;
 lesson_id: string;
 title: string;
 type: 'video' | 'pdf' | 'text' | 'link';
 url: string;
 content?: string;
 created_at: string;
}

export async function getSubjects(): Promise<Subject[]> {
 const supabase = createClient();
 const { data, error } = await supabase
 .from('subjects')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) {
 console.error('Error fetching subjects:', error);
 return [];
 }
 return data || [];
}

export async function getSubjectById(id: string): Promise<Subject | null> {
 const supabase = createClient();
 const { data, error } = await supabase
 .from('subjects')
 .select('*')
 .eq('id', id)
 .single();

 if (error) {
 console.error('Error fetching subject:', error);
 return null;
 }
 return data;
}

export async function getLessonsBySubjectId(subjectId: string): Promise<Lesson[]> {
 const supabase = createClient();
 const { data, error } = await supabase
 .from('lessons')
 .select('*')
 .eq('subject_id', subjectId)
 .order('order_num', { ascending: true });

 if (error) {
 console.error('Error fetching lessons:', error);
 return [];
 }
 return data || [];
}

export async function getLessonById(id: string): Promise<Lesson | null> {
 const supabase = createClient();
 const { data, error } = await supabase
 .from('lessons')
 .select('*')
 .eq('id', id)
 .single();

 if (error) {
 console.error('Error fetching lesson:', error);
 return null;
 }
 return data;
}

export async function getMaterialsByLessonId(lessonId: string): Promise<Material[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data || [];
}

// -------------------------------------------------------------
// PROMAX COIN SHOP FUNCTIONS
// -------------------------------------------------------------

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  price_coins: number;
  category: 'merch' | 'exam' | 'discount' | 'gadget';
  image_url?: string;
  stock: number;
  is_active: boolean;
  created_at?: string;
}

export interface ShopOrder {
  id: string;
  student_id: string;
  item_id: string;
  coins_spent: number;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  item?: ShopItem;
  student?: { full_name: string; phone?: string };
}

export const defaultShopItems: ShopItem[] = [
  {
    id: 'item-1',
    title: "Promax Brended Futbolka",
    description: "Paxtadan tikilgan, sifatli va qulay Promax Education rasmiy futbolkasi.",
    price_coins: 500,
    category: 'merch',
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    stock: 12,
    is_active: true
  },
  {
    id: 'item-2',
    title: "Mock Exam Bepul Chipta",
    description: "Navbatdagi har qanday haftalik MOCK DTM imtihonida tekin qatnashish chiptasi.",
    price_coins: 250,
    category: 'exam',
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80",
    stock: 50,
    is_active: true
  },
  {
    id: 'item-3',
    title: "Branded Bloknot va Ruchka",
    description: "Darslarda qeydlar olib borish uchun zamonaviy Promax kundaligi va ruchkasi.",
    price_coins: 150,
    category: 'merch',
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    stock: 25,
    is_active: true
  },
  {
    id: 'item-4',
    title: "Promax Stikerlar To'plami",
    description: "Noutbuk va telefonlar uchun 15 ta eksklyuziv ilmiy va motivatsion stikerlar.",
    price_coins: 80,
    category: 'merch',
    image_url: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=500&auto=format&fit=crop&q=80",
    stock: 100,
    is_active: true
  },
  {
    id: 'item-5',
    title: "Oylik To'lov uchun 20% Chegirma",
    description: "Keyingi oy to'lovi uchun maxsus 20 foizli vaucher.",
    price_coins: 1200,
    category: 'discount',
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    stock: 5,
    is_active: true
  },
  {
    id: 'item-6',
    title: "Promax Thermos Idishi",
    description: "Issiq va sovuq ichimliklarni 12 soat saqlaydigan metall termos idish.",
    price_coins: 750,
    category: 'gadget',
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
    stock: 8,
    is_active: true
  }
];

export async function getShopItems(): Promise<ShopItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return defaultShopItems;
  }
  return data;
}

export async function purchaseShopItem(studentId: string, item: ShopItem): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 1. Get student profile & coins balance
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', studentId)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: "Profil topilmadi" };
  }

  const currentCoins = profile.coins || 0;
  if (currentCoins < item.price_coins) {
    return { success: false, error: `Tangalaringiz yetarli emas! Sizda ${currentCoins} tanga bor, sovg'a narxi ${item.price_coins} tanga.` };
  }

  // 2. Deduct coins
  const newBalance = currentCoins - item.price_coins;
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ coins: newBalance })
    .eq('id', studentId);

  if (updateErr) {
    return { success: false, error: "Tangani ayirishda xatolik" };
  }

  // 3. Create order row (if table exists)
  try {
    await supabase.from('shop_orders').insert({
      student_id: studentId,
      item_id: item.id.startsWith('item-') ? null : item.id,
      coins_spent: item.price_coins,
      status: 'pending',
      notes: `Sovg'a: ${item.title}`
    });

    // Reduce stock if DB item
    if (!item.id.startsWith('item-')) {
      await supabase.from('shop_items').update({ stock: Math.max(0, item.stock - 1) }).eq('id', item.id);
    }
  } catch (err) {
    console.error("Order creation fallback:", err);
  }

  return { success: true };
}

export async function getStudentOrders(studentId: string): Promise<ShopOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, item:shop_items(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function adminGetShopOrders(): Promise<ShopOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, item:shop_items(*), student:profiles!student_id(full_name, phone)')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function adminUpdateOrderStatus(orderId: string, status: 'delivered' | 'cancelled', studentId?: string, coinsSpent?: number): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('shop_orders')
    .update({ status })
    .eq('id', orderId);

  if (error) return { success: false };

  // Refund coins if order was cancelled
  if (status === 'cancelled' && studentId && coinsSpent) {
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', studentId).single();
    if (profile) {
      await supabase.from('profiles').update({ coins: (profile.coins || 0) + coinsSpent }).eq('id', studentId);
    }
  }

  return { success: true };
}

export async function adminUpdateShopItem(itemId: string, updates: Partial<ShopItem>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // If mock item with string ID like 'item-1', insert as new DB item
  if (itemId.startsWith('item-')) {
    const { error } = await supabase.from('shop_items').insert({
      title: updates.title || "Sovg'a",
      description: updates.description || "",
      price_coins: updates.price_coins || 100,
      stock: updates.stock || 10,
      category: updates.category || "merch",
      image_url: updates.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
      is_active: true
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const { error } = await supabase
    .from('shop_items')
    .update(updates)
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function adminDeleteShopItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  if (itemId.startsWith('item-')) {
    return { success: true };
  }

  const { error } = await supabase
    .from('shop_items')
    .delete()
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
