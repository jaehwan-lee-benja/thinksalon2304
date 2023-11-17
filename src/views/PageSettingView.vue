<template>
    <div :class="pageListStyle">
        <h1>페이지 설정하기</h1>
        <div>
            <h4>새 페이지 만들기</h4>
            <span>새 페이지명: </span>
            <input v-model="this.newPageName" placeholder="새 페이지명 적기">
            <button @click="createNewPage">만들기</button>
        </div>

        <div>
            <h4>기존 페이지 수정하기</h4>
            <ol>
                <li v-for="page in this.expensePages" :key="page.index">
                    <input v-model="page.page_name">
                    <button @click="editPage(page)">수정하기</button>
                    <button @click="deletePage(page.id)">삭제하기</button>
                </li>
            </ol>
        </div>
    </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'PageListView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        expensePages: {
            type: Object,
            default: () => { }
        },
    },
    data() {
        return {

            newPageName: "",

            pageListStyle: "pageListStyle",
        }
    },
    methods: {
        createNewPage() {
            const o = {
                id: this.getUuidv4(),
                page_name: this.newPageName,
            }
            this.upsertPage(o);
            this.upsertInitailData(o.id);
        },
        upsertInitailData(idHere) {
            const initialExpenseData = {
                id: this.getUuidv4(),
                parents_id: null,
                category: '총계',
                amount: 0,
                order: null,
                level: 1,
                page_id: idHere
            }
            this.upsertData(initialExpenseData)
        },
        async upsertData(dataHere) {
            try {
                const { error } = await supabase
                    .from('expense')
                    .upsert(dataHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
        },
        editPage(pageHere) {
            const confirmValue = confirm("저장하시겠습니까?")
            if (confirmValue) {
                this.upsertPage(pageHere);
                alert('수정되었습니다.')
            }
        },
        async upsertPage(oHere) {

            try {
                const { error } = await supabase
                    .from('expense_page')
                    .upsert(oHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }


        },
        async deletePage(pageIdHere) {
            const confirmValue = confirm("정말로 삭제하시겠습니까? 삭제된 데이터는 복구가 불가능합니다.")
            if (confirmValue) {

                this.removeExpenseByPageDelete(pageIdHere);
                try {
                    const { error } = await supabase
                        .from('expense_page')
                        .delete()
                        .eq('id', pageIdHere)

                    alert('삭제되었습니다.')

                    if (error) {
                        throw error;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        },
        async removeExpenseByPageDelete(pageIdHere) {
            this.$emit('remove-e-by-pageId', pageIdHere);
        },
        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
    }

}
</script>

<style scoped>
@import '../style.css';
</style>

