<template>
    <div class="isolatedDivStyle">
        <div>
            <p>[경로]</p>
            <div class="isolatedTableDivStyle">
                <table>
                    <tr>
                        <td>
                            from:
                        </td>
                        <td>
                            <input class="categoryStyle" :value="this.sourceE + ' (계좌: ' + this.sourceA + ')'" readonly>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            to:
                        </td>
                        <td>
                            <input class="categoryStyle" :value="this.targetE + ' (계좌: ' + this.targetA + ')'" readonly>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div>
            <p>[이동 방법]</p>
            <div class="isolatedTableDivStyle">
                <table>
                    <tr>
                        <td>
                            언제:
                        </td>
                        <td>
                            <input class="categoryStyle" v-model="when">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            방법:
                        </td>
                        <td>
                            <input class="categoryStyle" v-model="method">
                        </td>
                    </tr>
                    <tr>
                        <td>
                        </td>
                        <td>
                            <input class="categoryStyle" v-model="methodMemo">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            메모:
                        </td>
                        <td>
                            <input class="categoryStyle" v-model="memo">
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <button class="expenseDetailBtn" @click="upsertEdge()">업데이트</button>
    </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'IsolatedEdgeModel',
    data() {
        return {
            when: "",
            method: "",
            methodMemo: "",
            memo: "",
            edge: "",
        }
    },
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        accounts: {
            type: Object,
            default: () => { }
        },
        clickedEdgeTargetId: {
            type: String,
            default: '',
        },
        clickedEdgeSourceId: {
            type: String,
            default: '',
        },
        session: {
            type: String,
            default: '',
        },
        selectedMonitor: {
            type: Boolean,
            default: true,
        }
    },
    mounted() {
        this.fetchEdgeData()
    },
    watch: {
        selectedMonitor: {
            handler() {
                this.selectEdge()
            },
            deep: true
        },
    },
    computed: {
        expenseChecked() {
            const expensesLength = this.expenses.length;
            if (expensesLength > 0) {
                return this.expenses
            } else {
                return { category: "로딩중.." }
            }
        },
        sourceE() {
            return this.expenseChecked.find((e) => e.id == this.clickedEdgeSourceId).category
        },
        targetE() {
            return this.expenseChecked.find((e) => e.id == this.clickedEdgeTargetId).category
        },
        sourceA() {
            const accountId = this.expenseChecked.find((e) => e.id == this.clickedEdgeSourceId).account_id
            let selectedAccount = this.accounts.find((a) => a.id == accountId)
            if (!selectedAccount) {
                selectedAccount = { name: "-" }
            }
            return selectedAccount.name
        },
        targetA() {
            const accountId = this.expenseChecked.find((e) => e.id == this.clickedEdgeTargetId).account_id
            let selectedAccount = this.accounts.find((a) => a.id == accountId)
            if (!selectedAccount) {
                selectedAccount = { name: "-" }
            }
            return selectedAccount.name
        },
    },
    methods: {
        async fetchEdgeData() {
            const a = await supabase
                .from('edge')
                .select()
            const { data } = a;
            this.edge = data;
            this.selectEdge()
        },
        selectEdge() {
            const selectedSource = this.edge.filter(e1 => e1.source == this.clickedEdgeSourceId);
            const selectedTarget = selectedSource.find(e2 => e2.target == this.clickedEdgeTargetId);
            console.log("selectedTarget = ", selectedTarget);
            if (selectedTarget) {
                this.when = selectedTarget.when
                this.method = selectedTarget.method
                this.methodMemo = selectedTarget.methodMemo
                this.memo = selectedTarget.memo
            } else {
                this.when = ""
                this.method = ""
                this.methodMemo = ""
                this.memo = ""
            }
        },
        async upsertEdge() {
            console.log("upsertEdge")
            const edgeData = {
                id: this.getUuidv4(),
                source: this.clickedEdgeSourceId,
                target: this.clickedEdgeTargetId,
                when: this.when,
                method: this.method,
                method_memo: this.methodMemo,
                memo: this.memo,
                user_id: this.session.user.id
            }
            console.log("edgeData = ", edgeData)
            try {
                const { error } = await supabase
                    .from('edge')
                    .upsert(edgeData)
                    .eq('id', edgeData.id)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            } finally {
                // 성공하던 실패하던 실행되는 곳
                console.log("upsertEdge done")
            }
        },
        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
    },
    components: {
    },
}
</script>

<style scoped>
@import '../style.css';
</style>