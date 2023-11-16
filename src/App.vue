<template>
  <div>
    <ExpensesData />
  </div>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">
        <button @click="openPageDiv()">페이지 설정하기</button>
          <div v-if="isPageDivOpened" :class="modal">
            <PageListView v-bind:expenses="expenses" @remove-e-by-pageId="removeExpenseByPageDelete" />
          </div>
          <div v-if="isPageDivOpened" :class="modalOverlay" @click="closePageDiv"></div>
      </div>
      <div :class="loginDiv">
        <!-- <LogInView /> -->
        <LogInView v-bind:testData="testData"/>
      </div>
    </div>
    <div :class="mainDiv">
      <div :class="controlGrid">
        <div :class="viewGrid">
          <div :class="listViewDiv">
          </div>
          <div :class="flowViewDiv">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabaseClient.js'
import LogInView from './views/LogInView.vue'
import PageListView from './views/PageListView.vue'
import ExpensesData from './data/ExpensesData.vue'

export default {
  name: 'App',
  props: {
    testData: {
        type: Object,
        default: () => { }
    },
  },
  data() {
    return {
      expensePages: [],
      isPageDivOpened: false,

      loginmenuGrid: 'loginmenuGrid',
      menuMainGrid: 'menuMainGrid',
      menuGrid: 'menuGrid',
      mainDiv: 'mainDiv',
      loginBtn: 'loginBtn',
      pageListDiv: 'pageListDiv',
      loginDiv: 'loginDiv',
      modal: 'modal',
      modalOverlay: 'modalOverlay',
      pageDiv: 'pageDiv',
      pageSelect: 'pageSelect',
      controlGrid: 'controlGrid',
      viewGrid: 'viewGrid',
      flowViewDiv: 'flowViewDiv',
      listViewDiv: 'listViewDiv',
    }
  },
  // mixins: [LogInView],
  components: {
    ExpensesData,
    PageListView,
    LogInView,
  },
  mounted() {
    this.testHere()
    this.fetchDataForPage()
  },
  methods: {
    testHere() {
      console.log("testData @App = ", this.testData);
    },
    openPageDiv() {
        this.isPageDivOpened = true;
    },
    closePageDiv() {
        this.isPageDivOpened = false;
    },

    selectPage() {
      let selectedPage = this.expensePages.filter(e => e.page_name === this.pageName)
      if (selectedPage.length == 0) {
          selectedPage = [this.expensePages[0]]
      }
      this.selectedPageId = selectedPage[0].id
      this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
      // 여기부터
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
      this.expenses.forEach(e => {
          if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })
      // 여기까지 함수로 묶기 필요(반복됨)
    },

    async fetchDataForPage() {
      const a = await supabase
          .from('expense_page')
          .select()
      const { data } = a;
      this.expensePages = data;
    },

  }
}
</script>

<style scoped>
  @import './style.css';
</style>