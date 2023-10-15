<template>
    <h2>파일 편집하기</h2>

    <div>
        <h4>새 파일 만들기</h4>
        <span>새 파일명: </span>
        <input v-model="this.newVersionTitle" placeholder="새 타이틀 적기">
        <button @click="createNewVersion">만들기</button>
    </div>
    
    <div>
        <h4>기존 파일 수정하기</h4>
        <ol>
            <li v-for="version in this.expenseVersions" :key="version.index">
                <input type="checkbox" v-model="checkedValues" @change="updateCheckedVersion" :id="version.id" :true-value="yes" :false-value="no">
                <input v-model="version.version_title">
                <button @click="upsertVersion(version)">수정하기</button>
                <button @click="deleteVersion(version.id)">삭제하기</button>
            </li>
        </ol>
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
        this.fetchDataForVersion()
    },
    data() {
        return {
            expenseVersions: [],
            checkedVersion: "",
            checkedValues: [],

            newVersionTitle: "",
        }
    },
    methods: {
        async fetchDataForVersion() {
            const a = await supabase
                .from('expense_file')
                .select()
            const { data } = a;
            this.expenseVersions = data;
        },
        updateCheckedVersion(event) {
            console.log("event.target =", event.target)
            console.log("event.target.id =", event.target.id)
            console.log("event.target.value =", event.target.value)
            for(let i=0; i<this.checkedValues.length;i++){
                if(this.checkedValues[i] !== event.target.value){
                    console.log(this.checkedValues[i])
                    this.checkedValues.splice(i,1);
            }
          }
        },
        createNewVersion() {
            const o = { 
                id: this.getUuidv4(),
                version_title: this.newVersionTitle,
            }
            this.upsertVersion(o);
        },
        async upsertVersion(oHere) {

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
        async deleteVersion(versionIdHere) {
            try {
                const { error } = await supabase
                    .from('expense_file')
                    .delete()
                    .eq('id', versionIdHere)
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

