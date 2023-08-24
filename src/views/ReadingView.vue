<template>

  <div :class="sectionGrid">
    <div :class="listViewDiv">
      <h2>리스트 뷰</h2>
      <div :class="listViewItemDiv">
        <ol>
          <li v-for="expense in sortLevel3" :key="expense.id">
            <input :class="categoryStyle" v-model="expense.category" readonly>
            <span> : </span>
            <input :class="amountStyle" v-model="expense.amount" readonly>
            <input :class="categoryStyle" v-model="expense.parentsCategory" readonly>
          </li>
        </ol>
      </div>
    </div>
    <div :class="flowViewDiv">
      <h2>플로우 뷰</h2>
      <div :class="unitDiv">
        <div :class="graphGrid">
          <div>
            <h2>돈이 나가는 영역</h2>
            <ul>
              <li v-for="expense in sortTotalExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
              </li>
              <li>
                <span>계산값 : </span>
                <input :class="amountStyle" v-model="sumTotalExpenses" readonly>
              </li>
            </ul>
          </div>
          <div :class="graphDiv">
            <PieChart v-bind:expenses="expenses" />
          </div>
        </div>
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
import PieChart from './Pie.vue'

export default {

  data() {
    return {

      expenses: [],

      bodyDiv: 'bodyDiv',
      unitDiv: 'unitDiv',
      subGrid: 'subGrid',
      graphGrid: 'graphGrid',
      graphDiv: 'graphDiv',
      sectionGrid: 'sectionGrid',
      flowViewDiv: 'flowViewDiv',
      listViewDiv: 'listViewDiv',
      listViewItemDiv: 'listViewItemDiv',

      categoryStyle: 'categoryStyle_readingMode',
      amountStyle: 'amountStyle_readingMode',
      newUlStyle: 'newUlStyle',
      saveEditedStyle: 'saveEditedStyle',

      isNewUser: '',
      session: '',
      loginMode: true,
      email: ''

    }
  },
  mounted() {
    this.fetchData(),
    this.sessionListener()
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
    async loginGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        //     options: {
        //     redirectTo: 'http://localhost:8081/'
        // }
      //   options: {
      //   redirectTo: 'https://thinksalon.github.io/moneyflow/'
      // }
      })
      console.log("data = ", data);
      console.log("error = ", error);
    },
    async signout() {
      const { error } = await supabase.auth.signOut()
      console.log("error = ", error);
      if (error == null) {
        alert('로그아웃 되었습니다.')
        window.location.reload(true); // 리로드 방식 expense를 []로
      } else {
        alert('checking..')
      }
    },
    async fetchData() {

      const fetchedData = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })
      const { data } = fetchedData;

      const session = this.session;

      let userId = "";

      if (session !== null) {
        userId = session.user.id;
      } else {
        userId = null;
      }

      function whatId(el) {
        if (el.user_id === userId) {
          return true
        }
      }

      const dataById = fetchedData.data.filter(whatId);
      const dataLength = dataById.length;

      if (dataLength > 0) {
        this.isNewUser = false;
      } else {
        this.isNewUser = true;
      }

      if (this.isNewUser && session !== null) {
        this.insertInitailData();
      }

      data.forEach(e => e.amount = e.amount.toLocaleString());
      this.expenses = data;

    },
    insertInitailData() {
      const initialDataArray = [
        {
          id: this.getUuidv4(),
          parentsCategory: null,
          category: 'total',
          amount: 0,
          order: null,
          level: 1,
        },
        {
          id: this.getUuidv4(),
          parentsCategory: 'total',
          category: 'past',
          amount: 0,
          order: null,
          level: 2,
        },
        {
          id: this.getUuidv4(),
          parentsCategory: 'total',
          category: 'present',
          amount: 0,
          order: null,
          level: 2,
        },
        {
          id: this.getUuidv4(),
          parentsCategory: 'total',
          category: 'future',
          amount: 0,
          order: null,
          level: 2,
        },
      ]
      initialDataArray.forEach(eachData => this.insertData(eachData));
    },
    async insertData(dataHere) {
      try {
        const { error } = await supabase
          .from('expense')
          .insert(dataHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("getSession = ", data)
      console.log("error = ", error)
      return data;
    },
    sessionListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session;
        this.email = session?.user.email;
        this.loginBtnHandler();
      })
    },
    loginBtnHandler() {
      const session = this.session;
      if (session !== null) {
        this.loginMode = false;
      } else {
        this.loginMode = true;
      }
    },
    getUuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
  },
  components: {
    PieChart
  }
}
</script>

<style scoped>
@import '../style.css';
</style>