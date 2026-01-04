import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import { WorkflowResponse } from "./workflow-response"

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    isError?: boolean
    workflowJson?: any
}

interface MessageBubbleProps {
    message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user"

    // Safe date formatting
    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (message.workflowJson) {
        return (
            <div className="flex w-full gap-3 p-4 flex-row animate-in slide-in-from-bottom-2 duration-300">
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground"
                >
                    <Bot className="h-4 w-4" />
                </div>
                <div className="flex max-w-full flex-col gap-1 w-full">
                    <WorkflowResponse json={message.workflowJson} explanation={message.content} />
                    <span className="text-xs text-muted-foreground ml-1">
                        {formattedTime}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex w-full gap-3 p-4",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                )}
            >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
                className={cn(
                    "flex max-w-[80%] flex-col gap-1",
                    isUser ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "rounded-lg px-4 py-3 text-sm shadow-sm",
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border text-card-foreground",
                        message.isError && "bg-destructive text-destructive-foreground border-destructive/50"
                    )}
                >
                    {/* Simple markdown rendering or just text for now */}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formattedTime}
                </span>
            </div>
        </div>
    )
}
