<template>
  <button @click="showChecked = !showChecked">
        {{ showChecked ? 'show all' : 'show checked only' }}
  </button>
  <ul>
    <li v-for="todo in filteredTodos" :key="todo.id">
        <input :class="{ done: todo.done }" v-model="todo.text" placeholder="Type here" :readonly="false">
        <input type="checkbox" v-model="todo.done" @click="updateDone(todo)">
        <button @click="removeTodo(todo)">X</button>
        <!-- <button @click="editTodo(todo)">save</button> -->
        <button @click="editTodo(todo)" v-if="shouldShowSaveButton(todo)">save</button>
    </li>

  </ul>
  <ul>
    <li>
        <form @submit.prevent="addTodo">
            <input v-model="newTodo">
            <button>save new</button>    
        </form>        
    </li> 
  </ul>
  
</template>

<script>
  
  import { supabase } from './lib/supabaseClient.js'

  export default {

    data() {
        return {
          newTodo: '',
          todos: [],
          fetchedTodos: [],
          showChecked: false
        }
    },
    computed: {
        filteredTodos() {
        return this.showChecked
            ? this.todos.filter((t) => t.done)
            : this.todos
        }
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      addTodo() {
        let o = { id: this.getUuidv4(), text: this.newTodo, done: false };
        this.todos.push(o);
        this.newTodo = ''
        this.insertData(o);
      },
      async fetchData() {
          const a = await supabase
              .from('toDo')
              .select()
          const { data } = a;
          this.todos = data;
          this.fetchedTodos = JSON.parse(JSON.stringify(data));
          console.log("working! - fetchData()");
      },
      async insertData(oHere) { 
        try {
              const { error } = await supabase
                  .from('toDo')
                  .insert(oHere)
              console.log("working! - insertData()");
              if (error) {
                  throw error;
              }
          } catch (error) {
              console.error(error);
          }
        },
      removeTodo(todo) {
              this.todos = this.todos.filter((t) => t !== todo)
              this.deleteData(todo);
          },
          async deleteData(todo) {
            try {
              const { error } = await supabase
                .from('toDo')
                .delete()
                .eq('id', todo['id'])
              console.log("working! - deleteData()");
              if (error) {
                throw error;
              }
            } catch (error) {
              console.error(error);
            }
          },
          editTodo(todo) {
              this.updateData(todo);
              console.log("todo = ", todo);
              // fetchedTodos에 업로드하는 함수 넣기
          },
          updateDone(todo) {
              todo.done = !todo.done;
              this.updateData(todo);
          },
          async updateData(todo) { 
            try {
              const { error } = await supabase
                  .from('toDo')
                  .update(todo)
                  .eq('id',todo.id)
              console.log("working! - updateData()");
              if (error) {
                throw error;
              }
            } catch (error) {
              console.error(error);
            }
          },
      getUuidv4() {
          return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
          );
      },
      shouldShowSaveButton(editedTodo) {
        const fetchedTodo = this.fetchedTodos.find(e => e.id === editedTodo.id)
        return fetchedTodo.text != editedTodo.text
      }
    }
  }
</script>