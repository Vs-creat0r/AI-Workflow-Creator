import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveWorkflowToDB, deleteWorkflowFromDB, saveMessageToDB, getWorkflowsFromDB, getMessagesFromDB } from './db'
import { defaultWorkflow } from './default-workflow'

export interface WorkflowEntry {
    id: string
    workflow: any
    timestamp: number
    prompt: string
}

export interface SettingsState {
    appearance: {
        theme: 'dark' | 'light' | 'system'
        fontSize: 'small' | 'medium' | 'large'
        animationSpeed: 'slow' | 'normal' | 'fast'
    }
    editor: {
        autoSave: boolean
        gridSnapping: boolean
        minimap: boolean
    }
    ai: {
        outputVerbosity: 'concise' | 'detailed'
    }
    n8n: {
        instanceUrl: string
        apiKey: string
    }
}

export interface WorkflowState {
    // Session
    sessionId: string
    initializeSession: () => void

    // Current Workflow State
    workflowJson: any | null
    setWorkflowJson: (json: any) => void

    // Chat State
    chatMessages: any[]
    setChatMessages: (messages: any[]) => void
    addMessage: (message: any) => void // New action for single message add

    // Metadata
    lastPrompt: string
    setLastPrompt: (prompt: string) => void

    // Controls
    complexityMode: 'simple' | 'robust'
    setComplexityMode: (mode: 'simple' | 'robust') => void

    // Toasts
    toasts: { id: string; title: string; type: 'success' | 'error' | 'info' }[]
    addToast: (title: string, type: 'success' | 'error' | 'info') => void
    removeToast: (id: string) => void

    // History
    workflowHistory: WorkflowEntry[]
    addToHistory: (entry: WorkflowEntry) => void
    deleteFromHistory: (id: string) => void
    loadHistory: () => Promise<void>

    // Generation State
    isGenerating: boolean
    generationStep: string
    setGenerationState: (isGenerating: boolean, step?: string) => void

    // Settings
    settings: SettingsState
    updateSettings: (section: keyof SettingsState, values: Partial<SettingsState[keyof SettingsState]>) => void

    // Actions
    clearCurrentSession: () => void
}

const defaultSettings: SettingsState = {
    appearance: {
        theme: 'dark',
        fontSize: 'medium',
        animationSpeed: 'normal'
    },
    editor: {
        autoSave: true,
        gridSnapping: true,
        minimap: true
    },
    ai: {
        outputVerbosity: 'detailed'
    },
    n8n: {
        instanceUrl: '',
        apiKey: ''
    }
}

// Helper to generate UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const useWorkflowStore = create<WorkflowState>()(
    persist(
        (set, get) => ({
            sessionId: '', // Will be set on init
            workflowJson: defaultWorkflow,
            chatMessages: [],
            lastPrompt: '',
            complexityMode: 'simple',
            workflowHistory: [],
            isGenerating: false,
            generationStep: 'Ready',
            settings: defaultSettings,

            initializeSession: async () => {
                const currentSession = get().sessionId
                if (!currentSession) {
                    const newSession = generateUUID()
                    set({ sessionId: newSession })

                    // Load any public workflows on start
                    get().loadHistory()
                } else {
                    // Load messages for this session
                    const messages = await getMessagesFromDB(currentSession)
                    if (messages && messages.length > 0) {
                        // Convert DB messages to local format if needed or use as is
                        // DB format: { role, content, created_at, ... }
                        // Local format: { id, role, content, timestamp, ... }
                        const formattedMessages = messages.map((m: any) => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            timestamp: new Date(m.created_at),
                            isError: m.is_error
                        }))
                        set({ chatMessages: formattedMessages })
                    }
                    get().loadHistory()
                }
            },

            setWorkflowJson: (json) => set({ workflowJson: json }),

            setChatMessages: (messages) => set({ chatMessages: messages }),

            addMessage: (message) => {
                const state = get()
                const newMessages = [...state.chatMessages, message]
                set({ chatMessages: newMessages })

                // Sync to DB
                if (state.sessionId) {
                    saveMessageToDB({
                        role: message.role,
                        content: message.content,
                        is_error: message.isError,
                        session_id: state.sessionId,
                        created_at: new Date().toISOString() // Ensure timestamp is preserved
                    })
                }
            },

            setLastPrompt: (prompt) => set({ lastPrompt: prompt }),

            setComplexityMode: (mode) => set({ complexityMode: mode }),

            toasts: [],
            addToast: (title, type) => {
                const id = Math.random().toString(36).substring(7)
                set((state) => ({ toasts: [...state.toasts, { id, title, type }] }))
                setTimeout(() => {
                    get().removeToast(id)
                }, 3000)
            },
            removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

            addToHistory: async (entry) => {
                set((state) => ({
                    workflowHistory: [entry, ...state.workflowHistory].slice(0, 50)
                }))

                // Sync to DB
                // Get session ID from state
                const currentSessionId = get().sessionId

                const result = await saveWorkflowToDB({
                    id: entry.id, // Use same ID
                    prompt: entry.prompt,
                    workflow_json: entry.workflow,
                    created_at: new Date(entry.timestamp).toISOString(),
                    session_id: currentSessionId
                })

                if (!result.success) {
                    get().addToast(`Failed to save workflow: ${result.error}`, 'error')
                }
            },

            deleteFromHistory: async (id) => {
                set((state) => ({
                    workflowHistory: state.workflowHistory.filter(item => item.id !== id)
                }))

                // Sync DB
                const result = await deleteWorkflowFromDB(id)
                if (!result.success) {
                    get().addToast(`Failed to delete: ${result.error}`, 'error')
                    // Revert the deletion from state since DB failed?
                    // For now, let's just warn correct, as state is optimistic
                }
            },

            loadHistory: async () => {
                const { data, error } = await getWorkflowsFromDB()
                if (data !== null) {
                    const formattedHistory = data.map((w: any) => ({
                        id: w.id,
                        workflow: w.workflow_json,
                        timestamp: new Date(w.created_at).getTime(),
                        prompt: w.prompt
                    }))
                    set({ workflowHistory: formattedHistory })
                } else if (error) {
                    get().addToast(`Failed to load history: ${error}`, 'error')
                }
            },

            setGenerationState: (isGenerating, step) => set({
                isGenerating,
                generationStep: step || (isGenerating ? 'Thinking...' : 'Ready')
            }),

            updateSettings: (section, values) => set((state) => ({
                settings: {
                    ...state.settings,
                    [section]: { ...state.settings[section], ...values }
                }
            })),

            clearCurrentSession: () => set({
                workflowJson: null,
                chatMessages: [],
                lastPrompt: ''
            }),
        }),
        {
            name: 'workflow-creator-storage-v2',
            partialize: (state) => ({
                sessionId: state.sessionId,
                // Don't persist large data locally effectively twice if we have DB, 
                // but for now keep it for offline support/speed
                workflowJson: state.workflowJson,
                // chatMessages: state.chatMessages, // Maybe don't persist chat locally if loading from DB
                lastPrompt: state.lastPrompt,
                // workflowHistory: state.workflowHistory, // Conflict with DB load? Let's keep for cache
                settings: state.settings,
            })
        }
    )
)
