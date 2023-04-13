<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
        <input v-model="todo.text">
    </li>
  </ul>
</template>

<script>
  import { supabase } from './lib/supabaseClient.js'

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