import { useState, useMemo } from "react"
import { Check, Copy, CheckCircle, ArrowRight, Layers, FileJson, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import { useNavigate } from "react-router-dom";
import { useWorkflowStore } from "@/lib/store";

interface WorkflowResponseProps {
    json: any
    explanation?: string
}

export function WorkflowResponse({ json, explanation }: WorkflowResponseProps) {
    const [copied, setCopied] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const navigate = useNavigate()
    const { setWorkflowJson } = useWorkflowStore()

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(json, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleOpenVisualizer = () => {
        setWorkflowJson(json)
        navigate('/visualizer')
    }

    const jsonString = useMemo(() => JSON.stringify(json, null, 2), [json])
    const highlightedCode = useMemo(() => {
        return highlight(jsonString, languages.json, 'json');
    }, [jsonString]);

    return (
        <div className="flex flex-col w-full max-w-2xl gap-3">
            {/* Success Card */}
            <div className="w-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-900/10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Workflow Created</h3>
                        <p className="text-xs text-muted-foreground">{json.nodes?.length || 0} Nodes • Ready to use</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {explanation && <p className="text-sm text-foreground/80 mb-6 leading-relaxed whitespace-pre-wrap">{explanation}</p>}

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={handleOpenVisualizer}
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
                        >
                            <Layers className="w-4 h-4" />
                            Visualizer
                            <ArrowRight className="w-4 h-4 opacity-70" />
                        </button>

                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border",
                                copied
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                            )}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy JSON"}
                        </button>
                    </div>

                    {/* Code Preview */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950/50">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <FileJson className="w-3.5 h-3.5" />
                                <span>Preview JSON Code</span>
                            </div>
                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out relative group",
                            expanded ? "max-h-[500px]" : "max-h-[120px]"
                        )}>
                            <pre className="p-4 text-xs font-mono overflow-auto custom-scrollbar h-full bg-slate-50 dark:bg-slate-950/50">
                                <code dangerouslySetInnerHTML={{ __html: highlightedCode }} className="language-json block" />
                            </pre>

                            {/* Gradient Overlay when collapsed */}
                            {!expanded && (
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
