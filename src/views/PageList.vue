<template>
    <div :class="pageListStyle">
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
                    <button @click="upsertPage(page)">수정하기</button>
                    <button @click="deletePage(page.id)">삭제하기</button>
                </li>
            </ol>
        </div>
    </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'PageList',
    props: {
        expenses: {
            type: Object,
            default: () => {}
        },
    },
    mounted() {
        this.fetchDataForPage()
    },
    data() {
        return {
            expensePages: [],

            newPageName: "",

            pageListStyle: "pageListStyle",
        }
    },
    methods: {
        async fetchDataForPage() {
            const a = await supabase
                .from('expense_page')
                .select()
            const { data } = a;
            this.expensePages = data;
        },
        createNewPage() {
            const o = { 
                id: this.getUuidv4(),
                page_name: this.newPageName,
            }
            this.upsertPage(o);
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
            try {
                const { error } = await supabase
                    .from('expense_page')
                    .delete()
                    .eq('id', pageIdHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
        },
        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
    }

}
</script>

<style scoped>@import '../style.css';</style>

