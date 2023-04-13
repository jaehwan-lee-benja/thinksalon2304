<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <p>hi</p>
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <ul>
    <li v-for="todo in todos" :key="todo.id">
        <input v-model="todo.text" placeholder="Type here" :readonly="false">
    </li>
  </ul>
</template>

<script>
import { supabase } from './lib/supabaseClient.js'
// import HelloWorld from './components/HelloWorld.vue'

// export default {
//   name: 'App',
//   components: {
//     // HelloWorld
//   }
// }

export default {
  data() {
      return {
        todos: [],
      }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
        const a = await supabase
            .from('toDo')
            .select()
        const { data } = a;
        this.todos = data;
        console.log("working! - fetchData()");
        console.log("a = ", a);
    }
  }
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
