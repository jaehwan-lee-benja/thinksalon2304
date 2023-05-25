<template>
  <div :class="bodyDiv">
    <div>
      <h1>돈이 나가는 영역</h1>
      <ul>
        <li v-for="expense in sortTotalExpenses" :key="expense.id">
            <span>결정값</span>
            <span> : </span>
            <input :class="amountStyle" v-model="expense.amount" placeholder="0">
            <button v-if="isEdited" @click="editExpenses" >저장</button>
        </li>
        <li>계산값 : {{ sumTotalExpenses }}</li>
      </ul>
    </div>
    <div :class="subDiv">
      <div :class="unitDiv">
        <div>
          <h2>과거형 지출</h2>
          <ul>
            <li v-for="expense in sortPastExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button v-if="isEdited" @click="editExpenses" >저장</button>
            </li>
            <li>계산값 : {{ sumPastExpenses }}</li>
          </ul>
        </div>
        <div>
          <ol>
            <li v-for="expense in sortParentsPastExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button @click="removeExpense(expense)">X</button>
            </li>
          </ol>
          <ul>
            <li>
                <form @submit.prevent="addExpense('past')">
                  <input :class="categoryStyle" v-model="newCategoryPast" placeholder="입력">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmountPast" placeholder="0">
                  <button>저장</button>
                </form>        
            </li>
          </ul>
          <button v-if="isEdited" @click="editExpenses" >저장</button>
        </div>
      </div>
      <div :class="unitDiv">
        <div>
          <h2>현재형 지출</h2>
          <ul>
            <li v-for="expense in sortPresentExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button v-if="isEdited" @click="editExpenses" >저장</button>
            </li>
            <li>계산값 : {{ sumPastExpenses }}</li>
          </ul>
        </div>
        <div>
          <ol>
            <li v-for="expense in sortParentsPresentExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button @click="removeExpense(expense)">X</button>
            </li>
          </ol>
          <ul>
            <li>
                <form @submit.prevent="addExpense('present')">
                  <input :class="categoryStyle" v-model="newCategoryPresent" placeholder="입력">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmountPresent" placeholder="0">
                  <button>저장</button>
                </form>        
            </li>
          </ul>
          <button v-if="isEdited" @click="editExpenses" >저장</button>
        </div>
      </div>
      <div :class="unitDiv">
        <div>
          <h2>미래형 지출</h2>
          <ul>
            <li v-for="expense in sortFutureExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button v-if="isEdited" @click="editExpenses" >저장</button>
            </li>
            <li>계산값 : {{ sumFutureExpenses }}</li>
          </ul>
        </div>
        <div>
          <ol>
            <li v-for="expense in sortParentsFutureExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                <button @click="removeExpense(expense)">X</button>
            </li>
          </ol>
          <ul>
            <li>
                <form @submit.prevent="addExpense('future')">
                  <input :class="categoryStyle" v-model="newCategoryFuture" placeholder="입력">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmountFuture" placeholder="0">
                  <button>저장</button>
                </form>        
            </li>
          </ul>
          <button v-if="isEdited" @click="editExpenses" >저장</button>
        </div>
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

          bodyDiv: 'bodyDiv',
          unitDiv: 'unitDiv',
          subDiv: 'subDiv',

          categoryStyle: 'categoryStyle',
          amountStyle: 'amountStyle',

        }
    },
    mounted() {
      this.fetchData()
    },
    computed: {

      sortTotalExpenses() {
        return this.expenses.filter(e => e.category === "total")
      },
      sortPastExpenses() {
        return this.expenses.filter(e => e.category === "past")
      },
      sortPresentExpenses() {
        return this.expenses.filter(e => e.category === "present")
      },
      sortFutureExpenses() {
        return this.expenses.filter(e => e.category === "future")
      },

      sortParentsPastExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "past")
      },
      sortParentsPresentExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "present")
      },
      sortParentsFutureExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "future")
      },

      sumTotalExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "total")
        .reduce((acc, item) => acc + Number(item.amount), 0);
      },
      sumPastExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "past")
        .reduce((acc, item) => acc + Number(item.amount), 0);
      },
      sumPresentExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "present")
        .reduce((acc, item) => acc + Number(item.amount), 0);
      },
      sumFutureExpenses() {
        return this.expenses.filter(e => e.parentsCategory === "future")
        .reduce((acc, item) => acc + Number(item.amount), 0);
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

      },
      isEditedTotal() {

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

      }

    },
    methods: {
      addExpense(parentsCategoryHere) {
        const o = {
          id: this.getUuidv4(), 
          parentsCategory: parentsCategoryHere,
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
      async fetchData() {
          const a = await supabase
              .from('expense')
              .select()
              .order('order', { ascending: true })
          const { data } = a;
          this.expenses = data;
          this.fetchedExpenses = JSON.parse(JSON.stringify(data));
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
      editExpenses() {
        this.expenses.forEach(e => {
          this.updateData(e)
        })
        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
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

      getUuidv4() {
          return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
          );
      },
      setOrder() {
        const expenseLength = Object.keys(this.expenses).length;
        return expenseLength+1 ;
      }
      
    }
  }
</script>

<style>
.unitDiv {
  border: 1px solid black;
  padding: 20px;
  margin: 5px;
}
.bodyDiv {
  min-width : 1200px;
  padding: 20px;
}
.subDiv {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px;
    padding: 10px;
}
.categoryStyle {
  width: 100px;
}
.amountStyle {
  text-align : right;
  width: 70px;
  margin-right: 10px;
}
</style>