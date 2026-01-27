export interface N8NResponse {
    refined_json: string
    prompt_used: string
    generated_at: string
    error?: string
}

import { useWorkflowStore } from "@/lib/store"

export interface DeployResponse {
    id?: string
    name?: string
    active?: boolean
    error?: string
}

export async function sendChatToN8N(message: string, sessionId: string, mode: 'simple' | 'robust' = 'simple'): Promise<N8NResponse> {
    // USING TEST WEBHOOK URL (matches your "Listening for test event" screen)
    // When you activate the workflow for production, remove "-test" from this URL.
    const WEBHOOK_URL = "/api/n8n/webhook-test/workflow-create"

    // try-catch removed to allow caller to handle errors and reset loading state
    const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Include mode and sessionId in the payload
        body: JSON.stringify({ chatInput: message, mode, sessionId }),
    })

    // Fire and forget - we don't wait for the n8n logic to finish if it's long-running.
    // However, we do want to check if the request itself succeeded (200 OK).
    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
    }

    return {
        refined_json: "",
        prompt_used: message,
        generated_at: new Date().toISOString(),
    }
}

export async function deployWorkflow(workflow: any): Promise<DeployResponse> {
    const { settings } = useWorkflowStore.getState()
    const { instanceUrl, apiKey } = settings.n8n

    if (!instanceUrl || !apiKey) {
        return { error: "Missing n8n configuration. Please check Settings." }
    }

    // Clean URL
    const baseUrl = instanceUrl.replace(/\/$/, "")
    const url = `${baseUrl}/api/v1/workflows`

    try {
        const payload = {
            name: workflow.meta?.name || `AI Workflow - ${new Date().toLocaleString()}`,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: { saveManualExecutions: true, callers: [] },
            tags: [],
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "X-N8N-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`n8n Error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        console.error("Failed to deploy workflow", error)
        return { error: error.message || "Failed to deploy workflow." }
    }
}
