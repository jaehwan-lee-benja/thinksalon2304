<template>
    <VNetworkGraph class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" />
</template>

<script>
import { VNetworkGraph } from "v-network-graph"
import "v-network-graph/lib/style.css"
import dagre from "dagre/dist/dagre.min.js"

export default {
    name: 'GraphExample',
    props: {
        samples: {
            type: Object,
            default: () => { }
        },
    },
    mounted() {
        this.formatExpenses()
        this.formatLayout()
    },
    data() {
        return {
            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            }
        }
    },
    methods: {
        formatLayout() {
            const nodeSize = 40
            const direction = "TB" // "TB" | "LR"
            if (Object.keys(this.nodes).length <= 1 || Object.keys(this.edges).length == 0) {
                return
            }

            // convert graph
            // ref: https://github.com/dagrejs/dagre/wiki
            const g = new dagre.graphlib.Graph()
            // Set an object for the graph label
            g.setGraph({
                rankdir: direction,
                nodesep: nodeSize * 2,
                edgesep: nodeSize,
                ranksep: nodeSize * 2,
            })
            // Default to assigning a new object as a label for each new edge.
            g.setDefaultEdgeLabel(() => ({}))

            // Add nodes to the graph. The first argument is the node id. The second is
            // metadata about the node. In this case we're going to add labels to each of
            // our nodes.
            Object.entries(this.nodes).forEach(([nodeId, node]) => {
                g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize })
            })

            // Add edges to the graph.
            Object.values(this.edges).forEach(edge => {
                g.setEdge(edge.source, edge.target)
            })

            dagre.layout(g)

            g.nodes().forEach((nodeId) => {
                // update node position
                const x = g.node(nodeId).x
                const y = g.node(nodeId).y
                this.layouts.nodes[nodeId] = { x, y }
            })
        },
        formatExpenses() {

            /*
             {
                node1: { name: "p1" },
                node2: { name: "p2" },
                node3: { name: "p3" },
                node4: { name: "p4" },
             }
             */

            const nodesResult = {}
            this.samples.forEach((e) => {
                nodesResult[e.id] = { 'name': e.name }
            })
            console.log("nodesResult = ", nodesResult)
            this.nodes = nodesResult
            
            /*
             {
                edge1: { source: "1", target: "2" },
                edge2: { source: "1", target: "4" },
                edge3: { source: "2", target: "3" },
            }
             */
            const edgeResult = {}
            this.samples.forEach((e) => {
                if(e.parentId != null) {
                    edgeResult[e.id] = { 'source': e.parentId,  'target': e.id }
                }
            })
            console.log("edgeResult = ", edgeResult)
            this.edges = edgeResult
        }
    },
    components: {
        VNetworkGraph
    }
}
</script>

<style scoped>
@import '../style.css';
</style>

