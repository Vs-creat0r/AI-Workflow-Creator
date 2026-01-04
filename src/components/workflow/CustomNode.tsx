import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import {
    Zap,
    Box,
    GitBranch,
    Database,
    Globe,
    MessageSquare,
    Clock,
    FileText,
    Play
} from 'lucide-react';

const getNodeIcon = (type: string, name: string) => {
    const t = (type || "").toLowerCase();
    const n = (name || "").toLowerCase();

    if (t.includes('webhook')) return Globe;
    if (t.includes('schedule') || t.includes('cron') || t.includes('interval')) return Clock;
    if (t.includes('postgres') || t.includes('sql') || t.includes('mongo') || t.includes('redis')) return Database;
    if (t.includes('if') || t.includes('switch') || t.includes('router') || t.includes('merge')) return GitBranch;
    if (t.includes('http') || t.includes('request') || t.includes('api')) return Globe;
    if (t.includes('chat') || t.includes('ai') || t.includes('llm') || t.includes('model')) return MessageSquare;
    if (t.includes('trigger') || n.includes('start')) return Zap;
    if (t.includes('function') || t.includes('code') || t.includes('set')) return FileText;
    if (t.includes('execute')) return Play;

    return Box;
};

const getNodeColor = (type: string) => {
    const t = (type || "").toLowerCase();

    if (t.includes('trigger') || t.includes('webhook') || t.includes('schedule')) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800';
    if (t.includes('if') || t.includes('switch') || t.includes('router')) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800';
    if (t.includes('chat') || t.includes('ai')) return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-800';
    if (t.includes('params') || t.includes('set') || t.includes('function')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800';

    return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
};

export const CustomNode = memo(({ data, selected }: NodeProps) => {
    const Icon = getNodeIcon(data.type, data.label);
    const colorClass = getNodeColor(data.type);

    // Extract base color for the top decorative line from the color class text
    // This is a bit hacky but works for this specific class structure
    const getAccentColor = () => {
        if (colorClass.includes('green')) return 'bg-green-500';
        if (colorClass.includes('orange')) return 'bg-orange-500';
        if (colorClass.includes('purple')) return 'bg-purple-500';
        if (colorClass.includes('blue')) return 'bg-blue-500';
        return 'bg-slate-500';
    };

    return (
        <div className={cn(
            "group relative min-w-[240px] rounded-xl border bg-card shadow-sm transition-all duration-300",
            "hover:shadow-md hover:border-primary/50",
            "dark:bg-slate-900/90 dark:backdrop-blur-xl",
            selected ? "ring-2 ring-primary border-transparent shadow-lg" : "border-border"
        )}>
            {/* Top accent line */}
            <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-xl", getAccentColor())} />

            <div className="p-4 flex flex-col gap-3">
                {/* Header Section */}
                <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 p-2 rounded-lg shrink-0", colorClass)}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm leading-none mb-1.5 truncate block text-foreground tracking-tight">
                            {data.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            <span className="truncate max-w-[120px]">{data.type?.split('.').pop() || 'Node'}</span>
                            {data.details?.position && (
                                <span className="opacity-50">• ID: {data.id}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section - Parameters Preview (Optional, can be expanded) */}
                {/* {data.details?.parameters && Object.keys(data.details.parameters).length > 0 && (
                     <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                            <Settings2 className="w-3 h-3 opacity-70" />
                            <span className="font-medium">Parameters</span>
                        </div>
                        <div className="pl-4 border-l-2 border-border/50 space-y-0.5">
                            {Object.entries(data.details.parameters).slice(0, 2).map(([k, v]: any) => (
                                <div key={k} className="flex gap-1 overflow-hidden">
                                     <span className="opacity-70">{k}:</span>
                                     <span className="truncate">{String(v)}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                )} */}
            </div>

            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    "!w-3 !h-3 !-left-1.5 !bg-muted-foreground !border-2 !border-background transition-colors",
                    "group-hover:!bg-primary group-hover:!w-3.5 group-hover:!h-3.5 group-hover:!-left-[7px]"
                )}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    "!w-3 !h-3 !-right-1.5 !bg-muted-foreground !border-2 !border-background transition-colors",
                    "group-hover:!bg-primary group-hover:!w-3.5 group-hover:!h-3.5 group-hover:!-right-[7px]"
                )}
            />
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
