import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/lib/store';
import { transformN8NToReactFlow } from '@/lib/n8n-transformer';
import { Link } from 'react-router-dom';
import { Bot, LayoutTemplate, Network, Copy, Check, Wand2, Rocket } from 'lucide-react';
import { getLayoutedElements } from '@/utils/autoLayout';
import { deployWorkflow } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CustomNode } from '@/components/workflow/CustomNode';
import { useMemo } from 'react';

export function VisualizerPage() {
    const workflowJson = useWorkflowStore((state) => state.workflowJson);
    const settings = useWorkflowStore((state) => state.settings);

    // Ensure settings.editor exists to prevent crashes if store is in bad state
    const editorSettings = settings?.editor || { gridSnapping: true, minimap: true };
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
    const [isDeploying, setIsDeploying] = useState(false);

    const nodeTypes = useMemo(() => ({ workflowNode: CustomNode }), []);

    const addToast = useWorkflowStore((state) => state.addToast);

    useEffect(() => {
        if (workflowJson) {
            try {
                const { nodes: newNodes, edges: newEdges } = transformN8NToReactFlow(workflowJson);
                setNodes(newNodes);
                setEdges(newEdges);
            } catch (err: any) {
                console.error("Visualizer Error:", err);
                addToast("Failed to visualize workflow: " + (err.message || "Unknown error"), "error");

                // Set empty state to avoid crash loop
                setNodes([]);
                setEdges([]);
            }
        }
    }, [workflowJson, setNodes, setEdges, addToast]);

    const handleDeploy = async () => {
        if (!workflowJson) return;
        setIsDeploying(true);
        const result = await deployWorkflow(workflowJson);
        setIsDeploying(false);

        if (result.error) {
            addToast("Deployment Failed: " + result.error, "error");
        } else {
            addToast("Workflow Deployed Successfully!", "success");
        }
    };

    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            { direction: 'LR' }
        );
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [nodes, edges, setNodes, setEdges]);

    const handleCopyToN8N = async () => {
        if (!workflowJson && !nodes.length) return;

        setCopyState('copying');
        try {
            let jsonToCopy = "";

            // Prefer copying the raw JSON if available as it preserves all n8n specifics
            if (workflowJson) {
                jsonToCopy = JSON.stringify(workflowJson, null, 2);
            } else {
                // Reconstruct minimal valid n8n JSON for clipboard
                const n8nJson = {
                    nodes: nodes.map(node => ({
                        parameters: node.data?.details?.parameters || node.data?.parameters || {},
                        type: node.data?.type || node.type || "n8n-nodes-base.unknown",
                        typeVersion: node.data?.details?.typeVersion || node.data?.typeVersion || 1,
                        position: [node.position.x, node.position.y],
                        id: node.id,
                        name: node.data?.label || node.id,
                        credentials: node.data?.details?.credentials || node.data?.credentials || {}
                    })),
                    connections: (() => {
                        const conns: any = {};
                        edges.forEach(edge => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const targetNode = nodes.find(n => n.id === edge.target);
                            if (!sourceNode || !targetNode) return;

                            const sourceName = sourceNode.data?.label || sourceNode.id;
                            // const targetName = targetNode.data?.label || targetNode.id;

                            if (!conns[sourceName]) conns[sourceName] = { main: [] };
                            if (!conns[sourceName].main[0]) conns[sourceName].main[0] = [];

                            // This is a naive reconstruction; real n8n JSONs are more complex with multiple inputs/outputs
                            // But consistent with the transformer's simplification
                            conns[sourceName].main[0].push({
                                node: targetNode.data?.label || targetNode.id,
                                type: "main",
                                index: 0
                            });
                        });
                        return conns;
                    })(),
                    pinData: {},
                    meta: { instanceId: crypto.randomUUID() }
                };
                jsonToCopy = JSON.stringify(n8nJson, null, 2);
            }

            await navigator.clipboard.writeText(jsonToCopy);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 2000);
        } catch (err) {
            console.error(err);
            setCopyState('idle');
        }
    };

    if (!workflowJson) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center max-w-md text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-[2rem] flex items-center justify-center shadow-inner mb-8">
                        <Network className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">No Workflow Loaded</h2>
                    <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                        There's nothing to see here yet. Start by generating a workflow with AI or picking a template.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium shadow-xl hover:opacity-90 transition-all hover:-translate-y-1"
                        >
                            <Bot className="w-5 h-5" />
                            Create with AI
                        </Link>
                        <Link
                            to="/templates"
                            className="flex items-center justify-center gap-2 bg-card text-card-foreground border px-8 py-3.5 rounded-full font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                            <LayoutTemplate className="w-5 h-5" />
                            Browse Templates
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative group">
            {/* Top Bar Actions */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 md:gap-3 flex-wrap justify-end max-w-[80%]">
                <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-medium shadow-lg backdrop-blur-md transition-all duration-300 border",
                        isDeploying
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent hover:scale-105 hover:shadow-blue-500/25"
                    )}
                    title="Deploy"
                >
                    {isDeploying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Rocket className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline">{isDeploying ? 'Deploying...' : 'Deploy'}</span>
                </button>
                <button
                    onClick={() => onLayout()}
                    className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-medium shadow-lg backdrop-blur-md transition-all duration-300 border bg-white/90 dark:bg-slate-900/90 text-foreground border-white/20 hover:scale-105"
                    title="Tidy Up"
                >
                    <Wand2 className="w-5 h-5" />
                    <span className="hidden md:inline">Tidy Up</span>
                </button>
                <button
                    onClick={handleCopyToN8N}
                    disabled={copyState === 'copied'}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-medium shadow-lg backdrop-blur-md transition-all duration-300 border",
                        copyState === 'copied'
                            ? "bg-green-500 text-white border-green-400"
                            : "bg-white/90 dark:bg-slate-900/90 text-foreground border-white/20 hover:scale-105"
                    )}
                    title="Copy for n8n"
                >
                    {copyState === 'copied' ? (
                        <>
                            <Check className="w-5 h-5" />
                            <span className="hidden md:inline">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            <span className="hidden md:inline">Copy for n8n</span>
                        </>
                    )}
                </button>
            </div>

            {/* Overlay hint - Moved to top-left to allow Controls in bottom-left */}
            <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold text-slate-500 dark:text-slate-400 pointer-events-none flex gap-3">
                <span>{nodes.length} nodes</span>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-600 self-center"></span>
                <span>{edges.length} connections</span>
            </div>

            {/* React Flow Canvas */}
            <div className="h-full w-full bg-slate-100 dark:bg-[#0f111a]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    className="bg-slate-100 dark:bg-[#0f111a]"
                    snapToGrid={editorSettings.gridSnapping}
                    nodeTypes={nodeTypes}
                    minZoom={0.2}
                >
                    <Background color="#94a3b8" gap={20} size={1} className="opacity-10 dark:opacity-5" />

                    <Controls
                        className="bg-white dark:bg-slate-800 border-border shadow-lg rounded-md overflow-hidden m-4 fill-slate-500 dark:text-slate-400"
                        showInteractive={false} // Cleaner look
                    />

                    {editorSettings.minimap && (
                        <MiniMap
                            className="!bg-white/50 dark:!bg-slate-800/50 !border-border !shadow-sm !rounded-md overflow-hidden m-4"
                            nodeColor={(n) => {
                                // Mimic n8n node colors roughly
                                if (n.data?.type?.includes('trigger') || n.data?.type?.includes('webhook')) return '#22c55e'; // Green
                                if (n.data?.type?.includes('if') || n.data?.type?.includes('switch')) return '#eab308'; // Yellow
                                if (n.data?.type?.includes('set') || n.data?.type?.includes('function')) return '#3b82f6'; // Blue
                                return '#64748b'; // Default Slate
                            }}
                            maskColor={settings?.appearance?.theme === 'dark' ? 'rgba(15, 17, 26, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
                            pannable
                            zoomable
                        />
                    )}
                </ReactFlow>
            </div>
        </div>
    );
}
