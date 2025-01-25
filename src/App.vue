<template>
  <div class="menuMainGrid">
    <div>
      <button @click="toggleMenu" :class="{
        'toggleButtonClicked': menuVisible === true,
        'toggleButton': menuVisible === false
      }">☰</button>
      <div class="menuGrid" v-show="menuVisible">
        <div class="pageListDiv">

          <div class="menuBtnDiv">
            <button class="menuBtn" @click="showSection('flowView')">페이지 보기</button>
            <button class="menuBtn" @click="showSection('pageSetting')">페이지 설정하기</button>
            <button class="menuBtn" @click="showSection('accountSetting')">계좌 설정하기</button>
            <!-- <button class="menuBtn" @click="openContact">문의하기</button> -->
          </div>

        </div>
        <div class="loginDiv">
          <div v-if="loginMode">
            <button class="loginBtn" @click="loginGoogle">구글 로그인</button>
            <p> *버튼을 눌러 로그인할 수 있습니다.</p>
          </div>
          <div v-else>
            <p> 로그인 계정: {{ email }}</p>
            <button class="logoutBtn" @click="signout">로그아웃</button>
          </div>
        </div>
      </div>
    </div>
    <div class="mainDiv">
      <div class="flowViewDiv" v-if="currentSection === 'flowView'">
        <div :class="{
          'pageNameDivMenuClicked': menuVisible === true,
          'pageNameDiv': menuVisible === false
        }">
          <h2>{{ this.pageName }}</h2>
        </div>
        <FlowView v-bind:expenses="expenses" :fetchedExpenses="fetchedExpenses" :clickedExpenseId="clickedExpenseId"
          :clickedEdgeTargetId="clickedEdgeTargetId" :editExpenseWorked="editExpenseWorked"
          @point-clicked-li="pointClickedLi" @cancel-point-clicked-li="cancelPointClickedLi"
          @point-clicked-Edge="pointClickedEdge" @cancel-point-clicked-edge="cancelPointClickedEdge"
          @remove-expense="removeExpense" :accounts="accounts" @select-account="selectAccount"
          :createdExpenseIdForMonitor="createdExpenseIdForMonitor" :session="session"
          :createdExpenseIdByCreateNewE="createdExpenseIdByCreateNewE" @create-new-expense="createNewExpense"
          :isEdited="isEdited" @edit-expense="editExpense" @cancel-editing-expense="cancelEditingExpense"
          :sortExpensePages="sortExpensePages" :previousPageName="previousPageName" :expensePages="expensePages"
          @emit-selected-page="emitSelectedPage">
        </FlowView>
      </div>
      <div class="flowViewDiv" v-if="currentSection === 'pageSetting'">
        <div :class="{
          'pageNameDivMenuClicked': menuVisible === true,
          'pageNameDiv': menuVisible === false
        }">
          <h2>페이지 설정하기</h2>
        </div>
        <PageSettingView v-bind:expenses="expenses" :expensePages="expensePages" :isPageEdited="isPageEdited"
          @remove-e-by-pageId="removeExpenseByPageDelete" @create-new-page="createNewPage" @edit-page="editPage"
          @remove-page="removePage" @cancel-editing-page="cancelEditingPage" />
      </div>
      <div class="flowViewDiv" v-if="currentSection === 'accountSetting'">
        <div :class="{
          'pageNameDivMenuClicked': menuVisible === true,
          'pageNameDiv': menuVisible === false
        }">
          <h2>계좌 설정하기</h2>
        </div>
        <AccountSettingView v-bind:expenses="expenses" :accounts="accounts" :isAccountEdited="isAccountEdited"
          @create-new-account="createNewAccount" @edit-account="editAccount" @remove-account="removeAccount"
          @cancel-editing-account="cancelEditingAccount" />
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabaseClient.js'
import LoginSessionModel from './views/LoginSessionModel.vue'
import FlowView from './views/FlowView.vue'
import PageSettingView from './views/PageSettingView.vue'
import AccountSettingView from './views/AccountSettingView.vue'
import { ref } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
  // setup() {
  //   // 현재 표시할 섹션을 저장하는 상태
  //   const currentSection = ref('flowView');

  //   // 섹션을 변경하는 메서드
  //   const showSection = (section) => {
  //     if(section === 'flowView') {
  //       console.log(this.selectedPageId)
  //     }
  //     currentSection.value = section;
  //   };

  //   return {
  //     currentSection,
  //     showSection,
  //   };
  // },
  setup() {
    const { proxy } = getCurrentInstance(); // 현재 컴포넌트 인스턴스를 가져옴
    const currentSection = ref('flowView');

    const showSection = (section) => {
      if (section === 'flowView') {
        console.log(proxy.updatedPageName); // data()의 selectedPageId를 참조
        console.log(proxy.expenses)
        console.log(proxy.expenses.find(e => e.id === proxy.selectedPageId))
      }
      currentSection.value = section;
    };

    return {
      currentSection,
      showSection,
    };
  },
  data() {
    return {

      menuVisible: false,

      totalExpenses: [],
      expenses: [],
      fetchedExpenses: [],
      selectedPageId: '',

      accounts: [],
      fetchedAccounts: [],
      isAccountSettingOpened: false,
      previousPageName: '',

      expensePages: [],
      fetchedExpensePages: [],
      isPageSettingOpened: false,
      createdExpenseIdForMonitor: '',
      createdExpenseIdByCreateNewE: '',

      toggleActiveHandler: {},
      isThereChildMonitor: {},
      clickedExpenseId: '',
      clickedEdgeTargetId: '',

      editExpenseWorked: true,

    }
  },
  mixins: [LoginSessionModel],
  components: {
    FlowView,
    PageSettingView,
    AccountSettingView,
  },
  mounted() {
    this.fetchData()
  },
  computed: {
    isAnyOpenedLi() {
      const anyOpened = this.expenses.filter(e => e.show_sub_list === true);
      if (anyOpened.length > 0) {
        return true
      } else {
        return false
      }
    },
    sortExpensePages() {
      const clonedExpensePages = this.expensePages;
      return clonedExpensePages.sort((a, b) => a.order - b.order);
    },
    totalExpenseId() {
      if (this.expenses.length > 0) {
        return this.expenses.find(e => e.level === 1).id
      } else {
        return "1"
      }
    },
    isAccountEdited() {

      const fetched = this.fetchedAccounts.map(e => ({
        name: e.name,
        bank: e.bank,
        number: e.number,
        role: e.role,
        type: e.type,
        transfer_fee: e.transfer_fee,
        memo: e.memo,
      })
      ).sort((a, b) => a.order - b.order);

      const edited = this.accounts.map(e => ({
        name: e.name,
        bank: e.bank,
        number: e.number,
        role: e.role,
        type: e.type,
        transfer_fee: e.transfer_fee,
        memo: e.memo,
      })
      ).sort((a, b) => a.order - b.order);

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);

      const result = (fetchedData || "") != (editedData || "")

      return result

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
        amount: Number(e.amount),
        memo: e.memo,
        account_id: e.account_id
      })
      );

      const edited = this.expenses.map(e => ({
        category: e.category,
        amount: Number(e.amount),
        memo: e.memo,
        account_id: e.account_id
      })
      );

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);
      const result = (fetchedData || "") != (editedData || "")

      return result

    },
  },
  methods: {
    emitSelectedPage(selectedPageHere) {
      this.selectedPageId = selectedPageHere.id
      this.setPageBySelectPage(selectedPageHere)
    },
    toggleMenu() {
      this.menuVisible = !this.menuVisible; // 상태를 반전
    },
    selectAccount(expenseIdHere, accountIdHere) {
      this.expenses.forEach(e => {
        if (e.id == expenseIdHere) {
          e.account_id = accountIdHere;
        }
      })
    },
    openAccountDiv() {
      this.isAccountSettingOpened = true;
    },
    openContact() {
      window.open("http://pf.kakao.com/_QxewxfT", "_blank");
    },
    updatedPageName() {
      return this.expenses.find(e => e.id === this.selectedPageId).name
    },
    cancelPointClickedLi() {
      this.clickedExpenseId = ""
    },
    cancelPointClickedEdge() {
      this.clickedEdgeTargetId = ""
    },
    openOrCloseLi() {
      if (this.isAnyOpenedLi) {

        this.expenses.forEach(e => {
          e.show_sub_list = false;
          this.upsertExpense(e);
        })

      } else {

        // 자식요소가 없을 때는, 펼치지지 않도록 설정
        const parentsAndChildArr = this.expenses.map(e2 => {
          return {
            "parents": this.expenses.find(e3 => e3.id === e2.id),
            "children": this.expenses.find(e3 => e3.parents_id === e2.id)
          }
        })

        parentsAndChildArr.forEach(e4 => {
          const parentsExpense = e4.parents
          if (e4.children && Object.keys(e4.children).length > 0) {
            parentsExpense.show_sub_list = true;
            this.upsertExpense(parentsExpense);
          } else {
            parentsExpense.show_sub_list = false;
            this.upsertExpense(parentsExpense);
          }
        })

      }
    },
    pointClickedLi(idHere) {
      this.clickedExpenseId = idHere
      this.updateParentsToggle(idHere)
    },
    pointClickedEdge(idHere) {
      this.clickedEdgeTargetId = idHere
    },
    async cancelEditingPage() {
      this.expensePages = "";
      this.expensePages = JSON.parse(JSON.stringify(this.fetchedExpensePages));
    },
    async cancelEditingAccount() {
      this.accounts = "";
      this.accounts = JSON.parse(JSON.stringify(this.fetchedAccounts));
    },
    isThereSameName(arrHere) {
      const setCollection = new Set(arrHere.map(JSON.stringify));
      const isDuplicate = setCollection.size < arrHere.length;
      return isDuplicate;
    },
    async editAccount() {

      const confirmValue = confirm("편집된 내용을 저장하시겠습니까?")

      if (confirmValue) {

        // 페이지 이름 수정시, 이름이 중복되는 경우 거르기
        const nameArr = this.accounts.map(e => ({ "name": e.name }))
        const isDuplicate = this.isThereSameName(nameArr)

        if (!isDuplicate) {
          const idArray = this.accounts.map(e => e.id);
          const fetchedIdArray = this.fetchedAccounts.map(e => e.id);

          // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기
          const willBeDeletedIdArray = fetchedIdArray.filter(eachId => !idArray.includes(eachId));

          willBeDeletedIdArray.forEach(eachId => this.deleteAccount(eachId));

          this.accounts.forEach(e => this.upsertAccount(e))

          this.fetchedAccounts = JSON.parse(JSON.stringify(this.accounts));

          alert('저장되었습니다.')

        } else {
          alert('같은 별명이 있습니다. 다른 별명으로 다시 작성해주시기 바랍니다.')
        }
      }

    },
    async editPage() {

      const confirmValue = confirm("편집된 내용을 저장하시겠습니까?")

      if (confirmValue) {

        // 페이지 이름 수정시, 이름이 중복되는 경우 거르기
        const nameArr = this.expensePages.map(e => ({ "name": e.page_name }))
        const isDuplicate = this.isThereSameName(nameArr)

        if (!isDuplicate) {
          const idArray = this.expensePages.map(e => e.id);
          const fetchedIdArray = this.fetchedExpensePages.map(e => e.id);

          // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기
          const willBeDeletedIdArray = fetchedIdArray.filter(eachId => !idArray.includes(eachId));

          willBeDeletedIdArray.forEach(eachId => this.deletePage(eachId));

          this.expensePages.forEach(e => this.upsertPage(e))

          this.fetchedExpensePages = JSON.parse(JSON.stringify(this.expensePages));

          alert('저장되었습니다.')

          // 페이지 이름이 업데이트 되거나, 페이지가 삭제된 경우를 위한 함수
          this.selectPageByEditPage();

        } else {
          alert('같은 페이지 이름이 있습니다. 다른 이름으로 다시 작성해주시기 바랍니다.')
        }
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
          const orderChanged = this.expensePages[this.expensePages.indexOf(e)]
          orderChanged.order = order - 1;
        }
      });

      this.expensePages = this.expensePages.filter((t) => t !== pageHere)

    },
    removeAccount(accountHere) {
      const orderRemoved = accountHere.order;

      this.accounts.forEach(e => {
        const order = e.order;
        if (order > orderRemoved) {
          const orderChanged = this.accounts[this.accounts.indexOf(e)]
          orderChanged.order = order - 1;
        }
      });

      this.accounts = this.accounts.filter((t) => t !== accountHere).sort((a, b) => a.order - b.order);

    },
    async deletePage(idHere) {
      this.removeExpenseByPageDelete(idHere);
      try {
        const { error } = await supabase
          .from('expense_page')
          .delete()
          .eq('id', idHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteAccount(idHere) {
      try {
        const { error } = await supabase
          .from('account')
          .delete()
          .eq('id', idHere)
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
      const isThereSamePageName = this.expensePages.filter((e) => e.page_name == newPageNameHere)
      if (isThereSamePageName.length == 0) {
        const o = {
          id: this.getUuidv4(),
          page_name: newPageNameHere,
          order: this.setOrderForPage()
        }
        await this.upsertPage(o);
        this.upsertInitailExpense(o.id);
        await this.fetchDataForPage()
        alert('신규 페이지가 생성되었습니다.')
      } else if (newPageNameHere == '') {
        alert('페이지 이름이 비어있습니다. 페이지 이름을 작성해주시기 바랍니다.')
      } else {
        alert('같은 페이지 이름이 있습니다. 다른 이름으로 다시 작성해주시기 바랍니다.')
      }

    },
    async createNewAccount(newAccountHere) {
      const isThereSameAccountName = this.accounts.filter((e) => e.name == newAccountHere.name)
      const o = newAccountHere
      if (isThereSameAccountName.length == 0) {
        o.id = this.getUuidv4(),
          o.order = this.setOrderForAccount()
        await this.upsertAccount(o);
        await this.fetchDataForAccount()
        alert('신규 계좌가 추가되었습니다.')
      } else if (newAccountHere.name == '') {
        alert('계좌 별명이 비어있습니다. 작성해주시기 바랍니다.')
      } else {
        alert('같은 계좌 별명이 있습니다. 다른 별명으로 다시 작성해주시기 바랍니다.')
      }

    },
    async upsertAccount(oHere) {
      try {
        const { error } = await supabase
          .from('account')
          .upsert(oHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
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
        memo: null,
        order: null,
        level: 1,
        page_id: idHere,
        show_sub_list: null,
      }
      this.totalExpenses.push(initialExpenseData);

      // 질문: 이것이 제대로 되고 있는 것인지?
      await this.upsertExpense(initialExpenseData)

      this.createdExpenseIdForMonitor = initialExpenseData.id;

    },
    updateParentsToggle(idHere) {

      const expense = this.expenses.find(e => e.id === idHere)
      const ParentsToUpdate = this.findParentsExpense(expense, []);
      ParentsToUpdate.forEach(e => {
        e.show_sub_list = true;
        this.upsertExpense(e)
      })

    },
    findParentsExpense(childHere, resultHere) {
      const parents = this.expenses.filter((t) => t.id === childHere.parents_id);

      parents.forEach((parents) => {
        resultHere.push(parents);
        this.findParentsExpense(parents, resultHere);
      });

      return resultHere;
    },

    toggleSubList(expenseHere) {
      this.controlToggleActiveHandler(expenseHere);
      this.controlIsThereChildMonitor(expenseHere);
      if (expenseHere.level < 5) {
        expenseHere.show_sub_list = !expenseHere.show_sub_list;

        // show_sub_list에 대해 서버에 올라가는 값과 로컬에 저장해둔 fetched값을 맞추는 작업
        this.fetchedExpenses.forEach(e => {
          if (e.id == expenseHere.id) {
            e.show_sub_list = expenseHere.show_sub_list
          }
        })

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
    controlIsThereChildMonitor(expenseHere) {
      // 새 리스트 만들기 하는 경우, child가 없으면 new가 뜨도록 하는 방식
      const children = this.expenses.filter((e) => e.parents_id === expenseHere.id);
      if (children.length > 0) {
        this.isThereChildMonitor[expenseHere.id] = true;
      } else {
        this.isThereChildMonitor[expenseHere.id] = false;
      }
    },
    cancelEditingExpense() {
      this.expenses = "";
      this.expenses = JSON.parse(JSON.stringify(this.fetchedExpenses));
      this.expenses.forEach(e => this.controlIsThereChildMonitor(e.id)); // 새리스트 만들기 관련
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

      this.expenses = this.expenses.filter((t) => t !== expenseHere);
      this.removeChildrenExpense(expenseHere);

    },
    removeChildrenExpense(expenseHere) {
      // 레벨 이하의 모든 자식 요소를 찾아내기
      const childrenToDelete = this.findChildrenExpense(expenseHere, []);

      // 자식 요소와 자신을 삭제
      this.expenses = this.expenses.filter((t) => !childrenToDelete.includes(t));

    },
    findChildrenExpense(parentHere, resultHere) {
      const children = this.expenses.filter((t) => t.parents_id === parentHere.id);

      children.forEach((child) => {
        resultHere.push(child);
        this.findChildrenExpense(child, resultHere);
      });

      return resultHere;
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
      } finally {
        // 성공하던 실패하던 실행되는 곳
      }
    },
    async deleteExpense(expenseIdHere) {
      try {
        const { error } = await supabase
          .from('expense')
          .delete()
          .eq('id', expenseIdHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async editExpense() {

      const confirmValue = confirm("편집된 내용을 저장하시겠습니까?")

      if (confirmValue) {
        const idArray = this.expenses.map(e => e.id);
        const fetchedidArray = this.fetchedExpenses.map(e => e.id);

        const deleteOrUpsert = async () => {
          // fetchedArray 중 기존 Array에 없는 id를 필터링해서 모으기
          const willBeDeletedIdArray = fetchedidArray.filter(eachId => !idArray.includes(eachId));

          const deleteE = willBeDeletedIdArray.map(async (eachId) => {
            return await this.deleteExpense(eachId)
          })

          const upsertE = this.expenses.map(async (e) => {
            return await this.upsertExpense(e)
          })

          const result = await Promise.allSettled(deleteE.concat(upsertE))

          this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses))

          return result
        }

        deleteOrUpsert().then(() => {
          // flowView.vue로 저장 완료됨을 알려주기
          this.editExpenseWorked = !this.editExpenseWorked;
          alert('저장되었습니다.')
        })

      }

    },
    createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere, selectedAccountIdHere) {

      const levelForO = parentsLevelHere + 1;

      const o = {
        id: this.getUuidv4(),
        parents_id: parentsIdHere,
        category: newCategoryHere,
        amount: newAmountHere,
        memo: null,
        order: this.setOrder(parentsIdHere),
        level: levelForO,
        show_sub_list: false,
        page_id: this.selectedPageId,
        account_id: selectedAccountIdHere
      };

      if (levelForO < 5) {
        this.toggleActiveHandler[o.id] = true;
      } else {
        this.toggleActiveHandler[o.id] = false;
      }

      this.totalExpenses.push(o);
      this.expenses.push(o);
      this.isThereChildMonitor[parentsIdHere] = true;
      this.createdExpenseIdByCreateNewE = o.id;

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
    setOrderForAccount() {
      const accountsLength = Object.keys(this.accounts).length;
      return accountsLength;
    },
    async fetchData() {

      await this.fetchDataForPage()
      await this.fetchDataForAccount()

      const a = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })
      const { data } = a;

      this.totalExpenses = data;

      if (data.length > 0) {

        await this.selectPageByLoading(); //페이지 선택 후 this.expenses가 만들어짐

        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

        this.expenses.forEach(e => {
          if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
        })

      }

    },
    openPageSettingDiv() {
      this.isPageSettingOpened = true;
    },
    closeAccountSettingDiv() {
      if (!this.isAccountEdited) {
        // 편집 내용이 없는 경우, 모달창 바깥을 눌러서 종료하는 경우
        this.isAccountSettingOpened = false;
        this.cancelEditingAccount();
      } else {
        // 편집한 내용이 있는 경우,
        const text = "페이지에 편집된 내용이 있습니다. \n [확인]을 누르면, 편집된 내용은 저장되지 않고 진행됩니다. \n *편집 내용을 저장하고 싶은 경우, [취소]>[편집 저장하기] 후 종료"
        const confirmValue = confirm(text)

        if (confirmValue) {
          // 편집을 취소하며, 모달창을 종료하는 경우
          this.isAccountSettingOpened = false;
          this.cancelEditingAccount();
        } else {
          // 편집을 계속하기
        }
      }
    },
    closePageSettingDiv() {
      if (!this.isPageEdited) {
        // 편집 내용이 없는 경우, 모달창 바깥을 눌러서 종료하는 경우
        this.isPageSettingOpened = false;
        this.cancelEditingPage();
      } else {
        // 편집한 내용이 있는 경우,
        const text = "페이지에 편집된 내용이 있습니다. \n [확인]을 누르면, 편집된 내용은 저장되지 않고 진행됩니다. \n *편집 내용을 저장하고 싶은 경우, [취소]>[편집 저장하기] 후 종료"
        const confirmValue = confirm(text)

        if (confirmValue) {
          // 편집을 취소하며, 모달창을 종료하는 경우
          this.isPageSettingOpened = false;
          this.cancelEditingPage();
        } else {
          // 편집을 계속하기
        }
      }
    },
    async selectPageByLoading() {

      let selectedPage = this.sortExpensePages.find(e => e.order === 0)
      if (selectedPage != undefined) {
        this.selectedPageId = selectedPage.id
      } else {
        // undefined인 경우, 첫 방문 유저인 경우임
        selectedPage = this.initialPageData
      }
      this.setPageBySelectPage(selectedPage)

    },
    selectPageByEditPage() {

      let selectedPage = this.expensePages.find(e => e.id === this.selectedPageId)

      // selectedPage.length가 0이라면, this.selectedPageId에 대항하는 이전 page가 없어졌다는 뜻이다.(즉, 삭제된 페이지)
      if (Object.keys(selectedPage).length == 0) {
        // 보고 있던 페이지에서, 페이지 설정 창으로 들어가, 해당 페이지를 삭제하는 경우 (selectPageByLoading()와 같음)
        selectedPage = this.sortExpensePages.find(e => e.order === 0)
        this.selectedPageId = selectedPage.id
      } else {
        // 그외 경우, 기존에 열려있던 페이지가 selectedPage가 된다.
      }

      this.setPageBySelectPage(selectedPage)

    },
    setPageBySelectPage(selectedPageHere) {
      this.pageName = selectedPageHere.page_name;
      this.previousPageName = this.pageName;

      this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
      this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

      this.expenses.forEach(e => {
        if (e.level == 5) { this.toggleActiveHandler[e.id] = false; }
      })

    },

    async fetchDataForAccount() {
      const a = await supabase
        .from('account')
        .select()
      const { data } = a;
      this.accounts = data.sort((a, b) => a.order - b.order);
      this.fetchedAccounts = JSON.parse(JSON.stringify(this.accounts));
    },

    async fetchDataForPage() {
      const a = await supabase
        .from('expense_page')
        .select()
      const { data } = a;
      this.expensePages = data;
      this.fetchedExpensePages = JSON.parse(JSON.stringify(this.expensePages));
    },

  }
}
</script>

<style scoped>
@import './style.css';
</style>