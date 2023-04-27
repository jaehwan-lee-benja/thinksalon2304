<template>

  <ol>
    <li ref="expense" v-for="expense in expenses" :key="expense.id">
        <input v-model="expense.expenseCategory" placeholder="Type here">
        <span> : </span>
        <input v-model="expense.expenseAmount" placeholder="Type here">
        <button @click="removeExpense(expense)">X</button>
        <!-- <button @click="editOrder(expense)">☰</button> -->
        <button @click="editExpense(expense)" v-if="isEdited(expense)">save</button>
    </li>
  </ol>

  <ul>
    <li>
        <form @submit.prevent="addExpense">
          <input v-model="newExpenseCategory">
          <span> : </span>
          <input v-model="newExpenseAmount">
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
        }
    },
    setup() {
      // console.log("setup!");
      // // console.log("this.expenses = ", this.expenses);
      // // const items = ref( [
      // //   {expenseAmount: 1},
      // //   {expenseAmount: 2},
      // //   {expenseAmount: 3},
      // // ] );
      // // console.log("items = ", items);
      // const totalExpenseAmount = ref(0);
      // // items 배열의 모든 expenseAmount를 합산하는 함수
      // const calculateTotalExpenseAmount = () => {
      //   totalExpenseAmount.value = this.expenses.value.reduce((acc, item) => acc + item.expenseAmount, 0)
      // }
      // // 컴포넌트가 처음 마운트될 때 합산 실행
      // calculateTotalExpenseAmount()
      // // return { items, totalExpenseAmount }
      // this.totalExpenseAmount = this.expenses.reduce((acc, item) => acc + item.expenseAmount, 0)
    },
    mounted() {
      this.fetchData();
    },
    created() {
      this.setEmpthyToNull();
    },
    computed: {
      totalExpenseAmount() {
        return this.expenses.reduce((acc, item) => acc + Number(item.expenseAmount), 0)
      } 
    },
    methods: {
      addExpense() {
        if(this.newExpenseCategory == '') {
          this.newExpenseCategory = null;
        }

        console.log("this.newExpenseAmount = ", this.newExpenseAmount);
        if(this.newExpenseAmount == '') {
          console.log("check!");
          this.newExpenseAmount = null;
        }
        console.log("this.newExpenseAmount = ", this.newExpenseAmount);

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
        console.log("f = ", fetchedExpense.expenseCategory+" ", " | ", Number(fetchedExpense.expenseAmount))
        console.log("e = ", editedExpense.expenseCategory+" ", " | ", Number(editedExpense.expenseAmount))
        if(fetchedExpense != undefined) {
          return (fetchedExpense.expenseCategory || "") != (editedExpense.expenseCategory || "") 
          || Number(fetchedExpense.expenseAmount) != Number(editedExpense.expenseAmount)
        }
      },
      setOrder() {
        const expenseLength = Object.keys(this.expenses).length;
        return expenseLength+1 ;
      },
      setEmpthyToNull(){
        console.log("expense = ", this.$refs.expense); // [질문] 어떻게 null로 인식할 수 있을까?
      }
    }
  }
</script>