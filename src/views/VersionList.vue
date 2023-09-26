<template>
    <div>hello</div>
    <ol>
        <li v-for="version in this.expenseVersions" :key="version.index">
            <span>{{ version.version_title }}</span>
            <input type="checkbox" v-model="checkedValues" @change="updateCheckedVersion" :true-value="yes" :false-value="no">
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
            hello: "hello",
            expenseVersions: [],
            checkedVersion: "",
            checkedValues: [],
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
            console.log("event.target.value =", event.target.value)
            for(let i=0; i<this.checkedValues.length;i++){
                if(this.checkedValues[i] !== event.target.value){
                    console.log(this.checkedValues[i])
                    this.checkedValues.splice(i,1);
            }
          }
        }
    }

}
</script>

<style scoped>@import '../style.css';</style>

