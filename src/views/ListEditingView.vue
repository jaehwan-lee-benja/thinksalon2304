<template>
    <div :class="sectionGrid">
        <div :class="listViewDiv">
            <h2>리스트 뷰</h2>
            <div :class="listViewItemDiv">
                <ol>
                    <li :class="listViewLiStyle" v-for="expense in sortLevel1" :key="expense.id">
                        <div :class="listViewLiDiv">
                            <input :class="categoryStyle" v-model="expense.category">
                            <span> : </span>
                            <input :class="amountStyle" v-model="expense.amount">
                        </div>
                        <button @click="removeExpense(expense)">X</button>
                        <span> *하위 합계 : </span>
                        <input :class="amountStyle" v-model="sumExpenses(expense.category)[0]" readonly>

                        <button @click="toggleSubList(expense)">
                            {{ expense.show_sub_list ? "하위항목 숨기기" : "하위항목 보기" }}
                        </button>

                        <ol v-if="expense.show_sub_list">
                            <!-- <li :class="listViewLiStyle" v-for="subExpense in sortLevelAndCategory(expense.category, expense.level)" :key="subExpense.id">
                                <div :class="listViewLiDiv">
                                    <input :class="categoryStyle" v-model="subExpense.category">
                                    <span> : </span>
                                    <input :class="amountStyle" v-model="subExpense.amount">
                                </div>
                                <button @click="removeExpense(subExpense)">X</button>
                                <span> *하위 합계 : </span>
                                <input :class="amountStyle" v-model="sumExpenses(subExpense.category)[0]" readonly>
                                <button @click="toggleSubList(expense)">
                                    {{ expense.show_sub_list ? "하위항목 숨기기" : "하위항목 보기" }}
                                </button>                   
                            </li> -->
                            <li v-for="subExpense in sortLevelAndCategory(expense.category, expense.level)" :key="subExpense.id">
                                <ListItem :sub-expense="subExpense"></ListItem>
                            </li>
                        </ol>
                    </li>
                </ol>

            </div>
            <div>
                <ul :class="newUlStyle">
                    <p>[새 항목 작성하기]</p>
                    <li>
                        <span>카테고리 선택하기: </span>
                        <select :class="categoryStyle" :value="selectedCategory" @change="updateSelectbox($event)">
                            <option :key="index" :value="item.category" v-for="(item, index) in sortLevel2">{{ item.category
                            }}</option>
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
                            <p>[새 카테고리 만들기]</p>
                            <span>카테고리 입력하기: </span>
                            <input :class="categoryStyle" v-model="newCategoryList" placeholder="새 카테고리 적기">
                            <button>입력</button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
        <div :class="flowViewDiv">
            <h2>플로우 뷰</h2>
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
//   import PieChart from './Pie.vue'

export default {

    data() {
        return {

            expenses: [],
            fetchedExpenses: [],

            selectedCategory: '',
            selectboxFirst: null,

            newCategoryList: '',
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
            listViewLiStyle: 'listViewLiStyle',
            listViewOlStyle: 'listViewOlStyle',

            isEditValue: true,

        }
    },
    mounted() {
        this.fetchData(),
            this.monitorIsEdited()
    },
    computed: {

        sortLevel1() {
            return this.expenses.filter(e => e.level === 1)
        },

        sortLevel2() {
            return this.expenses.filter(e => e.level === 2)
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
        sortLevelAndCategory(parentCategory, level) {
            return this.expenses.filter(expense => expense.parentsCategory === parentCategory && expense.level === level + 1);
        },
        toggleSubList(expense) {
            // console.log("expense = ", expense)
            expense.show_sub_list = !expense.show_sub_list;
        },
        sumExpenses(category) {
            const sum = this.expenses.filter(e => e.parentsCategory === category)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return [sum]
        },
        updateSelectbox(event) {
            this.selectedCategory = event.target.value;
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
            // console.log("category = ", category)
            return this.expenses.filter(expense => expense.category === category);
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
            if (this.selectedCategory) {
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

                if (expense.level == 2) {
                    this.expenses = this.expenses.filter((t) => t.parentsCategory !== expense.category)
                }

            }
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
        //   PieChart
        ListItem: {
            props: ["subExpense"],
            template: `
                <span>test</span>
                <div :class="listViewLiDiv">
                    <input :class="categoryStyle" v-model="subExpense.category">
                    <span> : </span>
                    <input :class="amountStyle" v-model="subExpense.amount">
                </div>
                <button @click="removeExpense(subExpense)">X</button>
                <span> *하위 합계 : </span>
                <input :class="amountStyle" v-model="sumExpenses(subExpense.category)[0]" readonly>
                <button @click="toggleSubList(expense)">
                    {{ expense.show_sub_list ? "하위항목 숨기기" : "하위항목 보기" }}
                </button>
            `,
            methods: {
                toggleSubList(subExpense) {
                this.$emit("toggle-sub-list", subExpense);
                }
            }
        }
    }
}
</script>
  
<style scoped>
@import '../style.css';
</style>