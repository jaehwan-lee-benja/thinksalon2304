<template>
  <div>
    <div :class="unitDiv">
      <button @click="test">test</button>
      <h2>돈이 나가는 영역</h2>
      <ul>
        <li v-for="expense in sortTotalExpenses" :key="expense.id">
          <span>결정값 : </span>
          <input :class="amountStyle" v-model="expense.amount" placeholder="0" readonly>
          <input :class="amountStyle" v-model="this.getPastAmount2" placeholder="0" readonly>
        </li>
        <li>
          <input :class="amountStyle" v-model="pastAmount" placeholder="0" readonly>
        </li>
        <li>계산값 : <input :class="amountStyle" v-model="sumTotalExpenses" readonly></li>
      </ul>
      <!-- 세가지 값 보여주기 -->
      <p>과거형 결정값(1): {{ getPastAmount }}</p>
      <p>과거형 결정값(2): {{ pastAmount }}</p>
      <p>과거형 결정값(3): {{ getPastAmount2() }}</p>
      <!-- <p>과거형 결정값: {{ (this.expenses.category = past).amount }}</p> -->
      <p>현재형 결정값: {{ getPresentAmount }}</p>
      <p>미래형 결정값: {{ getFutureAmount }}</p>

      <!-- <Pie :chart-options="chartOptions" :chart-data="getChartData" :chart-id="chartId" :dataset-id-key="datasetIdKey"
        :plugins="plugins" :css-classes="cssClasses" :styles="styles" :width="width" :height="height" /> -->

      <PieChart v-bind:expenses="expenses"/>

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
</template>


<script>

import { supabase } from '../lib/supabaseClient.js'
import PieChart from './Pie.vue'
// import { Pie } from 'vue-chartjs'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)


// export const customData = [100];
// export const customData = [this.expenses[0].amount, 200, 300];
// export const customData = [this.searchPastAmout(), 200, 300];
// export const customData = [this.getPastAmount, this.getPresentAmount, this.getFutureAmount];

export function customData() {
  const result1 = this.expenses.filter(e => e.category === "past");
  const result2 = result1[0]
  let result3 = "no data"
  if (result1.length > 0) { result3 = result2.amount }
  return [result3];
}

export default {
  // name: 'PieChart',
  // components: {
  //   Pie
  // },
  // props: {
  //   chartId: {
  //     type: String,
  //     default: 'pie-chart'
  //   },
  //   datasetIdKey: {
  //     type: String,
  //     default: 'label'
  //   },
  //   width: {
  //     type: Number,
  //     default: 400
  //   },
  //   height: {
  //     type: Number,
  //     default: 400
  //   },
  //   cssClasses: {
  //     default: '',
  //     type: String
  //   },
  //   styles: {
  //     type: Object,
  //     default: () => { }
  //   },
  //   plugins: {
  //     type: Array,
  //     default: () => []
  //   }
  // },
  data() {
    return {

      chartData: {
        labels: ['과거형 지출', '현재형 지출', '미래형 지출'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
            data: [100, 200, 300]
            // data: [getPastAmount3()]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },

      expenses: [],
      pastAmount: '',
      customData2: [100, 200, 300],

      bodyDiv: 'bodyDiv',
      unitDiv: 'unitDiv',
      subGrid: 'subGrid',

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
      this.sessionListener(),
      this.searchPastAmout()
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
    test() {
      console.log("test = ", this.getFutureAmount2());
    },
    getPastAmount2() {
      console.log("getPastAmount2 here!");
      console.log("this.expenses = ", this.expenses);
      if (this.expenses != undefined) {
        const result1 = this.expenses.filter(e => e.category === "present");
        const result2 = result1[0]
        let result3 = "2"
        if (result1.length > 0) { result3 = result2.amount }
        console.log("result3 = ", result3);
        return result3;
      }
      return 1
    },
    // getPastAmount2() {
    //   const result1 = this.expenses.filter(e => e.category === "past");
    //   const result2 = result1[0]
    //   let result3 = "no data"
    //   if(result1.length > 0 ){ result3 = result2.amount }
    //   return result3;
    // },
    getPresentAmount2() {
      const result1 = this.expenses.filter(e => e.category === "present");
      const result2 = result1[0]
      let result3 = "no data"
      if (result1.length > 0) { result3 = result2.amount }
      return result3;
    },
    getFutureAmount2() {
      const result1 = this.expenses.filter(e => e.category === "future");
      const result2 = result1[0]
      let result3 = "no data"
      if (result1.length > 0) { result3 = result2.amount }
      return result3;
    },
    searchPastAmout() {
      console.log("searchPastAmout here!");
      console.log("this.expenses = ", this.expenses);
      if (this.expenses != undefined) {
        const result1 = this.expenses.filter(e => e.category === "present");
        const result2 = result1[0]
        let result3 = "no data"
        if (result1.length > 0) { result3 = result2.amount }
        return result3;
      }
      return "nothing!"
    },
    async loginGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
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
        // console.log("sessionListener = ", event, session)
        this.session = session;
        this.email = session.user.email;
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