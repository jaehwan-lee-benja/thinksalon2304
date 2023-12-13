<template>
    <button @click="formatExpenses" :class="flowViewBtn">새로고침</button>
    <!-- <div :class="graphDiv"> -->
    <div :class="graphDiv" ref="graphContainer">
        <VNetworkGraph ref="vng" class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
            :event-handlers="eventHandlers" />
        <!-- <div v-for="node in Object.keys(nodes)" :key="'overlay-' + node" class="node-overlay" :style="{
            left: `${layouts.nodes[node].x}px`,
            top: `${layouts.nodes[node].y}px`,
        }"> // [질문] template에 넣는게 좋을까?
            {{ nodes[node].size }}
        </div> -->
    </div>
</template>

<script>
import CssData from './CssData.vue'
import { VNetworkGraph } from "v-network-graph"
// import { EventHandlers } from "v-network-graph" // [질문] 이것은 빼는게 좋을까?
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
    mixins: [CssData],
    data() {
        return {
            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            tooltipElement: null,
            tooltipTimeout: null, // 추가: 툴팁 지연을 위한 타이머 변수
            eventHandlers: {
                "node:click": ({ node }) => {
                    // 여기서 노드 위에 표시할 정보를 설정하세요
                    const amount = this.nodes[node].size;
                    // 예시: 콘솔에 금액을 출력
                    console.log(`${amount}`);
                },
                "node:pointerover": ({ node, event }) => {
                    // 추가: 기존 툴팁 제거
                    this.removeTooltip();
                    // 추가: 툴팁 생성 지연
                    this.tooltipTimeout = setTimeout(() => {
                        const amount = this.nodes[node].size;
                        const name = this.nodes[node].name;
                        this.tooltipElement = document.createElement('div');
                        this.tooltipElement.textContent = `${name} : ${amount}`;
                        this.tooltipElement.className = 'tooltip';
                        this.tooltipElement.style.position = 'absolute';
                        this.setTooltipPosition(event.clientX, event.clientY);

                        // 그래프 컨테이너에 추가
                        this.$refs.graphContainer.appendChild(this.tooltipElement);
                    }, 200); // 500ms 지연
                },
                "node:pointerout": () => {
                    // 추가: 기존 툴팁 제거
                    this.removeTooltip();
                },
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
                        // radius: node => node.size / 60000
                        radius: node => Math.pow(node.size / 1000, 1 / 2),
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
            }
        }
    },
    watch: {
        expenses: {
            handler() {
                const expensesLength = this.expenses.length;
                if (expensesLength > 0) {
                    this.formatExpenses()
                }
            },
            deep: true
        }
    },
    methods: {

        showTooltip(node, event) {
            console.log("showTooltip")
            // 추가: 마우스 이벤트 디바운싱
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
            }

            this.tooltipTimeout = setTimeout(() => {
                const amount = this.nodes[node].size;
                this.createTooltip(amount, event.clientX, event.clientY);
            }, 100); // 적절한 딜레이 값을 설정합니다.
        },
        setTooltipPosition(x, y) {
            // 추가: 툴팁 위치 조정
            if (this.tooltipElement) {
                this.tooltipElement.style.top = `${y}px`;
                this.tooltipElement.style.left = `${x}px`;
            }
        },

        removeTooltip() {
            // 추가: 툴팁 제거
            if (this.tooltipElement) {
                this.tooltipElement.remove();
                this.tooltipElement = null;
            }
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
        },
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
            })



        },
        formatExpenses() {

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
        VNetworkGraph,
    },
    beforeUnmount() {
        // 추가: 컴포넌트가 파괴되기 전에 기존 툴팁 제거 및 타이머 해제
        this.removeTooltip();
        this.tooltipTimeout = null;
    }
}
</script>

<style>
/* [질문]scoped를 없애도 될까? */
@import '../style.css';

.tooltip {
    background-color: #EFEFEF;
    font-size: 12px;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}
</style>

