import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  if (!applicationId) {
    return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) {
      // If not found, return null or specific status, but 404 is appropriate if we expect it to exist
      // However, for the start page, "not found" might just mean "new user"
      if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
        return NextResponse.json({ status: 'new' });
      }
      console.error("Error fetching user progress:", error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // Fetch learning modules
    const { data: modules, error: modulesError } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (modulesError) {
      console.error("Error fetching learning modules:", modulesError);
    }

    // Combine data
    const responseData = {
      ...data,
      training_modules: modules || []
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Server error fetching user progress:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}