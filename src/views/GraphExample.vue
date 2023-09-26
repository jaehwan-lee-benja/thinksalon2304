<template>
    <div>hello world</div>
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
        this.test()
        this.formatLayout()
    },
    data() {
        return {
            nodes: {
                // node1: { name: "Node 1" },
                // node2: { name: "Node 2" },
                // node3: { name: "Node 3" },
                // node4: { name: "Node 4" },
            },
            edges: {
                edge1: { source: "1", target: "2" },
                edge2: { source: "1", target: "4" },
                edge3: { source: "2", target: "3" },
            },
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
        test() {
            // const nodesResult = this.samples.map(e => {
            //     return {['node'+this.samples.indexOf(e)]: {'name': e.name}}
            // })
            const samplesResult = {}
            /*
            {
                key: value,
                key: value,
                id: {}
            }
            */
            this.samples.forEach((e, i) => {
                console.log(i, e)
                //samplesResult['node' + (i + 1)] = { 'name': e.name }
                samplesResult[e.id] = { 'name': e.name }
            })
            console.log("samplesResult = ", samplesResult)

            console.log(this.nodes)
            console.log(this.edges)
            /*
             {
                node1: { name: "p1" },
                node2: { name: "p2" },
                node3: { name: "p3" },
                node4: { name: "p4" },
             }
             */
            this.nodes = samplesResult

            /*
             {
                edge1: { source: "1", target: "2" },
                edge2: { source: "1", target: "4" },
                edge3: { source: "2", target: "3" },
            }
             */
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

