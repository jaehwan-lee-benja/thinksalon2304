<template>
    <input v-model="this.newVersionTitle" placeholder="새 타이틀 적기">
    <button @click="upsertVersion">만들기</button>
    <ol>
        <li v-for="version in this.expenseVersions" :key="version.index">
            <input v-model="version.version_title">
            <input type="checkbox" v-model="checkedValues" @change="updateCheckedVersion" :id="version.id" :true-value="yes" :false-value="no">
        </li>
    </ol>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
    name: 'VersionList',
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
                .from('expense_version')
                .select()
            const { data } = a;
            this.expenseVersions = data;
            console.log("this.expenseVersions = ", this.expenseVersions);
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
        async upsertVersion() {

            const o = { 
                id: this.getUuidv4(),
                version_title: this.newVersionTitle,
            }

            try {
                const { error } = await supabase
                    .from('expense_version')
                    .upsert(o)
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

