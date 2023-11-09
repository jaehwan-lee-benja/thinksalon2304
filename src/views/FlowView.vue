<template>
    <button @click="formatExpenses" :class="flowViewBtn">새로고침</button>
    <div :class="graphDiv">
        <VNetworkGraph class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"/>
    </div>
</template>

<script>
import { VNetworkGraph } from "v-network-graph"
import "v-network-graph/lib/style.css"
import dagre from "dagre/dist/dagre.min.js"

export default {
    name: 'FlowView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
    },
    mounted() {
        this.formatExpenses()
    },
    data() {
        return {
            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            configs: {
              node : {
                normal: {
                    color: "#336699",
                    radius: node => Math.pow(node.size/100, 1/4)
                }
              }
            },
            graphDiv: 'graphDiv',
            flowViewBtn: 'flowViewBtn',
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

            const expensesLength = Object.keys(this.expenses).length;
            if(expensesLength > 0) {

                const nodesResult = {}
                this.expenses.forEach((e) => {
                    nodesResult[e.id] = { 'name': e.category, 'size': e.amount }
                })
                this.nodes = nodesResult
                
                const edgeResult = {}
                this.expenses.forEach((e) => {
                    if(e.parents_id != null) {
                        edgeResult[e.id] = { 'source': e.parents_id,  'target': e.id }
                    }
                })
                this.edges = edgeResult
            }
            this.formatLayout()
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

