import { useNavigate } from "react-router-dom"
import { useWorkflowStore } from "@/lib/store"
import { ArrowRight, Sparkles, Youtube, UserPlus, Receipt, Search, Mic } from "lucide-react"

// Sample Template Data (Simplified N8N JSONs)
const TEMPLATES = [
    {
        id: "content-repurposing",
        title: "AI Content Repurposing Engine",
        description: "Watch a YouTube channel. When a new video is posted, transcribe it, generate a LinkedIn post and Twitter thread, and schedule to Buffer.",
        icon: Youtube,
        color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        json: {
            nodes: [
                { name: "YouTube Trigger", type: "n8n-nodes-base.youtubeTrigger", position: [100, 300], typeVersion: 1 },
                { name: "Whisper Transcribe", type: "n8n-nodes-base.openai", position: [350, 300], typeVersion: 1 },
                { name: "Generate Social Posts", type: "n8n-nodes-base.langChain", position: [600, 300], typeVersion: 1 },
                { name: "Buffer", type: "n8n-nodes-base.buffer", position: [850, 300], typeVersion: 1 }
            ],
            connections: {
                "YouTube Trigger": { "main": [[{ node: "Whisper Transcribe", type: "main", index: 0 }]] },
                "Whisper Transcribe": { "main": [[{ node: "Generate Social Posts", type: "main", index: 0 }]] },
                "Generate Social Posts": { "main": [[{ node: "Buffer", type: "main", index: 0 }]] }
            }
        }
    },
    {
        id: "lead-enrichment",
        title: "Inbound Lead Enrichment",
        description: "When a new lead enters via Typeform, use Clearbit/Apollo to find their email & LinkedIn, generate a personalized cold email, and draft it in Gmail.",
        icon: UserPlus,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        json: {
            nodes: [
                { name: "Typeform Trigger", type: "n8n-nodes-base.typeformTrigger", position: [100, 300], typeVersion: 1 },
                { name: "Clearbit Enrichment", type: "n8n-nodes-base.clearbit", position: [350, 300], typeVersion: 1 },
                { name: "Generate Email", type: "n8n-nodes-base.openAi", position: [600, 300], typeVersion: 1 },
                { name: "Gmail Draft", type: "n8n-nodes-base.gmail", position: [850, 300], typeVersion: 1 }
            ],
            connections: {
                "Typeform Trigger": { "main": [[{ node: "Clearbit Enrichment", type: "main", index: 0 }]] },
                "Clearbit Enrichment": { "main": [[{ node: "Generate Email", type: "main", index: 0 }]] },
                "Generate Email": { "main": [[{ node: "Gmail Draft", type: "main", index: 0 }]] }
            }
        }
    },
    {
        id: "invoice-processor",
        title: "Smart Invoice Processor",
        description: "Monitor Gmail for attachments. Extract invoice data using OpenAI Vision. Add expenses to AirTable and notify the Finance Slack channel.",
        icon: Receipt,
        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        json: {
            nodes: [
                { name: "Gmail Trigger", type: "n8n-nodes-base.gmailTrigger", position: [100, 300], typeVersion: 1 },
                { name: "OpenAI Vision", type: "n8n-nodes-base.openAi", position: [350, 300], typeVersion: 1 },
                { name: "AirTable", type: "n8n-nodes-base.airtable", position: [600, 300], typeVersion: 1 },
                { name: "Slack Notify", type: "n8n-nodes-base.slack", position: [850, 300], typeVersion: 1 }
            ],
            connections: {
                "Gmail Trigger": { "main": [[{ node: "OpenAI Vision", type: "main", index: 0 }]] },
                "OpenAI Vision": { "main": [[{ node: "AirTable", type: "main", index: 0 }]] },
                "AirTable": { "main": [[{ node: "Slack Notify", type: "main", index: 0 }]] }
            }
        }
    },
    {
        id: "competitor-monitor",
        title: "Competitor Monitor",
        description: "Scrape competitor pricing pages daily. Compare with previous data. If changes are detected, generate a report and email the Sales team.",
        icon: Search,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        json: {
            nodes: [
                { name: "Schedule", type: "n8n-nodes-base.scheduleTrigger", position: [100, 300], typeVersion: 1 },
                { name: "Web Scraper", type: "n8n-nodes-base.httpRequest", position: [350, 300], typeVersion: 1 },
                { name: "Compare Data", type: "n8n-nodes-base.function", position: [600, 300], typeVersion: 1 },
                { name: "Email Alert", type: "n8n-nodes-base.emailSend", position: [850, 300], typeVersion: 1 }
            ],
            connections: {
                "Schedule": { "main": [[{ node: "Web Scraper", type: "main", index: 0 }]] },
                "Web Scraper": { "main": [[{ node: "Compare Data", type: "main", index: 0 }]] },
                "Compare Data": { "main": [[{ node: "Email Alert", type: "main", index: 0 }]] }
            }
        }
    },
    {
        id: "meeting-tracker",
        title: "Meeting Action Item Tracker",
        description: "Upload a recording to Google Drive. Transcribe with Whisper. Extract action items and assignees. Create tasks in Jira/Trello automatically.",
        icon: Mic,
        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
        json: {
            nodes: [
                { name: "Google Drive Trigger", type: "n8n-nodes-base.googleDriveTrigger", position: [100, 300], typeVersion: 1 },
                { name: "Whisper Transcribe", type: "n8n-nodes-base.openai", position: [350, 300], typeVersion: 1 },
                { name: "Extract Tasks", type: "n8n-nodes-base.langChain", position: [600, 300], typeVersion: 1 },
                { name: "Jira / Trello", type: "n8n-nodes-base.jira", position: [850, 300], typeVersion: 1 }
            ],
            connections: {
                "Google Drive Trigger": { "main": [[{ node: "Whisper Transcribe", type: "main", index: 0 }]] },
                "Whisper Transcribe": { "main": [[{ node: "Extract Tasks", type: "main", index: 0 }]] },
                "Extract Tasks": { "main": [[{ node: "Jira / Trello", type: "main", index: 0 }]] }
            }
        }
    }
]

export function TemplatesPage() {
    const navigate = useNavigate()
    const setWorkflowJson = useWorkflowStore((state) => state.setWorkflowJson)

    const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
        setWorkflowJson(template.json)
        navigate("/visualizer")
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto">
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Browse Templates
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Jumpstart your automation journey with these battle-tested workflow templates.
                        Select one to visualize and edit it instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                    {TEMPLATES.map((template) => (
                        <div
                            key={template.id}
                            className="group relative bg-card rounded-[1.5rem] border p-6 flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className={`w-14 h-14 rounded-2xl ${template.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <template.icon className="w-7 h-7" />
                            </div>

                            <h3 className="font-semibold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                                {template.title}
                            </h3>

                            <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                                {template.description}
                            </p>

                            <div className="flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
                                Use Template <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
