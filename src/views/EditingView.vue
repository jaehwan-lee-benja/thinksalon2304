<template>
    <div :class="bodyDiv">
        <div>
          <div :class="unitDiv">
            <h2>돈이 나가는 영역(편집모드)</h2>
            <ul>
                <li v-for="expense in sortTotalExpenses" :key="expense.id">
                    <span>결정값 : </span>
                    <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                </li>
                <li>계산값 : <input :class="amountStyle" v-model="sumTotalExpenses" readonly></li>
            </ul>
            </div>
            <div :class="subGrid">
            <div :class="unitDiv">
                <div>
                <h3>과거형 지출</h3>
                <ul>
                    <li v-for="expense in sortPastExpenses" :key="expense.id">
                        <span>결정값 : </span>
                        <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                    </li>
                    <li>계산값 : <input :class="amountStyle" v-model="sumPastExpenses" readonly></li>
                </ul>
                </div>
                <div>
                <ol>
                    <li v-for="expense in sortParentsPastExpenses" :key="expense.id">
                        <input :class="categoryStyle" v-model="expense.category">
                        <span> : </span>
                        <input :class="amountStyle" v-model="expense.amount">
                        <button @click="removeExpense(expense)">X</button>
                    </li>
                </ol>
                <ul :class="newUlStyle">
                    <li>
                        <form @submit.prevent="addExpense('past')">
                        <input :class="categoryStyle" v-model="newCategory_past" placeholder="새 리스트 적기">
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
                <h3>현재형 지출</h3>
                <ul>
                    <li v-for="expense in sortPresentExpenses" :key="expense.id">
                        <span>결정값 : </span>
                        <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                    </li>
                    <li>계산값 : <input :class="amountStyle" v-model="sumPresentExpenses" readonly></li>
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
                        <input :class="categoryStyle" v-model="newCategory_present" placeholder="새 리스트 적기">
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
                <h3>미래형 지출</h3>
                <ul>
                    <li v-for="expense in sortFutureExpenses" :key="expense.id">
                        <span>결정값 : </span>
                        <input :class="amountStyle" v-model="expense.amount" placeholder="0">
                    </li>
                    <li>계산값 : <input :class="amountStyle" v-model="sumFutureExpenses" readonly></li>
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
                        <input :class="categoryStyle" v-model="newCategory_future" placeholder="새 리스트 적기">
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
  
import { supabase } from '../lib/supabaseClient.js'

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
      const o = {
        id: this.getUuidv4(), 
        parentsCategory: parentsCategoryHere,
        category: this['newCategory_'+parentsCategoryHere], 
        amount: this['newAmount_'+parentsCategoryHere],
        order: this.setOrder(parentsCategoryHere),
        level: 2
      };
      this.expenses.push(o);
      this['newCategory_'+parentsCategoryHere] = ''
      this['newAmount_'+parentsCategoryHere] = ''
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
          if(order > orderRemoved) {
            this.expenses[this.expenses.indexOf(e)].order = order - 1;
          }
        }
      });

      this.expenses = this.expenses.filter((t) => t !== expense)

    },
    editExpenses() {

      const confirmValue = confirm("수정된 내용을 저장하시겠습니까?")

      if(confirmValue) {
        const expensesIdArray = this.expenses.map(e => e.id);
        const fetchedExpensesIdArray = this.fetchedExpenses.map(e => e.id);
        const willBeDeletedIdArray = fetchedExpensesIdArray.filter(e => !expensesIdArray.includes(e));

        willBeDeletedIdArray.forEach(e => this.deleteData(e));
        this.expenses.forEach(e => this.upsertData(e))

        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

        alert('저장되었습니다.')
      }

    },
    async upsertData(expense) { 
      try {
        const { error } = await supabase
            .from('expense')
            .upsert(expense)
            .eq('id', expense.id)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteData(expenseId) {
      try {
        const { error } = await supabase
          .from('expense')
          .delete()
          .eq('id', expenseId)
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
    setOrder(parentsCategoryHere) {
      const arr = this.expenses.filter(e => e.parentsCategory === parentsCategoryHere)
      const expenseLength = Object.keys(arr).length;
      return expenseLength+1 ;
    }

  }
}
</script>

<style scoped>
  @import '../style.css';
</style>