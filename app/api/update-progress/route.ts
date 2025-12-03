import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { applicationId, moduleIndex, isCompleted } = await req.json();

        if (!applicationId || moduleIndex === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Fetch current progress to check status update needs
        const { data: currentProgress, error: fetchError } = await supabase
            .from('user_progress')
            .select('status')
            .eq('application_id', applicationId)
            .single();

        if (fetchError || !currentProgress) {
            return NextResponse.json({ error: "Progress not found" }, { status: 404 });
        }

        // 2. Update the specific module in learning_modules
        // We need to find the module. Since we passed moduleIndex, we need to fetch all modules first to find the ID
        // OR we should change the frontend to pass moduleId.
        // For now, let's fetch all and update by index to keep frontend changes minimal initially, 
        // BUT better to use ID. Let's assume frontend will pass moduleId if available, or we use index as fallback.

        // Fetch modules to find the one to update (if no ID passed) or just to check completion status
        const { data: modules, error: modulesError } = await supabase
            .from('learning_modules')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: true });

        if (modulesError || !modules) {
            return NextResponse.json({ error: "Modules not found" }, { status: 404 });
        }

        const moduleToUpdate = modules[moduleIndex];
        if (!moduleToUpdate) {
            return NextResponse.json({ error: "Module not found at index" }, { status: 404 });
        }

        // Update the module status
        const { error: updateError } = await supabase
            .from('learning_modules')
            .update({ status: isCompleted ? 'completed' : 'pending' })
            .eq('id', moduleToUpdate.id);

        if (updateError) {
            console.error("Error updating module:", updateError);
            return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
        }

        // 3. Check if all completed
        // We need to check if all OTHER modules are also completed
        const allOthersCompleted = modules.every((m, idx) => idx === moduleIndex ? isCompleted : m.status === 'completed');

        if (allOthersCompleted && currentProgress.status !== 'training_completed') {
            await supabase
                .from('user_progress')
                .update({ status: 'training_completed' })
                .eq('application_id', applicationId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
