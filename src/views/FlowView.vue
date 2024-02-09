<template>
    <div class="flowViewBtnDiv">
        <button @click="showGraph" class="flowViewBtn">그래프 보기</button>
        <button @click="formatExpenses" class="flowViewBtn2">배치 초기화</button>
    </div>
    <div class="isolatedExpenseDiv">
        <div class="isolatedExpense" v-if="showClickedLiDiv" ref="isolatedContainer">
            <IsolatedModel v-bind:expenses="expenses" :expenseId="this.clickedExpenseId" @remove-expense="removeExpense"
                :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId" :accounts="accounts"
                @select-account="selectAccount" />
        </div>
    </div>
    <div class="graphDiv" ref="graphContainer" style="position: relative;">
        <VNetworkGraph ref="vng" class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
            :event-handlers="eventHandlers" />
        <div v-if="tooltip" class="tooltip"
            :style="{ position: 'absolute', top: tooltip.top + 'px', left: tooltip.left + 'px' }">
            {{ tooltip.content }}
        </div>
    </div>
</template>

<script>
import { VNetworkGraph } from "v-network-graph"
import "v-network-graph/lib/style.css"
import * as vNG from "v-network-graph"
import dagre from "dagre/dist/dagre.min.js"
import IsolatedModel from './IsolatedModel.vue'
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'FlowView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        clickedExpenseId: {
            type: String,
            default: '',
        },
        accounts: {
            type: Object,
            default: () => { }
        }
    },
    computed: {
        showClickedLiDiv() {
            return !!this.clickedExpenseId;
        }
    },
    data() {
        return {
            nodeFromServer: [],

            tooltip: null,

            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            tooltipTimeout: null, // 툴팁 지연을 위한 타이머 변수
            eventHandlers: {
                "node:click": ({ node }) => {
                    const id = this.nodes[node].id;
                    this.$emit('point-clicked-li', id);
                },
                "node:pointerover": ({ node, event }) => {
                    this.setTooltipFromEvent(node, event);
                },
                "node:pointerout": () => {
                    this.removeTooltip();
                },
                "node:pointerup": ({ node, event }) => {
                    // console.log("event =", event)
                    // console.log("pointerup =", node, event.x, event.y)
                    // this.getNodeLayout(node, event.x, event.y);

                    ///

                    const graphContainerRect = this.$refs.graphContainer.getBoundingClientRect();

                    // 클릭된 노드의 좌표를 가져옵니다
                    const clickedNodeX = event.clientX;
                    const clickedNodeY = event.clientY;

                    console.log("clicked =", clickedNodeX, clickedNodeY);

                    // 그래프 컨테이너의 위치를 기준으로 클릭된 노드의 상대적인 좌표를 계산합니다
                    const relativeX = clickedNodeX - graphContainerRect.left;
                    const relativeY = clickedNodeY - graphContainerRect.top;

                    console.log("grahRef =", graphContainerRect.left, graphContainerRect.top);

                    console.log("relative =", relativeX, relativeY);

                    // 서버에 전송할 데이터를 구성합니다
                    this.getNodeLayout(node, relativeX, relativeY);

                    console.log("pointerup =", node, relativeX, relativeY)

                    ///

                    // const vng = this.$refs.vng; // VNetworkGraph 컴포넌트 참조 가져오기
                    // if (vng) {
                    //     const graphCoords = vng.graphCoordsFromEvent(event); // 이벤트를 기반으로 그래프 내 좌표 가져오기
                    //     const { x, y } = graphCoords;
                    //     this.getNodeLayout(node, x, y); // 그래프 내 좌표를 사용하여 노드 레이아웃 업데이트
                    // }

                },
            },
            configs: {
                view: {
                    fitContentMargin: 20,
                    grid: {
                        visible: true,
                        interval: 20
                    },
                    // autoPanAndZoomOnLoad: "fit-content",
                    autoPanOnResize: false,
                    doubleClickZoomEnabled: false,
                    layoutHandler: new vNG.GridLayout({ grid: 20 })
                },
                node: {
                    normal: {
                        type: "circle",
                        color: "#4a5c6a",
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
                        color: "#4a5c6a",
                    }
                }
            }
        }
    },
    // watch: {
    //     expenses: {
    //         handler() {
    //             const expensesLength = this.expenses.length;
    //             if (expensesLength > 0) {
    //                 this.$nextTick(() => {
    //                     this.formatExpenses()
    //                 });
    //             }
    //         },
    //         deep: true
    //     }
    // },
    mounted() {
        document.addEventListener("click", this.handleDocumentClick); // [질문] 이것을 어떻게 바꿀 수 있을까?
        // this.$el.addEventListener("click", this.handleDocumentClick);
        this.fetchDataForNode();
    },
    methods: {
        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
        async fetchDataForNode() {
            const a = await supabase
                .from('node')
                .select()
            const { data } = a;
            this.nodeFromServer = data
        },
        getNodeLayout(expenseIdHere, xHere, yHere) {

            const nodeLayout = { expense_id: expenseIdHere, x: xHere, y: yHere }

            const expensesLength = this.expenses.length;
            if (expensesLength > 0) {

                // 기존의 node인지 체크하기
                const expenseIdArr = []
                this.nodeFromServer.forEach(e => {
                    expenseIdArr.push(e.expense_id)
                })

                const isNew = expenseIdArr.indexOf(expenseIdHere) < 0

                if (!isNew) {
                    nodeLayout.id = this.nodeFromServer.filter(e => e.expense_id === expenseIdHere)[0].id
                } else {
                    nodeLayout.id = this.getUuidv4();
                }

                this.upsertNodeLayout(nodeLayout)
            }

        },
        async upsertNodeLayout(nodeLayoutHere) {
            try {
                const { error } = await supabase
                    .from('node')
                    .upsert(nodeLayoutHere)
                    .eq('id', nodeLayoutHere.id)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
            this.fetchDataForNode();
        },
        selectAccount(expenseIdHere, accountIdHere) {
            this.$emit('select-account', expenseIdHere, accountIdHere)
        },
        removeExpense(expenseHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-expense', expenseHere)
            }
        },
        handleDocumentClick(event) {
            // 클릭이 그래프 컨테이너 외부에서 발생했는지 확인합니다
            const graphContainer = this.$refs.graphContainer;
            const isolatedContainer = this.$refs.isolatedContainer;
            if (graphContainer || !graphContainer.contains(event.target)) {
                // 클릭이 그래프 컨테이너 외부에서 발생한 경우, 노드 클릭 효과를 취소합니다
                if (isolatedContainer != null && !isolatedContainer.contains(event.target)) {
                    this.$emit('cancel-point-clicked-li');
                }
            }
        },

        setTooltipFromEvent(node, event) {
            this.removeTooltip();

            this.tooltipTimeout = setTimeout(() => {
                const amount = this.nodes[node].size.toLocaleString();
                const name = this.nodes[node].name;

                // 상대적인 위치 계산을 통해 툴팁을 설정
                const relativePosition = this.calculateRelativePosition(event, this.$refs.graphContainer);
                this.setTooltip({
                    content: `${name} : ${amount}`,
                    ...relativePosition
                });
            }, 200);
        },

        calculateRelativePosition(event, container) {
            // container에서의 상대적인 위치 계산
            const containerRect = container.getBoundingClientRect();
            const top = event.clientY - containerRect.top;
            const left = event.clientX - containerRect.left;

            return { top, left };
        },

        setTooltip({ content, top, left }) {
            this.tooltip = { content, top, left };
        },

        removeTooltip() {
            this.tooltip = null;
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
                // 라이브러리에 있는 알고리즘에 의한 xy로 서버에 배치
                this.getNodeLayout(nodeId, x, y)
            })

        },
        formatExpenses() {


            const nodesResult = {}
            const edgeResult = {}

            this.expenses.forEach((e) => {
                nodesResult[e.id] = { 'id': e.id, 'name': e.category, 'size': e.amount };

                if (e.parents_id != null) {
                    edgeResult[e.id] = { 'id': e.id, 'source': e.parents_id, 'target': e.id, 'size': e.amount };
                }
            });

            this.nodes = nodesResult
            this.edges = edgeResult

            // const nodeLayouts = {}
            // nodeLayouts['986d3931-9c08-43d3-a03f-9c5d6ace6e4c'] = {'x':500,'y':300}
            // this.layouts.nodes = nodeLayouts


            this.formatLayout()

            const vngref = this.$refs.vng

            vngref?.transitionWhile(() => vngref.fitToContents(), { duration: 0 })


        },
        showGraph() {


            const nodesResult = {}
            const edgeResult = {}

            this.expenses.forEach((e) => {
                nodesResult[e.id] = { 'id': e.id, 'name': e.category, 'size': e.amount };

                if (e.parents_id != null) {
                    edgeResult[e.id] = { 'id': e.id, 'source': e.parents_id, 'target': e.id, 'size': e.amount };
                }
            });

            this.nodes = nodesResult
            this.edges = edgeResult

            // const nodeLayouts = {}
            // nodeLayouts['986d3931-9c08-43d3-a03f-9c5d6ace6e4c'] = {'x':500,'y':300}
            // this.layouts.nodes = nodeLayouts

            const nodeLayouts = {}
            this.expenses.forEach((e) => {
                nodeLayouts[e.id] = {
                    'category': e.category,
                    'x': this.nodeFromServer.filter((n) => n.expense_id == e.id)[0].x,
                    'y': this.nodeFromServer.filter((n) => n.expense_id == e.id)[0].y
                }
            })
            nodeLayouts["8e92738d-b636-424d-a711-dbd398641c82"] = { 'category': '기준', 'x': 0, 'y': 0 }
            this.layouts.nodes = nodeLayouts
            console.log("** = ", this.layouts.nodes)

            const vngref = this.$refs.vng

            vngref?.transitionWhile(() => vngref.fitToContents(), { duration: 0 })


        },

    },
    components: {
        VNetworkGraph,
        IsolatedModel
    },

}
</script>

<style>
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

