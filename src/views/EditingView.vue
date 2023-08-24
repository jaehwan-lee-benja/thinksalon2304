<template>
  <div :class="sectionGrid">
    <div :class="listViewDiv">
      <h2>리스트 뷰</h2>
      <div :class="listViewItemDiv">
        <ul>
          <li v-for="expense in sortLevel2" :key="expense.id">
            <span>{{ expense.category }}</span>
            <button @click="removeExpense(expense)">X</button>
            <span>결정값 : </span>
              <input :class="amountStyle" v-model="sortExpenses(expense.category)[0].amount">
            <span>계산값 : </span>
              <!-- <input :class="amountStyle" v-model="sumExpenses"> -->
            <ol>
              <li v-for="expense2 in filteredExpenses(expense.category)" :key="expense2.id" @click="getLiId(expense2.id)">
                <div :class="listViewLiDiv">
                  <input :class="categoryStyle" v-model="expense2.category">
                  <span> : </span>
                  <input :class="amountStyle" v-model="expense2.amount">
                  <button @click="removeExpense(expense2)">X</button>
                </div>
              </li>
            </ol>
          </li>
        </ul>
      </div>
      <div>
        <ul :class="newUlStyle">
          <li>
            <span>카테고리 선택하기: </span>
            <select :class="categoryStyle" :value="selectedCategory" @change="updateSelectbox($event)">
              <option :key="index" :value="item.category" v-for="(item, index) in sortLevel2">{{ item.category }}</option>
            </select>
          </li>
          <li>
            <span>내용 입력하기</span>
            <form @submit.prevent="addExpenseListView()">
              <input :class="categoryStyle" v-model="newCategory" placeholder="새 리스트 적기">
              <span> : </span>
              <input :class="amountStyle" v-model="newAmount" placeholder="0">
              <button>입력</button>
            </form>
          </li>
        </ul>
        <ul :class="newUlStyle">
          <li>
            <form @submit.prevent="addCategory()">
              <span>새로운 카테고리 만들기 : </span>
              <input :class="categoryStyle" v-model="newCategoryList" placeholder="새 카테고리 적기">
              <button>입력</button>
            </form>
          </li>
        </ul>
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
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
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
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumPastExpenses" readonly></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsPastExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount">
                <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                <form @submit.prevent="addExpense('past')">
                  <input :class="categoryStyle" v-model="newCategory_past" placeholder="새 리스트 적기">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmount_past" placeholder="0">
                  <button>입력</button>
                </form>
              </li>
            </ul>
          </div>
        </div>
        <div :class="unitDiv">
          <div>
            <h3>현재형 지출</h3>
            <ul>
              <li v-for="expense in sortPresentExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumPresentExpenses" readonly></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsPresentExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount">
                <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                <form @submit.prevent="addExpense('present')">
                  <input :class="categoryStyle" v-model="newCategory_present" placeholder="새 리스트 적기">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmount_present" placeholder="0">
                  <button>입력</button>
                </form>
              </li>
            </ul>
          </div>
        </div>
        <div :class="unitDiv">
          <div>
            <h3>미래형 지출</h3>
            <ul>
              <li v-for="expense in sortFutureExpenses" :key="expense.id">
                <span>결정값 : </span>
                <input :class="amountStyle" v-model="expense.amount" placeholder="0">
              </li>
              <li>계산값 : <input :class="amountStyle" v-model="sumFutureExpenses" readonly></li>
            </ul>
          </div>
          <div>
            <ol>
              <li v-for="expense in sortParentsFutureExpenses" :key="expense.id">
                <input :class="categoryStyle" v-model="expense.category">
                <span> : </span>
                <input :class="amountStyle" v-model="expense.amount">
                <button @click="removeExpense(expense)">X</button>
              </li>
            </ol>
            <ul :class="newUlStyle">
              <li>
                <form @submit.prevent="addExpense('future')">
                  <input :class="categoryStyle" v-model="newCategory_future" placeholder="새 리스트 적기">
                  <span> : </span>
                  <input :class="amountStyle" v-model="newAmount_future" placeholder="0">
                  <button>입력</button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
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
</template>

<script>

import { supabase } from '../lib/supabaseClient.js'
import PieChart from './Pie.vue'

export default {

  data() {
    return {

      expenses: [],
      fetchedExpenses: [],

      selectedCategory: '',
      selectboxFirst: null,

      newCategoryList:'',
      newCategory: '',
      newCategory_past: '',
      newCategory_present: '',
      newCategory_future: '',

      newAmount: '',
      newAmount_past: '',
      newAmount_present: '',
      newAmount_future: '',

      unitDiv: 'unitDiv',
      subGrid: 'subGrid',
      graphGrid: 'graphGrid',
      graphDiv: 'graphDiv',
      sectionGrid: 'sectionGrid',
      flowViewDiv: 'flowViewDiv',
      listViewDiv: 'listViewDiv',
      listViewItemDiv: 'listViewItemDiv',
      listViewLiDiv: 'listViewLiDiv',

      categoryStyle: 'categoryStyle',
      amountStyle: 'amountStyle',
      newUlStyle: 'newUlStyle',
      saveEditedStyle_active: 'saveEditedStyle_active',
      saveEditedStyle_inactive: 'saveEditedStyle_inactive',
      cancelEditedStyle_active: 'cancelEditedStyle_active',
      cancelEditedStyle_inactive: 'cancelEditedStyle_inactive',
      saveEditedDiv: 'saveEditedDiv',

      isEditValue: true,

    }
  },
  mounted() {
    this.fetchData(),
      this.monitorIsEdited()
  },
  computed: {
    sumExpenses(category) {
      console.log("check!")
      return this.expenses.filter(e => e.parentsCategory === category)
        .reduce((acc, item) => acc + Number(item.amount), 0);
    },
    sortLevel2() {
      return this.expenses.filter(e => e.level === 2)
    },
    sortLevel3() {
      return this.expenses.filter(e => e.level === 3)
    },
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
        .reduce((acc, item) => acc + Number(item.amount), 0);
    },
    sumPastExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "past")
        .reduce((acc, item) => acc + Number(item.amount), 0);
    },
    sumPresentExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "present")
        .reduce((acc, item) => acc + Number(item.amount), 0);
    },
    sumFutureExpenses() {
      return this.expenses.filter(e => e.parentsCategory === "future")
        .reduce((acc, item) => acc + Number(item.amount), 0);
    },

    isEdited() {

      const fetched = [];
      this.fetchedExpenses.forEach(e => {
        fetched.push({
          category: e.category,
          amount: Number(e.amount)
        })
      });

      const edited = [];
      this.expenses.forEach(e => {
        edited.push({
          category: e.category,
          amount: Number(e.amount)
        })
      });
      // map으로 해보기

      const fetchedData = JSON.stringify(fetched);
      const editedData = JSON.stringify(edited);
      const result = (fetchedData || "") != (editedData || "")

      return result
 
    },

  },
  methods: {
    // sumExpenses(category) {
    //   return this.expenses.filter(e => e.parentsCategory === category)
    //     .reduce((acc, item) => acc + Number(item.amount), 0);
    // },
    updateSelectbox(event) {
      this.selectedCategory = event.target.value;
      console.log("this.selectedCategory = ", this.selectedCategory);
    },
    addCategory() {
      const o = {
        id: this.getUuidv4(),
        parentsCategory: 'total',
        category: this.newCategoryList,
        amount: null,
        order: this.setOrder('categories'),
        level: 2
      };
      this.expenses.push(o);
      this.newCategory = ''
    },
    sortExpenses(category) {
      return this.expenses.filter(expense => expense.category === category);
    },
    getLiId(id) {
      return id;
    },
    filteredExpenses(category) {
      return this.expenses.filter(expense => expense.parentsCategory === category);
    },
    monitorIsEdited() {
      if (this.isEdited) {
        // 편집된 것이 있는 경우
        this.isEditValue = true;
      } else {
        // 편집된 것이 없는 경우
        this.isEditValue = false;
      }
    },
    addExpenseListView() {
      if(this.selectedCategory) {
        const o = {
          id: this.getUuidv4(),
          parentsCategory: this.selectedCategory,
          category: this.newCategory,
          amount: this.newAmount,
          order: this.setOrder(this.selectedCategory),
          level: 3
        };
        this.expenses.push(o);
        this.newCategory = ''
        this.newAmount = ''
      } else {
        alert("상위폴더를 선택해주시기 바랍니다.")
      }
    },
    addExpense(parentsCategoryHere) {
      const o = {
        id: this.getUuidv4(),
        parentsCategory: parentsCategoryHere,
        category: this['newCategory_' + parentsCategoryHere],
        amount: this['newAmount_' + parentsCategoryHere],
        order: this.setOrder(parentsCategoryHere),
        level: 3
      };
      this.expenses.push(o);
      this['newCategory_' + parentsCategoryHere] = ''
      this['newAmount_' + parentsCategoryHere] = ''
    },
    async insertData(oHere) {
      try {
        const { error } = await supabase
          .from('expense')
          .insert(oHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async fetchData() {
      const a = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })
      const { data } = a;
      this.expenses = data;
      this.fetchedExpenses = JSON.parse(JSON.stringify(data));
    },
    removeExpense(expense) {
      const confirmValue = confirm("내용을 삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")

      if (confirmValue) {

        const parentsCategory = expense.parentsCategory;
        const orderRemoved = expense.order;

        this.expenses.forEach(e => {
          const order = e.order;
          if (e.parentsCategory == parentsCategory) {
            if (order > orderRemoved) {
              this.expenses[this.expenses.indexOf(e)].order = order - 1;
            }
          }
        });

        this.expenses = this.expenses.filter((t) => t !== expense)

        if(expense.level == 2) {
          this.expenses = this.expenses.filter((t) => t.parentsCategory !== expense.category)
        }

      }
    },
    pointEditedData() {

    },
    editExpenses() {

      const confirmValue = confirm("수정된 내용을 저장하시겠습니까?")

      if (confirmValue) {
        const expensesIdArray = this.expenses.map(e => e.id);
        const fetchedExpensesIdArray = this.fetchedExpenses.map(e => e.id);
        const willBeDeletedIdArray = fetchedExpensesIdArray.filter(e => !expensesIdArray.includes(e));

        willBeDeletedIdArray.forEach(e => this.deleteData(e));
        this.expenses.forEach(e => this.upsertData(e))

        this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

        alert('저장되었습니다.')
      }

    },
    async upsertData(expense) {
      try {
        const { error } = await supabase
          .from('expense')
          .upsert(expense)
          .eq('id', expense.id)
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
    getUuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    setOrder(parentsCategoryHere) {
      const arr = this.expenses.filter(e => e.parentsCategory === parentsCategoryHere)
      const expenseLength = Object.keys(arr).length;
      return expenseLength + 1;
    },
    cancelEditing() {
      const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")

      if (confirmValue) {
        this.expenses = "";
        this.expenses = JSON.parse(JSON.stringify(this.fetchedExpenses));
      }
    }

  },
  components: {
    PieChart
  }
}
</script>

<style scoped>
@import '../style.css';
</style>