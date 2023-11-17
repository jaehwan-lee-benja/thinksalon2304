<template>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">

        <select :class="pageSelect" v-model="pageName" @change="selectPage()">
          <option v-for="(page, index) in this.expensePages" :key="index" :value="page.page_name">
            {{ page.page_name }}
          </option>
        </select>

        <button :class="pageSettingBtn" @click="openPageDiv()">페이지 설정하기</button>
        <div v-if="isPageDivOpened" :class="modal">
          <PageSettingView v-bind:expenses="expenses" :expensePages="expensePages"
            @remove-e-by-pageId="removeExpenseByPageDelete" />
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
      <div :class="controlGrid">
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
        <div></div>
      </div>
      <div :class="viewGrid">
        
        <div :class="flowViewDiv">
          <FlowView v-bind:expenses="expenses" />
        </div>
        <div :class="listViewDiv">
          <ListView v-bind:expenses="expenses" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabaseClient.js'
import LoginSessionModel from './views/LoginSessionModel.vue'
import ListView from './views/ListView.vue'
import FlowView from './views/FlowView.vue'
import PageSettingView from './views/PageSettingView.vue'

export default {
  data() {
    return {

      totalExpenses: [],
      expenses: [],
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
      pageSelect: 'pageSelect',
      controlGrid: 'controlGrid',
      saveEditedDiv: 'saveEditedDiv',
      saveEditedStyle_active: 'saveEditedStyle_active',
      saveEditedStyle_inactive: 'saveEditedStyle_inactive',
      cancelEditedStyle_active: 'cancelEditedStyle_active',
      cancelEditedStyle_inactive: 'cancelEditedStyle_inactive',
      viewGrid: 'viewGrid',
      listViewDiv: 'listViewDiv',
      flowViewDiv: 'flowViewDiv',
      pageSettingBtn: 'pageSettingBtn',
    }
  },
  mixins: [LoginSessionModel],
  components: {
    ListView,
    FlowView,
    PageSettingView,
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

      const edited = this.expenses.map(e => ({
        category: e.category,
        amount: Number(e.amount)
      })
      );

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);
      const result = (fetchedData || "") != (editedData || "")

      return result

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
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

      this.expenses.forEach(e => {
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
      this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
      console.log("this.expenses @selectPage= ", this.expenses);
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
      this.expenses.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })
      return this.expenses
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