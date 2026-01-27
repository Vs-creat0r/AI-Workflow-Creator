import { supabase } from './supabase'

export interface DBWorkflow {
    id?: string
    created_at?: string
    prompt: string
    workflow_json: any
    name?: string
    user_id?: string
    session_id?: string
}

export interface DBChatMessage {
    id?: string
    created_at?: string
    role: 'user' | 'assistant'
    content: string
    is_error?: boolean
    session_id: string
    user_id?: string
    workflow_json?: any
}

// Workflows
export async function saveWorkflowToDB(data: DBWorkflow) {
    try {
        const { error } = await supabase
            .from('workflows')
            .insert([data])

        if (error) throw error
        return { success: true, error: null }
    } catch (err: any) {
        console.error("Error saving workflow to DB:", err)
        return { success: false, error: err.message || "Unknown error saving to DB" }
    }
}

export async function getWorkflowsFromDB() {
    try {
        let query = supabase
            .from('workflows')
            .select('*')
            .order('created_at', { ascending: false })

        // If we have a session ID, filter by it (optional, depending on requirements)
        // For now, let's just fetch all recent ones or allow filtering if passed
        // Since we don't have auth, session_id is a good way to segregate data if we add it to the table
        // For this iteration, we'll fetch all limited to 50

        const { data, error } = await query.limit(50)

        if (error) throw error
        return { data, error: null }
    } catch (err: any) {
        console.error("Error fetching workflows from DB:", err)
        return { data: null, error: err.message || "Unknown error fetching history" }
    }
}

export async function deleteWorkflowFromDB(id: string) {
    try {
        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true, error: null }
    } catch (err: any) {
        console.error("Error deleting workflow from DB:", err)
        return { success: false, error: err.message || "Unknown error deleting" }
    }
}

// Chat
export async function saveMessageToDB(data: DBChatMessage) {
    try {
        const { error } = await supabase
            .from('chat_messages')
            .insert([data])

        if (error) throw error
        return true
    } catch (err) {
        console.error("Error saving message to DB:", err)
        return false
    }
}

export async function getMessagesFromDB(sessionId: string) {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error("Error fetching messages from DB:", err)
        return []
    }
}
// Realtime
export function subscribeToSessionMessages(sessionId: string, onMessage: (payload: any) => void) {
    const channel = supabase.channel(`session-${sessionId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            },
            (payload) => {
                onMessage(payload.new)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}
