import { Node, Edge, MarkerType } from 'reactflow';

// Basic types for N8N JSON
interface N8NNode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters?: any;
    credentials?: any;
}

interface N8NConnection {
    node: string;
    type: string;
    index: number;
}

interface N8NConnections {
    [nodeName: string]: {
        [outputType: string]: N8NConnection[][];
    };
}

interface N8NWorkflow {
    nodes: N8NNode[];
    connections: N8NConnections;
}

export function transformN8NToReactFlow(n8nData: N8NWorkflow): { nodes: Node[]; edges: Edge[] } {
    if (!n8nData || !n8nData.nodes) {
        return { nodes: [], edges: [] };
    }

    // Simple layout algorithm since we don't have dagre installed
    // 1. Organize nodes by depth (topological sort approximation)
    const nodeDepths: Record<string, number> = {};
    n8nData.nodes.forEach(n => nodeDepths[n.name] = 0);

    // Calculate depths
    // Iterate a few times to propagate depths across connections
    for (let i = 0; i < 5; i++) {
        if (!n8nData.connections) break;

        Object.keys(n8nData.connections).forEach(source => {
            const outputs = n8nData.connections[source];
            if (!outputs) return;

            Object.values(outputs).forEach(outGroup => {
                if (!Array.isArray(outGroup)) return;

                outGroup.forEach(conList => {
                    if (!Array.isArray(conList)) return;

                    conList.forEach(con => {
                        const target = con.node;
                        if (nodeDepths[target] !== undefined) {
                            nodeDepths[target] = Math.max(nodeDepths[target], nodeDepths[source] + 1);
                        }
                    });
                });
            });
        });
    }

    // Group by depth
    const nodesByDepth: Record<number, string[]> = {};
    Object.entries(nodeDepths).forEach(([name, depth]) => {
        if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
        nodesByDepth[depth].push(name);
    });

    const nodes: Node[] = n8nData.nodes
        .filter(node => {
            // Filter out empty Sticky Notes
            if (node.type === 'n8n-nodes-base.stickyNote') {
                const content = node.parameters?.content || '';
                return content && !content.includes('null') && content.trim() !== '';
            }
            return true;
        })
        .map((node) => {
            // --- SMART SANITIZER LOGIC ---
            // 1. Auto-Correction: Fix common AI hallucinations
            if (node.type.toLowerCase().includes('openai')) node.type = 'n8n-nodes-base.openAi';
            if (node.type === 'n8n-nodes-base.chatGpt') node.type = 'n8n-nodes-base.openAi';

            // 2. Fallback: Convert unknown/hallucinated nodes to HTTP Request
            if (!node.type.startsWith('n8n-nodes-base.')) {
                console.warn(`Sanitizer: Unknown node type '${node.type}' converted to HTTP Request.`);
                node.type = 'n8n-nodes-base.httpRequest';
                node.parameters = { ...node.parameters, url: 'https://httpbin.org/get' }; // Safe placeholder
            }
            // -----------------------------

            // Calculate fallback position based on depth
            const depth = nodeDepths[node.name] || 0;
            const indexInDepth = nodesByDepth[depth]?.indexOf(node.name) || 0;
            const fallbackX = 250 + depth * 400;
            const fallbackY = 300 + indexInDepth * 200;

            // Use original n8n position if available (n8n uses [x, y] array)
            // Ensure values are numbers
            const x = Array.isArray(node.position) && typeof node.position[0] === 'number' ? node.position[0] : fallbackX;
            const y = Array.isArray(node.position) && typeof node.position[1] === 'number' ? node.position[1] : fallbackY;

            let label = node.name;
            // Rename generic nodes matches "HTTP Request X", "Google Sheets X" etc.
            // Simple heuristic: if name contains type name + number, simplification
            // But user asked strictly: If a node has a specific type (e.g., n8n-nodes-base.googleSheets), rename the label to "Google Sheets" if the AI named it generic.

            if (node.type === 'n8n-nodes-base.googleSheets') label = 'Google Sheets';
            if (node.type === 'n8n-nodes-base.httpRequest') label = 'HTTP Request';
            if (node.type === 'n8n-nodes-base.webhook') label = 'Webhook';
            if (node.type === 'n8n-nodes-base.emailReadImap') label = 'Read Email';
            if (node.type === 'n8n-nodes-base.gmail') label = 'Gmail';
            if (node.type === 'n8n-nodes-base.slack') label = 'Slack';
            if (node.type === 'n8n-nodes-base.openAi') label = 'OpenAI'; // Add label for OpenAI

            // Override if the name seems custom (not just "HTTP Request 1")
            // Check if original name starts with the simplified label
            if (!node.name.startsWith(label) && !node.name.includes(label)) {
                // Keep original name if it's completely different (e.g. "Send to Admin")
                label = node.name;
            }

            return {
                id: node.name,
                type: 'workflowNode',
                position: { x, y },
                data: {
                    label: label,
                    type: node.type,
                    details: node
                }
            };
        });

    const edges: Edge[] = [];
    let edgeId = 0;

    // Map connections
    // n8nData.connections is Object of NodeName -> Outputs
    Object.keys(n8nData.connections).forEach((sourceNodeName) => {
        const outputs = n8nData.connections[sourceNodeName];

        // outputs is usually { main: [[...]], ... }
        Object.keys(outputs).forEach((outputType) => {
            const outputConnections = outputs[outputType];

            outputConnections.forEach((connections) => {
                connections.forEach((targetConn) => {
                    edges.push({
                        id: `e${edgeId++}`,
                        source: sourceNodeName,
                        target: targetConn.node,
                        label: outputType !== 'main' ? outputType : undefined, // Only label if not 'main'
                        type: 'smoothstep', // Tech/Circuit look
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                        animated: false, // Less distraction
                        style: { strokeWidth: 2 }
                    });
                });
            });
        });
    });

    return { nodes, edges };
}
// ... existing code ...

export const transformReactFlowToN8N = (nodes: any[], edges: any[]) => {
    const n8nNodes = nodes.map(node => ({
        parameters: node.data.parameters || {},
        type: node.data.type || node.type,
        typeVersion: node.data.typeVersion || 1,
        position: [node.position.x, node.position.y],
        id: node.id,
        name: node.data.label, // Using label as name
        credentials: node.data.credentials || {}
    }));

    const connections: Record<string, any> = {};

    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const sourceName = sourceNode.data.label;
        const targetName = targetNode.data.label;

        if (!connections[sourceName]) {
            connections[sourceName] = { main: [] };
        }

        // Ensure main exists (N8N structure usually has 'main' output)
        if (!connections[sourceName].main) {
            connections[sourceName].main = [];
        }

        // Find existing index group or create new one
        // Simplified: assuming single output connection for now or appending to first index
        let connectionList = connections[sourceName].main[0];
        if (!connectionList) {
            connectionList = [];
            connections[sourceName].main[0] = connectionList;
        }

        connectionList.push({
            node: targetName,
            type: "main",
            index: 0
        });
    });

    return {
        nodes: n8nNodes,
        connections: connections,
        pinData: {},
        meta: {
            instanceId: crypto.randomUUID()
        }
    };
};
