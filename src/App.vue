<template>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <!-- <div :class="pageDiv">
          <select :class="pageSelect" v-model="pageName" @change="selectPage()">
              <option v-for="(page, index) in this.expensePages" :key="index" :value="page.page_name">
                  {{ page.page_name }}
              </option>
          </select>
      </div> -->
      <div :class="pageListDiv">
        <button @click="openPageDiv()">페이지 설정하기</button>
          <div v-if="isPageDivOpened" :class="modal">
                <PageList v-bind:expenses="expenses" @remove-e-by-pageId="removeExpenseByPageDelete" />
          </div>
          <div v-if="isPageDivOpened" :class="modalOverlay" @click="closePageDiv"></div>
      </div>
      <div :class="loginDiv"> 
        <div v-if="loginMode" >
          <button @click="loginGoogle">구글 로그인</button>
          <p> *버튼을 눌러 로그인할 수 있습니다.</p>
        </div>
        <div v-else>
          <p> 로그인 계정: {{ email }}</p>
          <button :class="loginBtn" @click="signout">로그아웃</button>
        </div>
      </div>
    </div>
    <div :class="mainDiv">
      <ListEditingView />
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabaseClient.js'
import LogIn from './views/LogIn.vue'
import ListEditingView from './views/ListEditingView.vue'
import PageList from './views/PageList.vue'

export default {
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
    }
  },
  mixins: [LogIn],
  components: {
    ListEditingView,
    PageList,
  },
  mounted() {
    this.fetchDataForPage()
  },
  methods: {
    openPageDiv() {
        this.isPageDivOpened = true;
    },
    closePageDiv() {
        this.isPageDivOpened = false;
    },

    selectPage() {
      let selectedPage = this.expensePages.filter(e => e.page_name === this.pageName)
      console.log("this.expensePages = ", this.expensePages);
      if (selectedPage.length == 0) {
          selectedPage = [this.expensePages[0]]
      }
      console.log("selectedPage[0] = ", selectedPage[0]);
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
      console.log("this.expensePages = ", this.expensePages);
    },

  }
}
</script>

<style scoped>
  @import './style.css';
</style>