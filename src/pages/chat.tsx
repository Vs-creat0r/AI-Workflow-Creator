import { useState, useRef, useEffect } from "react"
import { Loader2, Bot, Sparkles, Mic, Image as ImageIcon, Search, Music, ArrowRight, Zap, LayoutTemplate, Network } from "lucide-react"
import { sendChatToN8N } from "@/lib/api"
import { Message, MessageBubble } from "@/components/chat/message-bubble"
import { useWorkflowStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export function ChatPage() {
    const {
        chatMessages,
        setLastPrompt,
        setWorkflowJson,
        addToHistory,
        addMessage,
        complexityMode,
        setComplexityMode,
        isGenerating,
        generationStep,
        setGenerationState
    } = useWorkflowStore()
    const navigate = useNavigate()

    // Removing local 'messages' state in favor of store state for persistence
    // But keeping local 'input'
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const loadingStages = [
        "Drafting logic...",
        "Refining & simplifying graph...",
        "Generating n8n JSON..."
    ]

    useEffect(() => {
        if (!isGenerating) {
            return
        }

        const interval = setInterval(() => {
            const currentStageIndex = loadingStages.indexOf(generationStep);
            const nextStageIndex = (currentStageIndex + 1) % loadingStages.length;
            // Only update local visual if needed, but store is master. 
            // Actually, we should probably update store if we want text to strict sync,
            // but for simple visual cycling, let's just cycle the text in store
            setGenerationState(true, loadingStages[nextStageIndex] || loadingStages[0])
        }, 2000)

        return () => clearInterval(interval)
    }, [isGenerating, generationStep, setGenerationState])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    const handleSendMessage = async (e?: React.FormEvent, customInput?: string) => {
        e?.preventDefault()
        const textToSend = customInput || input
        if (!textToSend.trim() || isGenerating) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        }

        // Use addMessage to persist to DB
        addMessage(userMsg)
        setLastPrompt(textToSend)
        setInput("")
        setGenerationState(true, "Drafting logic...")

        try {
            const response = await sendChatToN8N(userMsg.content, complexityMode)

            let content = "I've generated the workflow for you based on your request."
            let refinedJson = null

            if (response.error) {
                content = `Error: ${response.error}`
            } else if (response.refined_json) {
                content = `I've created the workflow! You can view it in the Visualizer or download it.`

                try {
                    refinedJson = JSON.parse(response.refined_json);
                    setWorkflowJson(refinedJson);

                    addToHistory({
                        id: Date.now().toString(),
                        workflow: refinedJson,
                        timestamp: Date.now(),
                        prompt: textToSend
                    })
                } catch (e) {
                    console.error("Failed to parse JSON", e);
                    content += "\n\n(Warning: The generated JSON seems invalid.)";
                }
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: content,
                timestamp: new Date(),
                isError: !!response.error,
                workflowJson: refinedJson // Pass the object directly
            }

            // Use addMessage to persist to DB
            addMessage(botMsg)

        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Something went wrong communicating with the server.",
                timestamp: new Date(),
                isError: true
            }
            addMessage(errorMsg)
        } finally {
            setGenerationState(false)
        }
    }

    const hasMessages = chatMessages && chatMessages.length > 0

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!hasMessages ? (
                    /* Hero Section */
                    <div className="flex flex-col items-center justify-center min-h-[70%] px-4 py-6 max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">

                        {/* Header & Robot */}
                        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start mb-10 relative z-10">
                            <div className="z-20 relative max-w-xl text-center md:text-left">
                                <div className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-100 dark:border-purple-800">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Workflow Assistant v1.0</span>
                                </div>
                                <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
                                    Hi there, Ready to <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 animate-gradient-x">
                                        Automate?
                                    </span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
                                    Describe your workflow and I'll build it instantly using n8n.
                                </p>
                            </div>

                            {/* Robot Illustration Area */}
                            <div className="hidden md:flex flex-col items-center absolute right-10 top-0 pointer-events-none z-0">
                                <div className="relative animate-float">
                                    {/* Robot Body */}
                                    <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 z-10 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <Bot className="w-16 h-16 text-slate-800 dark:text-slate-200" />
                                        {/* Eyes (Fake) */}
                                        <div className="absolute top-10 flex gap-4">
                                            <div className="w-3 h-3 bg-slate-900 dark:bg-white rounded-full animate-blink"></div>
                                            <div className="w-3 h-3 bg-slate-900 dark:bg-white rounded-full animate-blink delay-75"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-12">
                            {[
                                {
                                    icon: Zap,
                                    title: "Create Workflow",
                                    desc: "Describe your automation needs and I'll build it.",
                                    tag: "Fast Start",
                                    color: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
                                    action: () => document.getElementById('chat-input')?.focus()
                                },
                                {
                                    icon: LayoutTemplate,
                                    title: "Use Templates",
                                    desc: "Browse pre-built templates for common use cases.",
                                    tag: "Explore",
                                    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
                                    action: () => navigate('/templates')
                                },
                                {
                                    icon: Network,
                                    title: "Visualize Data",
                                    desc: "View and edit your existing workflows visually.",
                                    tag: "Edit",
                                    color: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
                                    action: () => navigate('/visualizer')
                                }
                            ].map((card, i) => (
                                <button
                                    key={i}
                                    onClick={card.action}
                                    className="group text-left bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-foreground mb-2">{card.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{card.desc}</p>
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">{card.tag}</span>
                                </button>
                            ))}
                        </div>

                    </div>
                ) : (
                    /* Chat Messages List */
                    <div className="p-4 space-y-8 max-w-4xl mx-auto pb-40 pt-10">
                        {chatMessages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {isGenerating && (
                            <div className="flex w-full gap-4 flex-row animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-white dark:bg-slate-800 shadow-sm text-primary">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-none">
                                    <span className="text-sm font-medium text-foreground min-w-[150px]">{generationStep}</span>
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Floating Input Section */}
            <div className={cn(
                "w-full px-4 transition-all duration-500 ease-out z-20",
                hasMessages ? "fixed bottom-6 left-0 right-0 md:pl-[100px]" : "w-full max-w-4xl mx-auto mb-16"
            )}>
                <div className={cn("mx-auto transition-all duration-500", hasMessages ? "max-w-4xl" : "max-w-full")}>
                    {/* Input Container */}
                    <div className={cn(
                        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] p-2 relative transition-all duration-300",
                        isGenerating && "opacity-80 pointer-events-none grayscale"
                    )}>
                        <form
                            onSubmit={(e) => handleSendMessage(e)}
                            className="flex items-center gap-2 pl-2 md:pl-5 pr-2 py-2"
                        >
                            {/* Mode Toggle */}
                            <div className="flex bg-muted/50 p-1 rounded-lg mr-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setComplexityMode('simple')}
                                    className={cn(
                                        "text-xs px-2 md:px-3 py-1.5 rounded-md transition-all font-medium",
                                        complexityMode === 'simple'
                                            ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="Fast & Simple (MVP)"
                                >
                                    Simple
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setComplexityMode('robust')}
                                    className={cn(
                                        "text-xs px-2 md:px-3 py-1.5 rounded-md transition-all font-medium",
                                        complexityMode === 'robust'
                                            ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="Production Ready (Error Handling)"
                                >
                                    Robust
                                </button>
                            </div>

                            <div className="hidden sm:flex items-center gap-3 text-muted-foreground border-r pr-4 mr-1">
                                <Mic className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
                            </div>

                            <input
                                id="chat-input"
                                autoFocus
                                className="flex-1 min-w-0 bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:outline-none min-h-[52px] text-foreground"
                                placeholder='Example: "Create a workflow to sync Google Sheets to Slack"'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isGenerating}
                                autoComplete="off"
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || isGenerating}
                                className="h-12 w-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <ArrowRight className="h-6 w-6" />
                                <span className="sr-only">Send</span>
                            </button>
                        </form>
                    </div>

                    {/* Action Pills */}
                    {!hasMessages && (
                        <div className="flex flex-wrap gap-2.5 mt-6 px-2 justify-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
                            {[
                                { label: "Deep Research", icon: Search, text: "Perform deep research on..." },
                                { label: "Generate Image", icon: ImageIcon, text: "Generate an image of..." },
                                { label: "Search Web", icon: Search, text: "Search the web for..." },
                                { label: "Compose Music", icon: Music, text: "Compose a song about..." },
                            ].map((pill, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(pill.text)
                                        document.getElementById('chat-input')?.focus()
                                    }}
                                    className="flex items-center gap-2 bg-white/50 dark:bg-white/5 text-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-border"
                                >
                                    <pill.icon className="w-4 h-4 opacity-70" />
                                    <span>{pill.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
