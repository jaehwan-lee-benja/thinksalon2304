<template>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">

        <select :class="pageSelect" v-model="pageName" @change="selectPage()">
          <option v-for="page in sortExpensePages" :key="page.id" :value="page.page_name">
            {{ page.page_name }}
          </option>
        </select>

        <button :class="pageSettingBtn" @click="openPageDiv()">페이지 설정하기</button>
        <div v-if="isPageDivOpened" :class="modal">
          <PageSettingView v-bind:expenses="expenses" :expensePages="expensePages" :isPageNameEdited="isPageNameEdited"
            @remove-e-by-pageId="removeExpenseByPageDelete" @create-new-page="createNewPage" @upsert-page="upsertPage"
            @delete-page="deletePage" @select-page="selectPage" @close-page-div="closePageDiv" />
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
            'saveEditedBtn_active': isEdited === true,
            'saveEditedBtn_inactive': isEdited === false
          }" :disabled="!isEdited" @click="editExpenses">편집한 내용 저장</button>
          <button :class="{
            'cancelEditedBtn_active': isEdited === true,
            'cancelEditedBtn_inactive': isEdited === false
          }" :disabled="!isEdited" @click="cancelEditing">편집 취소</button>
        </div>
        <div></div>
      </div>
      <div :class="viewGrid">

        <div :class="flowViewDiv">
          <FlowView v-bind:expenses="expenses" />
        </div>
        <div :class="listViewDiv">
          <ListView v-bind:expenses="expenses" :toggleActiveHandler="toggleActiveHandler" :totalExpenseId="totalExpenseId"
            @create-new-expense="createNewExpense" @remove-expense="removeExpense" @cancel-editing="cancelEditing"
            @toggle-sub-list="toggleSubList" />
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
import CssData from './views/CssData.vue'

export default {
  data() {
    return {

      totalExpenses: [],
      expenses: [],
      fetchedExpenses: [],
      selectedPageId: '',

      expensePages: [],
      fetchedExpensePages: [],
      isPageDivOpened: false,
      toggleActiveHandler: {},

    }
  },
  mixins: [LoginSessionModel, CssData],
  components: {
    ListView,
    FlowView,
    PageSettingView,
  },
  mounted() {
    this.fetchData()
  },
  computed: {
    sortExpensePages() {
      const clonedExpensePages = this.expensePages;
      return clonedExpensePages.sort((a, b) => a.order - b.order);
    },
    totalExpenseId() {
      if (this.expenses.length > 0) {
        return this.expenses.filter(e => e.level === 1)[0].id
      } else {
        return "1"
      }
    },
    isPageNameEdited() {

      const fetched = this.fetchedExpensePages.map(e => ({
        name: e.page_name,
        order: e.order
      })
      ).sort((a, b) => a.order - b.order);

      const edited = this.expensePages.map(e => ({
        name: e.page_name,
        order: e.order
      })
      ).sort((a, b) => a.order - b.order);

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);

      const result = (fetchedData || "") != (editedData || "")

      return result

    },
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
    getUuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    async deletePage(pageIdHere) {

      this.removeExpenseByPageDelete(pageIdHere);

      const removePage = this.expensePages.filter((e) => e.id == pageIdHere)[0]
      const orderRemoved = removePage.order;

      this.expensePages.forEach(e => {
        const order = e.order;
        if (order > orderRemoved) {
          const expensePageOrderChanged = this.expensePages[this.expensePages.indexOf(e)]
          expensePageOrderChanged.order = order - 1; //숫자 확인하기
        }
      });

      this.expensePages = this.expensePages.filter((t) => t !== removePage)

      this.expensePages.forEach(o => this.upsertPage(o))

      try {
        const { error } = await supabase
          .from('expense_page')
          .delete()
          .eq('id', pageIdHere)

        alert('삭제되었습니다.')

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    removeExpenseByPageDelete(pageIdHere) {
      const deleteExpensesArray = this.totalExpenses.filter((e) => e.page_id == pageIdHere)
      deleteExpensesArray.forEach(e => this.deleteData(e.id))
    },
    async createNewPage(newPageNameHere) {
      const o = {
        id: this.getUuidv4(),
        page_name: newPageNameHere,
        order: this.setOrderForPage()
      }
      await this.upsertPage(o);
      this.upsertInitailExpense(o.id);
      await this.fetchDataForPage()
      alert('신규 페이지가 생성되었습니다.')
    },
    async upsertPage(oHere) {
      try {
        const { error } = await supabase
          .from('expense_page')
          .upsert(oHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async upsertInitailExpense(idHere) {
      const initialExpenseData = {
        id: this.getUuidv4(),
        parents_id: null,
        category: '총계',
        amount: 0,
        order: null,
        level: 1,
        page_id: idHere
      }
      await this.upsertExpense(initialExpenseData)
    },
    toggleSubList(expenseHere) {
      this.controlToggleActiveHandler(expenseHere);
      if (expenseHere.level < 5) {
        expenseHere.show_sub_list = !expenseHere.show_sub_list;
        this.upsertExpense(expenseHere)
      }
    },
    controlToggleActiveHandler(expenseHere) {
      if (expenseHere.level == 5) {
        this.toggleActiveHandler[expenseHere.id] = false;
      } else {
        this.toggleActiveHandler[expenseHere.id] = true;
      }
    },
    cancelEditing() {
      this.expenses = "";
      this.expenses = JSON.parse(JSON.stringify(this.fetchedExpenses));
    },
    removeExpense(expenseHere) {

      const parentsId = expenseHere.parents_id;
      const orderRemoved = expenseHere.order;

      this.expenses.forEach(e => {
        const order = e.order;
        if (e.parents_id == parentsId) {
          if (order > orderRemoved) {
            this.expenses[this.expenses.indexOf(e)].order = order - 1;
          }
        }
      });

      this.expenses = this.expenses.filter((t) => t !== expenseHere)

      if (expenseHere.level > 1) {
        this.expenses = this.expenses.filter((t) => t.parents_id !== expenseHere.id)
      }

    },
    async upsertExpense(expenseHere) {
      try {
        const { error } = await supabase
          .from('expense')
          .upsert(expenseHere)
          .eq('id', expenseHere.id)
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
    editExpenses() {

      const confirmValue = confirm("수정된 내용을 저장하시겠습니까?")

      if (confirmValue) {
        const expensesIdArray = this.expenses.map(e => e.id);
        const fetchedExpensesIdArray = this.fetchedExpenses.map(e => e.id);

        // fetchedExpenses 중 expenses에 없는 id를 필터링해서 모으기
        const willBeDeletedIdArray = fetchedExpensesIdArray.filter(eachId => !expensesIdArray.includes(eachId));

        willBeDeletedIdArray.forEach(eachId => this.deleteData(eachId));

        this.expenses.forEach(e => {
          this.upsertExpense(e)
        })

        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

        alert('저장되었습니다.')
      }

    },
    createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere) {

      const levelForO = parentsLevelHere + 1;

      const o = {
        id: this.getUuidv4(),
        parents_id: parentsIdHere,
        category: newCategoryHere,
        amount: newAmountHere,
        order: this.setOrder(parentsIdHere),
        level: levelForO,
        show_sub_list: false,
        page_id: this.selectedPageId
      };

      if (levelForO < 5) {
        this.toggleActiveHandler[o.id] = true;
      } else {
        this.toggleActiveHandler[o.id] = false;
      }

      this.expenses.push(o);
    },
    setOrder(parentsIdHere) {
      const arr = this.expenses.filter(e => e.parents_id === parentsIdHere)
      const expenseLength = Object.keys(arr).length;
      return expenseLength + 1;
    },
    setOrderForPage() {
      const expensePagesLength = Object.keys(this.expensePages).length;
      return expensePagesLength;
    },
    async fetchData() {

      await this.fetchDataForPage()

      const a = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })
      const { data } = a;

      this.totalExpenses = data;

      await this.selectPage(); //페이지 선택 후 this.expenses가 만들어짐

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
    async selectPage(pageIdHere) {

      console.log("pageIdHere = ", pageIdHere)

      let selectedPage = {}

      if (pageIdHere != undefined) {
        this.selectedPageId = pageIdHere
        selectedPage = this.expensePages.filter(e => e.id === pageIdHere)[0]

      } else {

        if (this.pageName == undefined) {
          selectedPage = this.expensePages.filter(e => e.order === 0)[0]
        } else {
          selectedPage = this.expensePages.filter(e => e.page_name === this.pageName)[0]
        }

        // console.log("selectedPage = ", selectedPage);

        this.selectedPageId = selectedPage.id
      }

      this.pageName = selectedPage.page_name;

      // console.log("this.selectedPageId(1) = ", this.selectedPageId);

      // const test = this.totalExpenses.filter(e => {
      //   // console.log("e.page_id(2) =", e.page_id)
      //   // console.log("this.selectedPageId(2) = ", this.selectedPageId)
      //   if(e.page_id === this.selectedPageId){
      //     console.log("e.page_id(3) =", e.page_id)
      //     console.log("this.selectedPageId(3) = ", this.selectedPageId)
      //   }

      // }) // 이 부분이 읽히지 않고 있음

      // console.log("test = ", test);

      this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)

      // console.log("this.expenses = ", this.expenses);

      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
      this.expenses.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })

    },

    async fetchDataForPage() {
      console.log("check1")
      const a = await supabase
        .from('expense_page')
        .select()
      const { data } = a;
      this.expensePages = data;
      this.fetchedExpensePages = await JSON.parse(JSON.stringify(this.expensePages));
      console.log("check2")
    },

  }
}
</script>

<style scoped>
@import './style.css';
</style>