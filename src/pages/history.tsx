import { useWorkflowStore } from "@/lib/store"
import { Clock, Trash2, ArrowRight, FileJson, Calendar, PlayCircle, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"


import { useEffect } from "react"

export function HistoryPage() {
    const { workflowHistory, deleteFromHistory, setWorkflowJson, setLastPrompt, loadHistory } = useWorkflowStore()
    const navigate = useNavigate()

    useEffect(() => {
        loadHistory()
    }, [loadHistory])

    const handleRestore = (entry: any) => {
        setWorkflowJson(entry.workflow)
        setLastPrompt(entry.prompt)
        navigate('/visualizer')
    }

    const handleDownload = (entry: any) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry.workflow, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `n8n-workflow-${entry.prompt.substring(0, 20).replace(/\s+/g, '-')}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const formatDate = (timestamp: number | string | Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp))
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto">
            <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Workflow History</h1>
                        <p className="text-xl text-muted-foreground">View and manage your previously generated workflows.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 shadow-sm border px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground">
                        {workflowHistory.length} Saved Items
                    </div>
                </div>

                {workflowHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Clock className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">No history yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-8 text-lg">
                            Start chatting with the agent to generate your first workflow.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Create Workflow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                        {workflowHistory.map((entry) => (
                            <div
                                key={entry.id}
                                className="group bg-card hover:bg-white dark:hover:bg-slate-900 border rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(entry);
                                        }}
                                        className="text-slate-400 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"
                                        title="Download JSON"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFromHistory(entry.id);
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(entry.timestamp)}
                                </div>

                                <h3 className="font-semibold text-xl leading-snug mb-3 line-clamp-2 text-foreground">
                                    "{entry.prompt}"
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <FileJson className="w-3.5 h-3.5" />
                                        <span>{entry.workflow?.nodes?.length || 0} Nodes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        <span>Ready</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRestore(entry)}
                                    className="w-full bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                                >
                                    Open in Visualizer
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
