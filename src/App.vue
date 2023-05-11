<template>
  <div class="unitDiv">
    <div>
      <h1>하류 - 돈이 나가는 영역</h1>
      <div>
        <span>결정값:</span>
        <input v-model="showAmountOfTotalExpense" placeholder="입력">
        <button @click="editExpenses">save</button>
      </div>
      <div>
        <span>계산값: {{ totalExpenseBySum }}</span>
      </div>
    </div>
    <div>
      <div class="unitDiv">
        <div>
          <h2>과거형 지출</h2>
          <div>
            <span>결정값:</span>
            <input v-model="showAmountOfPastExpense" placeholder="입력">
          </div>
          <div>
            <span>계산값: {{ sumPastExpenses }}</span>
          </div>
        </div>
        <ol>
          <li v-for="expense in sortPastExpenses" :key="expense.id">
              <input v-model="expense.category">
              <span> : </span>
              <!-- <input :class="amountStyle" v-model="expense.amount" @input="setComma(expense.id)" placeholder="Type here"> -->
              <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              <button @click="removeExpense(expense)">X</button>
          </li>
        </ol>
        <ul>
          <li>
              <form @submit.prevent="addExpense('past')">
                <input v-model="newCategoryPast" placeholder="입력">
                <span> : </span>
                <!-- <input :class="amountStyle" v-model="newAmountWithComma" placeholder="Type here"> -->
                <input :class="amountStyle" v-model="newAmountPast" placeholder="0">
                <button>save new</button>
              </form>        
          </li>
        </ul>
        <button v-if="isEdited" @click="editExpenses" >save</button>
      </div>
      <div class="unitDiv">
        <div>
          <h2>현재형 지출</h2>
          <div>
            <span>결정값:</span>
            <input v-model="showAmountOfPresentExpense" placeholder="입력">
          </div>
          <div>
            <span>계산값: {{ totalAmount }}</span>
          </div>
        </div>
        <ol>
          <li v-for="expense in sortPresentExpenses" :key="expense.id">
              <input v-model="expense.category">
              <span> : </span>
              <!-- <input :class="amountStyle" v-model="expense.amount" @input="setComma(expense.id)" placeholder="Type here"> -->
              <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              <button @click="removeExpense(expense)">X</button>
          </li>
        </ol>
        <ul>
          <li>
              <form @submit.prevent="addExpense('present')">
                <input v-model="newCategoryPresent" placeholder="입력">
                <span> : </span>
                <!-- <input :class="amountStyle" v-model="newAmountWithComma" placeholder="Type here"> -->
                <input :class="amountStyle" v-model="newAmountPresent" placeholder="0">
                <button>save new</button>
              </form>        
          </li>
        </ul>
        <button v-if="isEdited" @click="editExpenses" >save</button>
      </div>
      <div class="unitDiv">
        <div>
          <h2>미래형 지출</h2>
          <div>
            <span>결정값:</span>
            <input v-model="showAmountOfFutureExpense" placeholder="입력">
          </div>
          <div>
            <span>계산값: {{ totalAmount }}</span>
          </div>
        </div>
        <ol>
          <li v-for="expense in sortFutureExpenses" :key="expense.id">
              <input v-model="expense.category">
              <span> : </span>
              <!-- <input :class="amountStyle" v-model="expense.amount" @input="setComma(expense.id)" placeholder="Type here"> -->
              <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              <button @click="removeExpense(expense)">X</button>
          </li>
        </ol>
        <ul>
          <li>
              <form @submit.prevent="addExpense('future')">
                <input v-model="newCategoryFuture" placeholder="입력">
                <span> : </span>
                <!-- <input :class="amountStyle" v-model="newAmountWithComma" placeholder="Type here"> -->
                <input :class="amountStyle" v-model="newAmountFuture" placeholder="0">
                <button>save new</button>
              </form>        
          </li>
        </ul>
        <button v-if="isEdited" @click="editExpenses" >save</button>
      </div>
    </div>
  </div>
</template>

<script>
  
  import { supabase } from './lib/supabaseClient.js'

  export default {

    data() {
        return {
          expenses: [],
          fetchedExpenses: [],
          newCategoryPast: '',
          newCategoryPresent: '',
          newCategoryFuture: '',
          newAmountPast: '',
          newAmountPresent: '',
          newAmountFuture: '',
          amountStyle: 'amountStyle',
        }
    },
    mounted() {
      this.fetchData()
    },
    computed: {
      sortPastExpenses() {
        const arr = [];
        this.expenses.forEach(e => {
          if(e.parentsCategory === "pastExpense") {
            arr.push(e);
          }
        })
        return arr
      },
      sortPresentExpenses() {
        const arr = [];
        this.expenses.forEach(e => {
          if(e.parentsCategory === "presentExpense") {
            arr.push(e);
          }
        })
        return arr
      },
      sortFutureExpenses() {
        const arr = [];
        this.expenses.forEach(e => {
          if(e.parentsCategory === "futureExpense") {
            arr.push(e);
          }
        })
        return arr
      },
      // sumPastExpenses() {
      //   const sum = this.sortPastExpenses().reduce((acc, item) => acc + Number(item.amount), 0);
      //   return sum;
      // },
      showAmountOfTotalExpense() {
        let result = '';
        this.expenses.forEach(e => {
          if(e.category === "totalExpense") {
            result = e.amount;
          }
        })
        return result;
      },
      showAmountOfPastExpense() {
        let result = '';
        this.expenses.forEach(e => {
          if(e.category === "pastExpense") {
            result = e.amount;
          }
        })
        return result;
      },
      showAmountOfPresentExpense() {
        let result = '';
        this.expenses.forEach(e => {
          if(e.category === "presentExpense") {
            result = e.amount;
          }
        })
        return result;
      },
      showAmountOfFutureExpense() {
        let result = '';
        this.expenses.forEach(e => {
          if(e.category === "futureExpense") {
            result = e.amount;
          }
        })
        return result;
      },
      totalExpenseBySum() {
        return this.sumTotalExpense(this.expenses);
      },
      totalAmount() {
        // const a = this.expenses.reduce((acc, item) => acc + Number(parseInt(item.amount.replace(/,/g , ''))), 0);
        // const b = this.newAmount;
        // const a2 = Number(a);
        // const b2 = Number(b);
        // const sum = a2 + b2;
        // return sum.toLocaleString();
        return this.expenses.reduce((acc, item) => acc + Number(item.amount), 0)
      },
      isEdited() {
        const fetched = [];
        this.fetchedExpenses.forEach(e => {
          fetched.push({
            category: e.category,
            amount: e.amount
          })
        });

        const edited = [];
        this.expenses.forEach(e => {
          edited.push({
            category: e.category,
            amount: e.amount
          })
        });

        return ( JSON.stringify(fetched) || "" ) != ( JSON.stringify(edited) || "" )

        // return ( JSON.stringify(this.fetchedExpenses) || "" ) != ( JSON.stringify(this.expenses) || "" )


      },
      // newAmountWithComma: {
      //   get() {
      //     if(this.newAmount > 0) {
      //       return Number(this.newAmount).toLocaleString();
      //     } else {
      //       return 0;
      //     }
      //   },
      //   set(value) {
      //     this.newAmount = value.replace(/[^0-9.]/g, "");
      //   }
      // }
    },
    methods: {
      addExpense(parentsCategoryHere) {
        const o = {
          id: this.getUuidv4(), 
          parentsCategory: parentsCategoryHere+"Expense",
          category: this.newCategory, 
          amount: this.newAmount,
          order: this.setOrder()
        };
        this.expenses.push(o);
        this.newCategory = ''
        this.newAmount = ''
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
          // this.expenses.forEach(e => {
          //   e.amount = Number(e.amount).toLocaleString();
          // })
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
        console.log("here!");
        const editedExpenses = this.expenses;
        this.expenses.forEach(e => {
          // e.amount = e.amount.replace(/[^0-9.]/g, "");
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
      sumTotalExpense(dataHere) {
        const arr = [];
        dataHere.forEach(e => {
          if(e.category === "pastExpense") {
            arr.push(e.amount);
          } else if (e.category === "presentExpense") {
            arr.push(e.amount);
          } else if (e.category === "futureExpense") {
            arr.push(e.amount);
          }
        })
        const sum = arr.reduce((acc, item) => acc + Number(item), 0);
        return sum
      },
      // setComma(expenseId) {
      //   const selectedExpense = this.expenses.find(e => e.id === expenseId);
      //   const index = this.expenses.indexOf(selectedExpense)
      //   const formattedAmount = parseInt(selectedExpense.amount.replace(/,/g , ''))
      //   if(!isNaN(formattedAmount)){
      //     this.expenses[index].amount = formattedAmount.toLocaleString();
      //   } else {
      //     this.expenses[index].amount = "0";
      //   }
      // }
    }
  }
</script>

<style>
.amountStyle {
  text-align : right;
  width: 70px;
  margin-right: 10px;
}
.unitDiv {
  border: 1px solid black;
  padding: 10px;
  margin: 5px;
}
</style>