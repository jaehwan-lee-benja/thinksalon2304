<template>
    <div class="bottonControlDiv">
        <div class="flowViewBtnDiv">
            <button @click="showGraphFit" class="flowViewBtn">그래프 보기</button>
            <button @click="showGraphDefault" class="flowViewBtn">배치 초기화</button>
            <button @click="showCreateExpenseDiv" class="flowViewBtn">새 거점 만들기</button>
        </div>
        <div class="isolatedExpenseDiv">
            <div class="isolatedExpense" v-if="createExpenseDivHandler">
                <h3>신규 거점 만들기</h3>
                <button @click="closeCreateExpenseDiv" class="closeIsolatedBtn">창닫기</button>
                <IsolatedCreateExpense v-bind:expenses="expenses" :accounts="accounts"
                    @create-new-expense="createNewExpense" />
            </div>
            <div class="isolatedExpense" v-if="showClickedLiDiv">
                <h3>돈의 거점 정의하기</h3>
                <button @click="closeIsolated" class="closeIsolatedBtn">창닫기</button>
                <IsolatedModel v-bind:expenses="expenses" :expenseId="this.clickedExpenseId"
                    @remove-expense="removeExpense" :selectedPageId="selectedPageId"
                    :clickedExpenseId="clickedExpenseId" :accounts="accounts" @select-account="selectAccount" />
            </div>
            <div class="isolatedExpense" v-if="showClickedEdgeDiv">
                <h3>돈의 이동 정의하기</h3>
                <button @click="closeIsolated" class="closeIsolatedBtn">창닫기</button>
                <IsolatedEdgeModel v-bind:expenses="expenses" :accounts="accounts"
                    :clickedEdgeTargetId="this.clickedEdgeTargetId" :clickedEdgeSourceId="this.clickedEdgeSourceId"
                    :session="session" :selectedMonitor="selectedMonitor" />
            </div>
        </div>
    </div>

    <div class="graphDiv" ref="graphContainer" style="position: relative;">
        <VNetworkGraph ref="vng" class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
            :event-handlers="eventHandlers">

            <template #edge-label="{ edge, ...slotProps }">
                <VEdgeLabel :text="edge.label" v-bind="slotProps" />
            </template>

            <template #override-node-label="{
                nodeId, scale, x, y, config, textAnchor, dominantBaseline
            }">
                <text x="0" y="0" :font-size="config.fontSize * scale" :text-anchor="textAnchor"
                    :dominant-baseline="dominantBaseline" :fill="config.color" :transform="`translate(${x} ${y})`">
                    <tspan v-html="formatNodeName(nodeId)"></tspan>
                </text>
            </template>

        </VNetworkGraph>
        <div v-if="tooltip" class="tooltip"
            :style="{ position: 'absolute', top: tooltip.top + 'px', left: tooltip.left + 'px' }">
            {{ tooltip.content }}
        </div>
    </div>
</template>

<script>
import { VNetworkGraph, VEdgeLabel } from "v-network-graph"
import "v-network-graph/lib/style.css"
import dagre from "dagre/dist/dagre.min.js"
import IsolatedModel from './IsolatedModel.vue'
import IsolatedEdgeModel from './IsolatedEdgeModel.vue'
import IsolatedCreateExpense from './IsolatedCreateExpense.vue'
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
        clickedEdgeTargetId: {
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
        },
        newExpenseIdByCreatedPage: {
            type: Object,
            default: () => { }
        },
        createdExpenseIdForMonitor: {
            type: String,
            default: '',
        },
        session: {
            type: String,
            default: '',
        },
        createdExpenseIdByCreateNewE: {
            type: String,
            default: '',
        }
    },
    computed: {
        showClickedLiDiv() {
            return !!this.clickedExpenseId;
        },
        showClickedEdgeDiv() {
            return !!this.clickedEdgeTargetId;
        },
    },
    data() {
        return {
            createExpenseDivHandler: false,

            pageLengthMonitor: 0,

            nodeFromServer: [],
            dragStart: {},
            dragEnd: {},

            edgeFromServer: [],

            clickedEdgeSourceId: "",
            selectedMonitor: true,

            tooltip: null,

            nodes: {},
            edges: {},
            layouts: {
                nodes: {},
            },
            nodeLayoutsNew: [], // 새로 생선된 node의 위치값을 임시 저장
            tooltipTimeout: null, // 툴팁 지연을 위한 타이머 변수
            eventHandlers: {
                "edge:click": ({ edge }) => {
                    if (this.clickedExpenseId !== "") {
                        this.$emit('cancel-point-clicked-li');
                    }
                    const clickedTarget = this.edges[edge].expenseId;
                    this.$emit('point-clicked-Edge', clickedTarget);
                    const clickedSource = this.edges[edge].source;
                    this.clickedEdgeSourceId = clickedSource;
                    this.selectedMonitor = !this.selectedMonitor;
                },
                "node:click": ({ node }) => {
                    if (this.clickedEdgeTargetId !== "") {
                        this.$emit('cancel-point-clicked-edge');
                    }
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
                    // node:click과 겹치는 것을 방지하기 위해 undefined는 제외
                    if (endPoint) {
                        this.updateNodeLayoutLocal(node, endPoint.x, endPoint.y);
                    }

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
                    label: {
                        visible: true,
                    },
                    normal: {
                        type: "rect",
                        color: "#4a5c6a",
                        width: node => Math.pow(node.size / 300, 1 / 2),
                        height: node => Math.pow(node.size / 500, 1 / 2),
                        borderRadius: 2,
                        // radius: node => Math.pow(node.size / 1000, 1 / 2),
                        strokeWidth: 3,
                        strokeColor: "#11212D",
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
                    },
                    margin: 4,
                    marker: {
                        source: {
                            type: "none",
                            width: 2,
                            height: 2,
                            margin: -1,
                            offset: 0,
                            units: "strokeWidth",
                            color: null,
                        },
                        target: {
                            type: "arrow",
                            width: 2,
                            height: 2,
                            margin: -1,
                            offset: 0,
                            units: "strokeWidth",
                            color: null,
                        },
                    },
                    label: {
                        fontFamily: undefined,
                        fontSize: 11,
                        lineHeight: 1.1,
                        color: "#000000",
                        margin: 10,
                        background: {
                            visible: false,
                            color: "#ffffff",
                            padding: {
                                vertical: 1,
                                horizontal: 4,
                            },
                            borderRadius: 2,
                        },
                    },
                }
            },
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
                this.insertNodeLayouts()
            },
            deep: true
        },
        createdExpenseIdForMonitor: {
            handler() {
                this.insertInitiallNode()
            },
            xdeep: true
        },
        createdExpenseIdByCreateNewE: {
            handler() {
                this.pushInitiallNode()
            },
            xdeep: true
        }
    },
    mounted() {
        this.fetchDataForNode();
        this.fetchDataForEdge();
    },
    methods: {
        createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere, selectedAccountIdHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere, selectedAccountIdHere);
            this.createExpenseDivHandler = false;
        },
        showCreateExpenseDiv() {
            this.$emit('cancel-point-clicked-li');
            this.$emit('cancel-point-clicked-edge');
            this.createExpenseDivHandler = true;
        },
        closeCreateExpenseDiv() {
            this.createExpenseDivHandler = false;
        },
        formatNodeName(nodeIdHere) {
            const eachE = this.expenses.find((e) => nodeIdHere == e.id);

            if (eachE) {

                const account = this.accounts.find((a) => a.id == eachE.account_id);

                let accountName = ""
                if (account) {
                    accountName = account.name
                } else {
                    accountName = "-"
                }

                return `<tspan x="0%" text-anchor="middle">${eachE.category}</tspan><tspan x="0%" text-anchor="middle" dx="0" dy="1.2em">(${accountName})</tspan>`;

            }
        },
        async insertInitiallNode() {
            const nodeLayout = {
                id: this.getUuidv4(),
                user_id: this.session.user.id,
                expense_id: this.createdExpenseIdForMonitor,
                x: null,
                y: null,
            }
            await this.insertNodeLayout(nodeLayout)
        },

        async pushInitiallNode() {
            const nodeLayout = {
                id: this.getUuidv4(),
                user_id: this.session.user.id,
                expense_id: this.createdExpenseIdByCreateNewE,
                x: null,
                y: null,
            }
            await this.nodeLayoutsNew.push(nodeLayout)
        },

        insertNodeLayouts() {
            this.nodeLayoutsNew.forEach((e) => this.insertNodeLayout(e))
            this.nodeLayoutsNew = []
        },

        async fetchDataForNode() {
            const a = await supabase
                .from('node')
                .select()
            const { data } = a;
            this.nodeFromServer = data
        },

        async fetchDataForEdge() {
            const a = await supabase
                .from('edge')
                .select()
            const { data } = a;
            this.edgeFromServer = data
        },

        async updateNodeLayout(nodeLayoutHere) {
            try {
                const { error } = await supabase
                    .from('node')
                    .update(nodeLayoutHere)
                    .eq('id', nodeLayoutHere.id)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
            await this.fetchDataForNode();
        },

        async insertNodeLayout(nodeLayoutHere) {
            try {
                const { error } = await supabase
                    .from('node')
                    .insert(nodeLayoutHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
            await this.fetchDataForNode();
        },

        async updateNodeLayoutLocal(expenseIdHere, xHere, yHere) {

            const nodeLayout = { expense_id: expenseIdHere, x: xHere, y: yHere }

            const expensesLength = this.expenses.length;
            if (expensesLength > 0) {

                // 기존의 node인지 체크한 후, new인 경우, node id 생성하기
                const expenseIdArr = []
                this.nodeFromServer.forEach(e => expenseIdArr.push(e.expense_id))
                const isNew = expenseIdArr.indexOf(expenseIdHere) < 0

                if (!isNew) {
                    nodeLayout.id = this.nodeFromServer.find(e => e.expense_id === expenseIdHere).id
                    this.updateNodeLayout(nodeLayout)
                } else {
                    const expenseIdFromNew = this.nodeLayoutsNew.map((e) => e.expense_id)
                    if (expenseIdFromNew.length > 0) {

                        // 기존에 포함되어있는 값인지 확인하기
                        const isIncluded = expenseIdFromNew.includes(nodeLayout.expense_id)

                        if (isIncluded) {
                            // 포함이 되어있는 경우

                            // 기존 배열 중 동일한 expense_id의 요소 찾기
                            const isNodeLayout = (element) => {
                                if (element.expense_id === nodeLayout.expense_id) {
                                    return true;
                                }
                            }
                            const oldValue = this.nodeLayoutsNew.find(isNodeLayout);

                            // 기존 값에서 id 가져오기
                            nodeLayout.id = oldValue.id

                            // 배열에서 과거 값을 지금 값으로 바꾸기
                            const updateArray = (arrHere, oldValueHere, newValueHere) => {
                                const index = arrHere.indexOf(oldValueHere);
                                if (index !== -1) {
                                    arrHere[index] = newValueHere;
                                }
                            }

                            updateArray(this.nodeLayoutsNew, oldValue, nodeLayout)

                        } else {
                            // 포함이 안되어있는 경우
                            nodeLayout.id = this.getUuidv4();
                            await this.nodeLayoutsNew.push(nodeLayout)
                        }
                    } else {
                        nodeLayout.id = this.getUuidv4();
                        this.nodeLayoutsNew.push(nodeLayout)
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

            this.expenses.forEach((e) => {
                const account = this.accounts.find((a) => a.id == e.account_id)
                let accountName = ""
                if (account) {
                    accountName = account.name
                } else {
                    accountName = "계좌매칭 안됨"
                }
                nodesResult[e.id] = {
                    'id': e.id,
                    'name': `${e.category} (${accountName})`,
                    'size': e.amount
                };

                let edgeLabel = ""

                this.edgeFromServer.forEach((edge) => {
                    if (edge.source == e.parents_id && edge.target == e.id) {
                        edgeLabel = edge.when + " / " + edge.method
                    }
                })

                if (e.parents_id != null) {
                    edgeResult[e.id] = {
                        'expenseId': e.id,
                        'source': e.parents_id,
                        'target': e.id,
                        'size': e.amount,
                        'label': edgeLabel
                    };
                }

            });

            this.nodes = nodesResult
            this.edges = edgeResult
            this.layouts.nodes = this.formatLayout();

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
            if (this.nodeFromServer.length > 0) {
                normalIdArray.forEach((expenseId) => {
                    const xFromServer = this.nodeFromServer.find((n) => n.expense_id == expenseId).x
                    const yFromServer = this.nodeFromServer.find((n) => n.expense_id == expenseId).y
                    nodeLayouts[expenseId] = { 'x': xFromServer, 'y': yFromServer }
                })
            }

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

            console.log("this.session = ", this.session)

            let userId = ""

            if (this.session) {
                userId = this.session.user.id
            }

            newIdArray.forEach((expenseId) => {
                nodeLayouts[expenseId] = defaultResult[expenseId]
                // 편집한 내용 저장 시, 서버로 upsert되기위해 담아두기
                const nodeLayoutNew = {
                    id: this.getUuidv4(),
                    expense_id: expenseId,
                    x: nodeLayouts[expenseId].x,
                    y: nodeLayouts[expenseId].y,
                    user_id: userId
                }
                this.nodeLayoutsNew.push(nodeLayoutNew)
            })


            // 삭제될 e인 경우
            willBeDeletedIdArray.forEach((expenseId) => {
                delete nodeLayouts[expenseId];
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
            // node가 1개인 경우, formatLayoutDefault는 undefined가 된다. => 거르기
            if (defaultResult) {
                this.layouts.nodes = defaultResult
                this.expenses.forEach((e) => {
                    this.updateNodeLayoutLocal(e.id, defaultResult[e.id].x, defaultResult[e.id].y)
                })
            }
            this.setGraphFit();
        },

        showGraphFit() {

            const nodeLayouts = {}
            const newExpenseIds = this.nodeLayoutsNew.map((n) => n.expense_id)
            let foundNode = []

            this.expenses.forEach((e) => {

                const isNewExpense = newExpenseIds.includes(e.id);
                if (isNewExpense) {
                    foundNode = this.nodeLayoutsNew.find((n) => n.expense_id == e.id)
                } else {
                    foundNode = this.nodeFromServer.find((n) => n.expense_id == e.id)
                }

                nodeLayouts[e.id] = {
                    'category': e.category,
                    'x': foundNode.x,
                    'y': foundNode.y
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

        closeIsolated() {
            this.closeCreateExpenseDiv();
            this.$emit('cancel-point-clicked-li');
            this.$emit('cancel-point-clicked-edge');
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
        IsolatedModel,
        IsolatedEdgeModel,
        IsolatedCreateExpense,
        VEdgeLabel
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