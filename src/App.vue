<template>
  <div :class="bodyDiv">
    <div>
      <div>
        <h1>돈이 나가는 영역</h1>
        <ul>
          <li v-for="expense in sortTotalExpenses" :key="expense.id">
              <span>결정값 : </span>
              <input :class="amountStyle" v-model="expense.amount" placeholder="0">
          </li>
          <li>계산값 : <input :class="amountStyle" v-model="sumTotalExpenses"></li>
        </ul>
      </div>
      <div :class="subGrid">
        <div :class="unitDiv">
          <div>
            <h2>과거형 지출</h2>
            <ul>
              <li v-for="expense in sortPastExpenses" :key="expense.id">
                  <span>결정값 : </span>
                  <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumPastExpenses"></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsPastExpenses" :key="expense.id">
                  <input :class="categoryStyle" v-model="expense.category" @click="selected">
                  <span> : </span>
                  <input :class="amountStyle" v-model="expense.amount" @click="selected">
                  <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                  <form @submit.prevent="addExpense('past')">
                    <input :class="categoryStyle" v-model="newCategory_past" placeholder="항목적기">
                    <span> : </span>
                    <input :class="amountStyle" v-model="newAmount_past" placeholder="0">
                    <button>입력</button>
                  </form>
              </li>
            </ul>
          </div>
        </div>
        <div :class="unitDiv">
          <div>
            <h2>현재형 지출</h2>
            <ul>
              <li v-for="expense in sortPresentExpenses" :key="expense.id">
                  <span>결정값 : </span>
                  <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumPresentExpenses"></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsPresentExpenses" :key="expense.id">
                  <input :class="categoryStyle" v-model="expense.category">
                  <span> : </span>
                  <input :class="amountStyle" v-model="expense.amount">
                  <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                  <form @submit.prevent="addExpense('present')">
                    <input :class="categoryStyle" v-model="newCategory_present" placeholder="항목적기">
                    <span> : </span>
                    <input :class="amountStyle" v-model="newAmount_present" placeholder="0">
                    <button>입력</button>
                  </form>        
              </li>
            </ul>
          </div>
        </div>
        <div :class="unitDiv">
          <div>
            <h2>미래형 지출</h2>
            <ul>
              <li v-for="expense in sortFutureExpenses" :key="expense.id">
                  <span>결정값 : </span>
                  <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumFutureExpenses"></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsFutureExpenses" :key="expense.id">
                  <input :class="categoryStyle" v-model="expense.category">
                  <span> : </span>
                  <input :class="amountStyle" v-model="expense.amount">
                  <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                  <form @submit.prevent="addExpense('future')">
                    <input :class="categoryStyle" v-model="newCategory_future" placeholder="항목적기">
                    <span> : </span>
                    <input :class="amountStyle" v-model="newAmount_future" placeholder="0">
                    <button>입력</button>
                  </form>        
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <button :class="saveEditedStyle" v-if="isEdited" @click="editExpenses">저장</button>
  </div>
</template>

<script>
  
  import { supabase } from './lib/supabaseClient.js'

  export default {

    data() {
        return {

          expenses: [],
          fetchedExpenses: [],

          newCategory_past: '',
          newCategory_present: '',
          newCategory_future: '',

          newAmount_past: '',
          newAmount_present: '',
          newAmount_future: '',

          bodyDiv: 'bodyDiv',
          unitDiv: 'unitDiv',
          subGrid: 'subGrid',

          categoryStyle: 'categoryStyle',
          amountStyle: 'amountStyle',
          newUlStyle: 'newUlStyle',
          saveEditedStyle: 'saveEditedStyle',

        }
    },
    mounted() {
      this.fetchData()
      this.setReadOnly()
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
            amount: Number(e.amount)
          })
        });

        const edited = [];
        this.expenses.forEach(e => {
          edited.push({
            category: e.category,
            amount: Number(e.amount)
          })
        });

        const fetchedData = JSON.stringify(fetched);
        const editedData = JSON.stringify(edited);

        return ( fetchedData || "" ) != ( editedData || "" )

      }

    },
    methods: {
      addExpense(parentsCategoryHere) {
        console.log("parentsCategoryHere = ", parentsCategoryHere);
        const o = {
          id: this.getUuidv4(), 
          parentsCategory: parentsCategoryHere,
          category: this['newCategory_'+parentsCategoryHere], 
          amount: this['newAmount_'+parentsCategoryHere],
          order: this.setOrder(parentsCategoryHere)
        };
        this.expenses.push(o);
        this['newCategory_'+parentsCategoryHere] = ''
        this['newAmount_'+parentsCategoryHere] = ''
        this.fetchedExpenses.push(JSON.parse(JSON.stringify(o)));
        this.insertData(o);
        console.log("o = ", o);
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

        const parentsCategory = expense.parentsCategory;
        const orderRemoved = expense.order;

        this.expenses.forEach(e => {
          const order = e.order;
          if(e.parentsCategory == parentsCategory) {
            console.log("e.parentsCategory = ", e.parentsCategory);
            if(order > orderRemoved) {
              this.expenses[this.expenses.indexOf(e)].order = order - 1;
              this.updateData(e);
            }
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
      selected(event) {
        const selectedElement = event.currentTarget;
        console.log("selectedElement = ", selectedElement);
        console.log("selectedElement.readOnly(1) = ", selectedElement.readOnly);
        selectedElement.readOnly = false;
        console.log("selectedElement.readOnly(2) = ", selectedElement.readOnly);
      },
      setReadOnly() {
        const inputArr = Array.from(document.getElementsByTagName('input'));
        // const inputArr = Array.prototype.slice.call(document.getElementsByTagName('input'));
        console.log('inputArr = ', inputArr);
        console.log('inputArr.length = ', inputArr.length);
        inputArr.forEach(e => e.readOnly = true);
      },

      getUuidv4() {
          return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
          );
      },
      setOrder(parentsCategoryHere) {
        const arr = this.expenses.filter(e => e.parentsCategory === parentsCategoryHere)
        const expenseLength = Object.keys(arr).length;
        return expenseLength+1 ;
      }

    }
  }
</script>

<style>
body {
    background-color:#f5efe9;
}
h1 {
  padding-left: 40px;
}
h2 {
  padding-left: 40px;
}
.unitDiv {
  border: 1px solid black;
  padding: 30px 10px;
  margin: 5px;
}
.bodyDiv {
  min-width : 1100px;
  padding: 20px;
}
.subGrid {
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
input:read-only {
  background-color: #cdcdcd;
}
.newUlStyle {
  list-style:none;
}
.saveEditedStyle {
  width: 100%;
  height: 40px;
  color: white;
  background-color: #3d3f45;
}

</style>