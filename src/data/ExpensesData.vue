<template>
    {{ this.testData }}
    <div>
    <!-- <div :class="testDiv"> -->
        <!-- <App v-bind:testData="testData"/> -->
        <LogInView v-bind:testData="testData"/>
    </div>
</template>
 
<script>

// import App from '../App.vue'
import LogInView from '../views/LogInView.vue'

export default {
    data() {
        return {
            testData: {},
            testDiv: "testDiv"
        }
    },
    mounted() {
        this.test()
    },
    methods: {
        test() {
            this.testData = {"key":"value"}
        }
    },
    components: {
        LogInView,
        // App,
    }
}

</script>

<style scoped>
  @import '../style.css';
</style>