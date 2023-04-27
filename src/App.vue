<template>

  <ol>
    <li v-for="expense in expenses" :key="expense.id">
        <input v-model="expense.expenseCategory" placeholder="Type here">
        <button @click="removeExpense(expense)">X</button>
        <button @click="editExpense(expense)" v-if="isEdited(expense)">save</button>
    </li>
  </ol>

  <ul>
    <li>
        <form @submit.prevent="addExpense">
            <input v-model="newExpense">
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
          newExpense: '',
          expenses: [],
          fetchedExpenses: [],
          showChecked: false
        }
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      addExpense() {
        let o = { id: this.getUuidv4(), expenseCategory: this.newExpense, order: this.setOrder() };
        this.expenses.push(o);
        this.newExpense = ''
        this.fetchedExpenses.push(JSON.parse(JSON.stringify(o)));
        this.insertData(o);
      },
      async fetchData() {
          const a = await supabase
              .from('expense')
              .select()
              .order('order', { ascending: true })
          const { data } = a;
          this.expenses = data;
          this.fetchedExpenses = JSON.parse(JSON.stringify(data));
      },
      async insertData(oHere) { 
        try {
              const { error } = await supabase
                  .from('expense')
                  .insert(oHere)
              if (error) {
                  throw error;
              }
          } catch (error) {
              console.error(error);
          }
        },
      removeExpense(expense) {
        const orderRemoved = expense.order;

        this.expenses.forEach(e => {
          const order = e.order;
          if(order > orderRemoved) {
            this.expenses[this.expenses.indexOf(e)].order = order - 1;
            this.updateData(e);
          }
        });

        this.expenses = this.expenses.filter((t) => t !== expense)
        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
        this.deleteData(expense);
      },
      async deleteData(expense) {
        try {
          const { error } = await supabase
            .from('expense')
            .delete()
            .eq('id', expense['id'])
          if (error) {
            throw error;
          }
        } catch (error) {
          console.error(error);
        }
      },
      editExpense(editedExpense) {
          this.updateData(editedExpense);
          const fetchedExpensesKeys = Object.keys(this.fetchedExpenses);
          fetchedExpensesKeys.forEach(e => {
            const fetchedExpense = this.fetchedExpenses[e];
            if(fetchedExpense.id === editedExpense.id) {
              this.fetchedExpenses[e] = JSON.parse(JSON.stringify(editedExpense));
            }
          })
      },
      async updateData(expense) { 
        try {
          const { error } = await supabase
              .from('expense')
              .update(expense)
              .eq('id', expense.id)
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
      isEdited(editedExpense) {
        const fetchedExpense = this.fetchedExpenses.find(e => e.id === editedExpense.id)
         if(fetchedExpense != undefined) { // [질문] 이 방법이 최선이까?
          return fetchedExpense.expenseCategory != editedExpense.expenseCategory
        }
      },
      setOrder() {
        const expenseLength = Object.keys(this.expenses).length;
        return expenseLength+1 ;
      }
    }
  }
</script>