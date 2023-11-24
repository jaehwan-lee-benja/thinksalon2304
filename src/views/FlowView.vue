<template>
    <button @click="formatExpenses" :class="flowViewBtn">새로고침</button>
    <div :class="graphDiv">
        <VNetworkGraph ref="vng" class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs" />
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
    data() {
        return {
            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            configs: {
                view: {
                    fitContentMargin: 20,
                    grid: {
                        visible: false,
                        interval: 20
                    },
                    autoPanAndZoomOnLoad: "fit-content",
                    autoPanOnResize: false,
                    // onBeforeInitialDisplay: () => this.formatExpenses(),
                },
                node: {
                    normal: {
                        type: "circle",
                        color: "#3774CC",
                        radius: node => Math.pow(node.size / 50, 1 / 3),
                    },
                    hover: {
                        color: "#F6C5C5",
                    }
                },
                edge: {
                    normal: {
                        width: edge => Math.pow(edge.size / 100, 1 / 4),
                        color: "#D3D2D0"
                    },
                    hover: {
                        color: "#F6C5C5",
                    }
                }
            },
            flowViewDiv2: 'flowViewDiv2',
            graphDiv: 'graphDiv',
            flowViewBtn: 'flowViewBtn',
        }
    },
    watch: {
        expenses: {
            handler() {
                const expensesLength = this.expenses.length;
                if(expensesLength > 0) {
                    this.formatExpenses()
                }
                console.log("* =", this.expenses)
            },
            deep:true
        }
    },
    methods: {
        formatLayout() {
            const nodeSize = 30
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
                nodesep: nodeSize,
                edgesep: nodeSize,
                ranksep: nodeSize * 4,
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
                // console.log(nodeId, " | ", x, " | ", y)
            })



        },
        formatExpenses() {

            console.log("check!")
            


                const nodesResult = {}
                this.expenses.forEach((e) => {
                    nodesResult[e.id] = { 'name': e.category, 'size': e.amount }
                })
                this.nodes = nodesResult

                const edgeResult = {}
                this.expenses.forEach((e) => {
                    if (e.parents_id != null) {
                        edgeResult[e.id] = { 'source': e.parents_id, 'target': e.id, 'size': e.amount }
                    }
                })
                this.edges = edgeResult

                this.formatLayout()

                const vngref = this.$refs.vng
                vngref?.transitionWhile(() => vngref.fitToContents())


        },

    },
    components: {
        VNetworkGraph
    }
}
</script>

<style scoped>
@import '../style.css';
</style>

