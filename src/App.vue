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
          <PageSettingView v-bind:expenses="expenses" :expensePages="expensePages" :isPageEdited="isPageEdited"
            @remove-e-by-pageId="removeExpenseByPageDelete" @create-new-page="createNewPage" @edit-page="editPage"
            @remove-page="removePage" @cancel-editing-page="cancelEditingPage" />
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
          }" :disabled="!isEdited" @click="editExpense">편집한 내용 저장</button>
          <button :class="{
            'cancelEditedBtn_active': isEdited === true,
            'cancelEditedBtn_inactive': isEdited === false
          }" :disabled="!isEdited" @click="cancelEditingExpense">편집 취소</button>
        </div>
        <div></div>
      </div>
      <div :class="viewGrid">

        <div :class="flowViewDiv">
          <FlowView v-bind:expenses="expenses" />
        </div>
        <div :class="listViewDiv">
          <ListView v-bind:expenses="expenses" :toggleActiveHandler="toggleActiveHandler" :totalExpenseId="totalExpenseId"
            @create-new-expense="createNewExpense" @remove-expense="removeExpense"
            @cancel-editing-expense="cancelEditingExpense" @toggle-sub-list="toggleSubList" />
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
    isPageEdited() {

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
    async cancelEditingPage() {
      this.expensePages = "";
      this.expensePages = JSON.parse(JSON.stringify(this.fetchedExpensePages));
    },
    editPage() {

      const confirmValue = confirm("편집된 내용을 저장하시겠습니까?")

      if (confirmValue) {
        const idArray = this.expensePages.map(e => e.id);
        const fetchedIdArray = this.fetchedExpensePages.map(e => e.id);

        // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기
        const willBeDeletedIdArray = fetchedIdArray.filter(eachId => !idArray.includes(eachId));

        willBeDeletedIdArray.forEach(eachId => this.deletePage(eachId));

        this.expensePages.forEach(e => this.upsertPage(e))

        this.fetchedExpensePages = JSON.parse(JSON.stringify(this.expensePages));

        alert('저장되었습니다.')
      }

    },
    getUuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    removePage(pageHere) {
      const orderRemoved = pageHere.order;

      this.expensePages.forEach(e => {
        const order = e.order;
        if (order > orderRemoved) {
          const expensePageOrderChanged = this.expensePages[this.expensePages.indexOf(e)]
          expensePageOrderChanged.order = order - 1;
        }
      });

      this.expensePages = this.expensePages.filter((t) => t !== pageHere)

    },
    async deletePage(pageHere) {
      this.removeExpenseByPageDelete(pageHere.id);
      try {
        const { error } = await supabase
          .from('expense_page')
          .delete()
          .eq('id', pageHere.id)

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
      deleteExpensesArray.forEach(e => this.deleteExpense(e.id))
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
    cancelEditingExpense() {
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
    async deleteExpense(expenseId) {
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
    editExpense() {

      const confirmValue = confirm("편집된 내용을 저장하시겠습니까?")

      if (confirmValue) {
        const idArray = this.expenses.map(e => e.id);
        const fetchedidArray = this.fetchedExpenses.map(e => e.id);

        // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기
        const willBeDeletedIdArray = fetchedidArray.filter(eachId => !idArray.includes(eachId));

        willBeDeletedIdArray.forEach(eachId => this.deleteExpense(eachId));

        this.expenses.forEach(e => this.upsertExpense(e))
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
      if (!this.isPageEdited) {
        // 편집 내용이 없는 경우, 모달창 바깥을 눌러서 종료하는 경우
        this.isPageDivOpened = false;
        this.cancelEditingPage();
      } else {
        // 편집한 내용이 있는 경우,
        const text = "페이지에 편집된 내용이 있습니다. \n [확인]을 누르면, 편집된 내용은 저장되지 않고 진행됩니다. \n *편집 내용을 저장하고 싶은 경우, [취소]>[편집 저장하기] 후 종료"
        const confirmValue = confirm(text)

        if (confirmValue) {
          // 편집을 취소하며, 모달창을 종료하는 경우
          this.isPageDivOpened = false;
          this.cancelEditingPage();
        } else {
          // 편집을 계속하기
        }
      }
    },
    async selectPage() {

      let selectedPage = {}

      if (this.pageName == undefined) {
        // 첫 로딩을 한 경우
        selectedPage = this.expensePages.filter(e => e.order === 0)[0]
      } else {
        // selectbox를 통해 페이지를 선택하는 경우
        selectedPage = this.expensePages.filter(e => e.page_name === this.pageName)[0]
      }

      this.selectedPageId = selectedPage.id

      this.pageName = selectedPage.page_name;

      this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
      
      this.expenses.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })

    },

    async fetchDataForPage() {
      const a = await supabase
        .from('expense_page')
        .select()
      const { data } = a;
      this.expensePages = data;
      this.fetchedExpensePages = await JSON.parse(JSON.stringify(this.expensePages));
    },

  }
}
</script>

<style scoped>
@import './style.css';
</style>