<template>

  <ol>
    <li v-for="expense in expenses" :key="expense.id">
        <input v-model="expense.expenseCategory" placeholder="Type here">
        <span> : </span>
        <input :class="expenseAmountStyle" v-model="expense.expenseAmount" placeholder="Type here">
        <button @click="removeExpense(expense)">X</button>
        <!-- <button @click="editOrder(expense)">☰</button> -->
    </li>
  </ol>

  <button v-if="isEdited2" @click="editExpenses" >save</button>

  <ul>
    <li>
        <form @submit.prevent="addExpense">
          <input v-model="newExpenseCategory">
          <span> : </span>
          <input :class="expenseAmountStyle" v-model="newExpenseAmount">
          <button>save new</button>
        </form>        
    </li>
  </ul>

  <p>Total Expense Amount: {{ totalExpenseAmount }}</p>
  
</template>

<script>
  
  import { supabase } from './lib/supabaseClient.js'

  export default {

    data() {
        return {
          expenses: [],
          fetchedExpenses: [],
          newExpenseCategory: '',
          newExpenseAmount: '',
          expenseAmountStyle: 'expenseAmountStyle'
        }
    },
    mounted() {
      this.fetchData();
    },
    computed: {
      totalExpenseAmount() {
        return this.expenses.reduce((acc, item) => acc + Number(item.expenseAmount), 0).toLocaleString()
      },
      isEdited2() {

        const fetched = [];
        this.fetchedExpenses.forEach(e => {
          fetched.push({
            expenseCategory: e.expenseCategory,
            expenseAmount: Number(e.expenseAmount)
          })
        });

        const edited = [];
        this.expenses.forEach(e => {
          edited.push({
            expenseCategory: e.expenseCategory,
            expenseAmount: Number(e.expenseAmount)
          })
        });
        return ( JSON.stringify(fetched) || "" ) != ( JSON.stringify(edited) || "" )
      }
    },
    methods: {
      addExpense() {
        const o = { 
          id: this.getUuidv4(), 
          expenseCategory: this.newExpenseCategory, 
          expenseAmount: this.newExpenseAmount,
          order: this.setOrder() };
        this.expenses.push(o);
        this.newExpenseCategory = ''
        this.newExpenseAmount = ''
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
      editExpenses() {
        const editedExpenses = this.expenses;
        this.expenses.forEach(e => this.updateData(e))
        this.fetchedExpenses = JSON.parse(JSON.stringify(editedExpenses));
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
        const fetchedExpense = this.fetchedExpenses.find(e => e.id === editedExpense.id);
        if(fetchedExpense != undefined) {
          return (fetchedExpense.expenseCategory || "") != (editedExpense.expenseCategory || "") 
          || Number(fetchedExpense.expenseAmount) != Number(editedExpense.expenseAmount)
        }
      },
      // isEdited2() {
      //   console.log("check! - 1");
      //   if(this.fetchedExpenses != undefined) {
      //     console.log("check! - 2");
      //     return (this.fetchedExpenses || "") != (this.editedExpenses || "") 
      //   }
      // },
      // isEdited2() {
      //   const a = "b"
      //   if(a == "a") {
      //     console.log("true");
      //     return true
      //   } else {
      //     console.log("false");
      //     return false
      //   }
      // },
      setOrder() {
        const expenseLength = Object.keys(this.expenses).length;
        return expenseLength+1 ;
      }
    }
  }
</script>

<style>
.expenseAmountStyle {
  text-align : right;
  width: 70px;
  margin-right: 10px;
}
</style>