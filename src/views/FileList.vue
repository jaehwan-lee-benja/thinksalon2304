<template>
    <div :class="fileListStyle">
        <div>
            <h4>새 파일 만들기</h4>
            <span>새 파일명: </span>
            <input v-model="this.newFileName" placeholder="새 파일명 적기">
            <button @click="createNewFile">만들기</button>
        </div>
        
        <div>
            <h4>기존 파일 수정하기</h4>
            <ol>
                <li v-for="file in this.expenseFiles" :key="file.index">
                    <input v-model="file.file_name">
                    <button @click="upsertFile(file)">수정하기</button>
                    <button @click="deleteFile(file.id)">삭제하기</button>
                </li>
            </ol>
        </div>
    </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'FileList',
    props: {
        expenses: {
            type: Object,
            default: () => {}
        },
    },
    mounted() {
        this.fetchDataForFile()
    },
    data() {
        return {
            expenseFiles: [],

            newFileName: "",

            fileListStyle: "fileListStyle",
        }
    },
    methods: {
        async fetchDataForFile() {
            const a = await supabase
                .from('expense_file')
                .select()
            const { data } = a;
            this.expenseFiles = data;
        },
        createNewFile() {
            const o = { 
                id: this.getUuidv4(),
                file_name: this.newFileName,
            }
            this.upsertFile(o);
        },
        async upsertFile(oHere) {

            try {
                const { error } = await supabase
                    .from('expense_file')
                    .upsert(oHere)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
        },
        async deleteFile(fileIdHere) {
            try {
                const { error } = await supabase
                    .from('expense_file')
                    .delete()
                    .eq('id', fileIdHere)
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

