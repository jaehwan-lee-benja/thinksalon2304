<template>
    <h3>돈이 옮겨지는 방법 기록하기</h3>
    <div>
        언제: <input class="categoryStyle" v-model="when">
    </div>
    <div>
        방법: <input class="categoryStyle" v-model="method"> /
        방법 관련 메모: <input class="categoryStyle" v-model="methodMemo">
    </div>
    <div>
        일반 메모: <input class="categoryStyle" v-model="memo">
    </div>
    <button class="expenseDetailBtn" @click="upsertEdge()">업데이트</button>
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
    },
    mounted() {
        this.fetchEdgeData()
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
            this.when = selectedTarget.when
            this.method = selectedTarget.method
            this.methodMemo = selectedTarget.methodMemo
            this.memo = selectedTarget.memo
        },
        async upsertEdge() {
            const edgeDate = {
                id: this.getUuidv4(),
                source: this.clickedEdgeSourceId,
                target: this.clickedEdgeTargetId,
                when: this.when,
                method: this.method,
                method_memo: this.methodMemo,
                memo: this.memo,
                user_id: this.session.user.id
            }
            try {
                const { error } = await supabase
                    .from('edge')
                    .upsert(edgeDate)
                    .eq('id', edgeDate.id)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            } finally {
                // 성공하던 실패하던 실행되는 곳
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