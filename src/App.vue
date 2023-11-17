<template>
  <div :class="saveEditedDiv">
    <button :class="{
      'saveEditedStyle_active': isEdited === true,
      'saveEditedStyle_inactive': isEdited === false
    }" :disabled="!isEdited" @click="editExpenses">편집한 내용 저장</button>
    <button :class="{
      'cancelEditedStyle_active': isEdited === true,
      'cancelEditedStyle_inactive': isEdited === false
    }" :disabled="!isEdited" @click="cancelEditing">편집 취소</button>
  </div>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">

        <div :class="pageDiv">
          <select :class="pageSelect" v-model="pageName" @change="selectPage()">
            <option v-for="(page, index) in this.expensePages" :key="index" :value="page.page_name">
              {{ page.page_name }}
            </option>
          </select>
        </div>

        <button @click="openPageDiv()">페이지 설정하기</button>
        <div v-if="isPageDivOpened" :class="modal">
          <PageList v-bind:expenses2="expenses2" @remove-e-by-pageId="removeExpenseByPageDelete" />
        </div>
        <div v-if="isPageDivOpened" :class="modalOverlay" @click="closePageDiv"></div>

      </div>
      <div :class="loginDiv">
        <div v-if="loginMode">
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
      <ListEditingView v-bind:expenses2="expenses2" />
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

      totalExpenses: [],
      expenses2: [],
      fetchedExpenses: [],
      selectedPageId: '',

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
    this.fetchData(),
      this.fetchDataForPage()
  },
  computed: {
    isEdited() {

      const fetched = this.fetchedExpenses.map(e => ({
        category: e.category,
        amount: Number(e.amount)
      })
      );

      const edited = this.expenses2.map(e => ({
        category: e.category,
        amount: Number(e.amount)
      })
      );

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);
      const result = (fetchedData || "") != (editedData || "")

      console.log("result = ", result)

      return false

    },
  },
  methods: {
    async fetchData() {

      this.fetchDataForPage()
      const a = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })
      const { data } = a;

      this.totalExpenses = data;
      this.selectPage();
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses2));

      this.expenses2.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })

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
      this.expenses2 = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
      console.log("this.expenses2 @selectPage= ", this.expenses2);
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses2));
      this.expenses2.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })
      return this.expenses2
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