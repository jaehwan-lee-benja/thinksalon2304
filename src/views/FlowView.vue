<template>
    <div class="flowViewBtnDiv">
        <button @click="showGraphFit" class="flowViewBtn">그래프 보기</button>
        <button @click="showGraphDefault" class="flowViewBtn2">배치 초기화</button>
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
// import * as vNG from "v-network-graph"
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
        fetchedExpenses: {
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
        },
        editExpenseWorked: {
            type: Boolean,
            default: true,
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
            dragStart: {},
            dragEnd: {},

            tooltip: null,

            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            layoutNodesNew: [], // 새로 생선된 node의 위치값을 임시 저장
            layoutNodeIdDelete: [], // 삭제될 nodeId 처리하기
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
                "node:dragstart": (startPoint) => {
                    this.dragStart = startPoint
                },
                "node:dragend": (endPoint) => {
                    this.dragEnd = endPoint
                },
                "node:pointerup": ({ node }) => {
                    const endPoint = this.dragEnd[node]
                    this.updateNodeLayout(node, endPoint.x, endPoint.y);
                },
            },
            configs: {
                view: {
                    grid: {
                        visible: true,
                        interval: 20
                    },
                    doubleClickZoomEnabled: false,
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
    watch: {
        expenses: {
            handler() {
                const expensesLength = this.expenses.length;
                if (expensesLength > 0) {
                    this.$nextTick(() => {
                        this.formatExpenses()
                    });
                }
            },
            deep: true
        },
        editExpenseWorked: {
            handler() {
                this.upsertOrDeleteLayoutNodes()
            },
            deep: true
        },
    },
    mounted() {
        document.addEventListener("click", this.handleDocumentClick); // [질문] 이것을 어떻게 바꿀 수 있을까?
        // this.$el.addEventListener("click", this.handleDocumentClick);
        this.fetchDataForNode();
    },
    methods: {
        upsertOrDeleteLayoutNodes() {
            this.layoutNodesNew.forEach((e) => this.upsertNodeLayout(e))
            this.layoutNodesNew = []
            this.layoutNodeIdDelete.forEach((eId) => this.deleteNodeLayout(eId))
            this.layoutNodeIdDelete = []
        },
        async fetchDataForNode() {
            const a = await supabase
                .from('node')
                .select()
            const { data } = a;
            this.nodeFromServer = data
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

        async deleteNodeLayout(nodeIdHere) {
            try {
                const { error } = await supabase
                    .from('node')
                    .delete()
                    .eq('id', nodeIdHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
        },

        updateNodeLayout(expenseIdHere, xHere, yHere) {

            const nodeLayout = { expense_id: expenseIdHere, x: xHere, y: yHere }

            const expensesLength = this.expenses.length;
            if (expensesLength > 0) {

                // 기존의 node인지 체크한 후, new인 경우, node id 생성하기
                const expenseIdArr = []
                this.nodeFromServer.forEach(e => expenseIdArr.push(e.expense_id))
                const isNew = expenseIdArr.indexOf(expenseIdHere) < 0

                if (!isNew) {
                    nodeLayout.id = this.nodeFromServer.filter(e => e.expense_id === expenseIdHere)[0].id
                    this.upsertNodeLayout(nodeLayout)
                } else {
                    const expenseIdFromNew = this.layoutNodesNew.map((e) => e.expense_id)
                    if (expenseIdFromNew.length > 0) {

                        // 기존에 포함되어있는 값인지 확인하기
                        const isIncluded = expenseIdFromNew.includes(nodeLayout.expense_id)

                        if (isIncluded) {
                            // 포함이 되어있는 경우

                            // 기존 배열 중 동일한 expense_id의 요소 찾기
                            const isLayoutNode = (element) => {
                                if (element.expense_id === nodeLayout.expense_id) {
                                    return true;
                                }
                            }
                            const oldValue = this.layoutNodesNew.find(isLayoutNode);

                            // 기존 값에서 id 가져오기
                            nodeLayout.id = oldValue.id

                            // 배열에서 과거 값을 지금 값으로 바꾸기
                            const updateArray = (arrHere, oldValueHere, newValueHere) => {
                                const index = arrHere.indexOf(oldValueHere);
                                if (index !== -1) {
                                    arrHere[index] = newValueHere;
                                }
                            }

                            updateArray(this.layoutNodesNew, oldValue, nodeLayout)

                        } else {
                            // 포함이 안되어있는 경우
                            nodeLayout.id = this.getUuidv4();
                            this.layoutNodesNew.push(nodeLayout)
                        }
                    } else {
                        nodeLayout.id = this.getUuidv4();
                        this.layoutNodesNew.push(nodeLayout)
                    }
                }

            }

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

        formatExpenses() {

            const nodesResult = {}
            const edgeResult = {}

            // layout 정리
            let nodeLayoutResult = {}
            if (this.expenses.length > 1) {
                nodeLayoutResult = this.formatLayout();
            } else {
                nodeLayoutResult = this.formatLayoutDefault()
            }

            this.expenses.forEach((e) => {
                nodesResult[e.id] = { 'id': e.id, 'name': e.category, 'size': e.amount };

                if (e.parents_id != null) {
                    edgeResult[e.id] = { 'id': e.id, 'source': e.parents_id, 'target': e.id, 'size': e.amount };
                }

            });

            this.nodes = nodesResult
            this.edges = edgeResult
            this.layouts.nodes = nodeLayoutResult

            this.setGraphFit();


        },

        formatLayout() {

            // 최종적인 값이 담길 오브젝트
            const nodeLayouts = {}

            // 삭제 및 신규 node를 추려내야한다.
            const idArray = this.expenses.map(e => e.id);
            const fetchedIdArray = this.fetchedExpenses.map(e => e.id);

            // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기 => 삭제된 것
            const willBeDeletedIdArray = fetchedIdArray.filter(eachId => !idArray.includes(eachId));

            // Array 중 기존 fetchedIdArray에 없는 id를 필터링해서 모으기 => 새로 생긴 것
            const newIdArray = idArray.filter(eachId => !fetchedIdArray.includes(eachId));

            // normal을 찾기 위해 위 두 배열의 합집합을 구한다, 그리고 전체C에서 차집합한다.
            const setA = new Set(willBeDeletedIdArray)
            const setB = new Set(newIdArray)
            const setC = new Set(idArray)
            const union = new Set([...setA, ...setB]);
            const difference = new Set([...setC].filter(x => !union.has(x))); // set1 - set2

            // 전체 idArray에서 차집합한다.
            const normalIdArray = Array.from(difference)

            // 기존에 있는 e인 경우
            normalIdArray.forEach((expenseId) => {

                const xFromServer = this.nodeFromServer.filter((n) => n.expense_id == expenseId)[0].x
                const yFromServer = this.nodeFromServer.filter((n) => n.expense_id == expenseId)[0].y
                nodeLayouts[expenseId] = { 'x': xFromServer, 'y': yFromServer }

            })

            // 새로운 e인 경우
            // 이 경우에 대한 서버, 로컬 단의 구분정리가 필요하다.
            const newExpenses = []

            this.expenses.forEach((e) => {
                newIdArray.forEach((expenseId) => {
                    if (e.id == expenseId) {
                        newExpenses.push(e)
                    }
                })
            })

            newExpenses.forEach((e) => {

                this.nodes[e.id] = { 'id': e.id, 'name': e.category, 'size': e.amount };

                if (e.parents_id != null) {
                    this.edges[e.id] = { 'id': e.id, 'source': e.parents_id, 'target': e.id, 'size': e.amount };
                }

            })

            const defaultResult = this.formatLayoutDefault()

            newIdArray.forEach((expenseId) => nodeLayouts[expenseId] = defaultResult[expenseId])

            // 삭제될 e인 경우
            willBeDeletedIdArray.forEach((expenseId) => {
                delete nodeLayouts[expenseId];
                this.layoutNodeIdDelete.push(expenseId)
            })

            return nodeLayouts

        },

        formatLayoutDefault() {
            // 최초 생길 때, 디폴트 버튼을 누를 때 진행되는 함수

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

            const defaultXYs = {}

            g.nodes().forEach((nodeId) => {

                // update node position
                const x = g.node(nodeId).x
                const y = g.node(nodeId).y
                defaultXYs[nodeId] = { x, y }

            })

            return defaultXYs

        },

        showGraphDefault() {
            const defaultResult = this.formatLayoutDefault()
            this.layouts.nodes = defaultResult
            this.expenses.forEach((e) => {
                this.updateNodeLayout(e.id, defaultResult[e.id].x, defaultResult[e.id].y)
            })
            this.setGraphFit();
        },

        showGraphFit() {

            const nodeLayouts = {}
            this.expenses.forEach((e) => {
                nodeLayouts[e.id] = {
                    'category': e.category,
                    'x': this.nodeFromServer.filter((n) => n.expense_id == e.id)[0].x,
                    'y': this.nodeFromServer.filter((n) => n.expense_id == e.id)[0].y
                }
            })

            this.layouts.nodes = nodeLayouts

            this.setGraphFit();

        },

        setGraphFit() {
            const vngref = this.$refs.vng

            vngref?.setViewBox({
                left: 0,
                top: 0,
                right: 500,
                bottom: 500,
            })

            vngref?.transitionWhile(() => vngref.fitToContents(), { duration: 0 })
        },

        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
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

