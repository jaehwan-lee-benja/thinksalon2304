<template>
    <div :class="listViewLiDiv">
        <ol>
            <li :class="listViewLiStyle"
                v-for="subExpense in sortIdAndLevel(this.expenseHere.id, this.expenseHere.level)"
                :key="subExpense.order">
                <div :class="listViewLiDiv">
                    <input :class="categoryStyle" v-model="subExpense.category">
                    <span> : </span>
                    <input :class="amountStyle" v-model="subExpense.amount">
                </div>
                <button @click="removeExpense(subExpense)">X</button>
                <span> *하위 합계 : </span>
                <input :class="amountStyle" v-model="sumExpenses(subExpense.id)[0]" readonly>

                <button @click="toggleSubList(subExpense)">
                    {{ subExpense.show_sub_list ? "하위항목 숨기기" : "하위항목 보기" }}
                </button>

                <div v-if="subExpense.show_sub_list">

                </div>

            </li>
            <form @submit.prevent="createNewExpense(this.expenseHere.id, this.expenseHere.level)">
                <div :class="listViewLiDiv">
                    <input :class="categoryStyle"
                        v-model="this.inputBoxesForCategory[this.expenseHere.id]"
                        placeholder="새 리스트 적기">
                    <span> : </span>
                    <input :class="amountStyle"
                        v-model="this.inputBoxesForAmount[this.expenseHere.id]" placeholder="0">
                </div>
                <button>입력</button>
            </form>
        </ol>
    </div>
    <button @click="removeExpense(expenseHere)">X</button>
    <span> *하위 합계 : </span>
    <input :class="amountStyle" v-model="sumExpenses(this.expenseHere.category)[0]" readonly>
    
    <inputBoxesForCategory />
    <inputBoxesForAmount />
</template>

<script>
// import ListEditingView from './ListEditingView.vue';
// import { sortIdAndLevel } from './ListEditingView.vue';
import inputBoxesForCategory from './ListEditingView.vue';
import inputBoxesForAmount from './ListEditingView.vue';

export default {
    name: 'ListItem',
    props: {
        expenseHere: {
            type: Object,
            default: () => { }
        },
        expenses: {
            type: Array,
            default: () => []
        },
    }, 
    data() {
        return {
            inputBoxesForCategory: inputBoxesForCategory,
            inputBoxesForAmount: inputBoxesForAmount,
        }
    },
    methods: {
        test() {
            console.log("YES!")
            // console.log("expenseHere = ", this.expenseHere)
            // console.log("inputBoxesForCategory = ", this.inputBoxesForCategory);
            // console.log("inputBoxesForAmount = ", this.inputBoxesForAmount);
        },
        sortIdAndLevel(parentIdHere, parentsLevelHere) {
            return this.expenses.filter(expense => expense.parents_id === parentIdHere && expense.level === parentsLevelHere + 1);
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return [sum] //질문: 이것이 좋은 방법인가?
        },
        toggleSubList(expense) {
            console.log("toggleSubList");
            expense.show_sub_list = !expense.show_sub_list;
        },
    },
    mounted() {
      this.test();  
    },
    // mixins: [ListEditingView],
    components: {
        // ListEditingView,
        // sortIdAndLevel,
        inputBoxesForCategory,
        inputBoxesForAmount,
    }
}
</script>

<style scoped>
@import '../style.css';
</style>