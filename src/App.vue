<template>

  <p>현재형 지출 합: {{ totalExpenseAmount }}</p>

  <ol>
    <li v-for="expense in expenses" :key="expense.id">
        <input v-model="expense.expenseCategory" placeholder="Type here">
        <span> : </span>
        <!-- <input :class="expenseAmountStyle" v-model="expense.expenseAmountWithComma" @input="setComma(expense.id)" placeholder="Type here"> -->
        <input :class="expenseAmountStyle" v-model="expense.expenseAmount" @input="setComma(expense.id)" placeholder="Type here">
        <button @click="removeExpense(expense)">X</button>
    </li>

    
    <li>
        <form @submit.prevent="addExpense">
          <input v-model="newExpenseCategory" placeholder="Type here">
          <span> : </span>
          <input :class="expenseAmountStyle" v-model="newExpenseAmountWithComma" placeholder="Type here">
          <button>save new</button>
        </form>        
    </li>
  </ol>

  <button v-if="isEdited" @click="editExpenses" >save</button>

  
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
      this.fetchData()
    },
    computed: {
      totalExpenseAmount() {
        const a = this.expenses.reduce((acc, item) => acc + Number(parseInt(item.expenseAmount.replace(/,/g , ''))), 0);
        const b = this.newExpenseAmount;
        const a2 = Number(a);
        const b2 = Number(b);
        const sum = a2 + b2;
        return sum.toLocaleString();
      },
      isEdited() {
        const fetched = [];
        this.fetchedExpenses.forEach(e => {
          fetched.push({
            expenseCategory: e.expenseCategory,
            expenseAmount: e.expenseAmount
          })
        });

        const edited = [];
        this.expenses.forEach(e => {
          edited.push({
            expenseCategory: e.expenseCategory,
            expenseAmount: e.expenseAmount
          })
        });

        return ( JSON.stringify(fetched) || "" ) != ( JSON.stringify(edited) || "" )

      },
      newExpenseAmountWithComma: {
        get() {
          if(this.newExpenseAmount > 0) {
            return Number(this.newExpenseAmount).toLocaleString();
          } else {
            return 0;
          }
        },
        set(value) {
          this.newExpenseAmount = value.replace(/[^0-9.]/g, "");
        }
      }
    },
    methods: {
      addExpense() {
        const o = { 
          id: this.getUuidv4(), 
          expenseCategory: this.newExpenseCategory, 
          expenseAmount: this.newExpenseAmount,
          order: this.setOrder()
        };
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
          this.expenses.forEach(e => {
            e.expenseAmount = Number(e.expenseAmount).toLocaleString();
          })
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
        this.expenses.forEach(e => {
          e.expenseAmount = e.expenseAmount.replace(/[^0-9.]/g, "");
          this.updateData(e)
        })
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
      setOrder() {
        const expenseLength = Object.keys(this.expenses).length;
        return expenseLength+1 ;
      },
      setComma(expenseId) {
        const selectedExpense = this.expenses.find(e => e.id === expenseId);
        const index = this.expenses.indexOf(selectedExpense)
        const formattedAmount = parseInt(selectedExpense.expenseAmount.replace(/,/g , ''))
        if(!isNaN(formattedAmount)){
          this.expenses[index].expenseAmount = formattedAmount.toLocaleString();
        } else {
          this.expenses[index].expenseAmount = "0";
        }
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