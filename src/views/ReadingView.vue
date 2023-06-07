<template>
    <div :class="bodyDiv">
        <div>
            <div>
              <h2>돈이 나가는 영역</h2>
              <ul>
                  <li v-for="expense in sortTotalExpenses" :key="expense.id">
                      <span>결정값 : </span>
                      <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
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
                          <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
                      </li>
                      <li>계산값 : <input :class="amountStyle" v-model="sumPastExpenses" readonly></li>
                  </ul>
                  </div>
                  <div>
                  <ol>
                      <li v-for="expense in sortParentsPastExpenses" :key="expense.id">
                          <input :class="categoryStyle" v-model="expense.category" readonly>
                          <span> : </span>
                          <input :class="amountStyle" v-model="expense.amount" readonly>
                      </li>
                  </ol>
                  </div>
              </div>
              <div :class="unitDiv">
                  <div>
                  <h3>현재형 지출</h3>
                  <ul>
                      <li v-for="expense in sortPresentExpenses" :key="expense.id">
                          <span>결정값 : </span>
                          <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
                      </li>
                      <li>계산값 : <input :class="amountStyle" v-model="sumPresentExpenses" readonly></li>
                  </ul>
                  </div>
                  <div>
                  <ol>
                      <li v-for="expense in sortParentsPresentExpenses" :key="expense.id">
                          <input :class="categoryStyle" v-model="expense.category" readonly>
                          <span> : </span>
                          <input :class="amountStyle" v-model="expense.amount" readonly>
                      </li>
                  </ol>
                  </div>
              </div>
              <div :class="unitDiv">
                  <div>
                  <h3>미래형 지출</h3>
                  <ul>
                      <li v-for="expense in sortFutureExpenses" :key="expense.id">
                          <span>결정값 : </span>
                          <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
                      </li>
                      <li>계산값 : <input :class="amountStyle" v-model="sumFutureExpenses" readonly></li>
                  </ul>
                  </div>
                  <div>
                  <ol>
                      <li v-for="expense in sortParentsFutureExpenses" :key="expense.id">
                          <input :class="categoryStyle" v-model="expense.category" readonly>
                          <span> : </span>
                          <input :class="amountStyle" v-model="expense.amount" readonly>
                      </li>
                  </ol>
                  </div>
              </div>
            </div>
        </div>
    </div>
</template>


<script>
  
import { supabase } from '../lib/supabaseClient.js'

export default {

  data() {
      return {

        expenses: [],

        bodyDiv: 'bodyDiv',
        unitDiv: 'unitDiv',
        subGrid: 'subGrid',

        categoryStyle: 'categoryStyle_readingMode',
        amountStyle: 'amountStyle_readingMode',
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
      .reduce((acc, item) => acc + Number(item.amount.replace(/,/g, "")), 0)
      .toLocaleString();
    },
    sumPastExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "past")
      .reduce((acc, item) => acc + Number(item.amount.replace(/,/g, "")), 0)
      .toLocaleString();
    },
    sumPresentExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "present")
      .reduce((acc, item) => acc + Number(item.amount.replace(/,/g, "")), 0)
      .toLocaleString();
    },
    sumFutureExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "future")
      .reduce((acc, item) => acc + Number(item.amount.replace(/,/g, "")), 0)
      .toLocaleString();
    }
  },
  methods: {
    async fetchData() {
        const a = await supabase
            .from('expense')
            .select()
            .order('order', { ascending: true })
        const { data } = a;
        data.forEach(e => e.amount = e.amount.toLocaleString());
        this.expenses = data;
    },
  }
}
</script>

<style scoped>
  @import '../style.css';
</style>