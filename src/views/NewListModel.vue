<template>
    <button :class="moreBtn" @click="handlerNewListDiv()"> 새 리스트 더하기 </button>
    <div :class="newListDiv" v-if="isNewListDivOpened">
        <form @submit.prevent="createNewExpense(getExpenseById[0].id, getExpenseById[0].level)">
        <div :class="listViewLiDiv">
            <input :class="categoryStyle" v-model="this.newCategory" placeholder="새 리스트 적기">
            <span> : </span>
            <input :class="amountStyle" v-model="this.newAmount" placeholder="0">
        </div>
        <button>입력</button>
        </form>
    </div>
</template>

<script>
import CssData from './CssData.vue'

export default {
    name: 'NewListModel',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => {}
        }
    }, 
    mixins: [CssData],
    data() {
        return {
            newCategory: '',
            newAmount: '',
            isNewListDivOpened: false,
        }
    },
    computed: {
        getExpenseById() {
            return this.expenses.filter(expense => expense.id === this.expenseId)
        }
    },
    methods: {
        handlerNewListDiv() {
            this.isNewListDivOpened = !this.isNewListDivOpened;
        },
        createNewExpense(parentsIdHere, parentsLevelHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, this.newCategory, this.newAmount);
            this.newCategory = ''
            this.newAmount = ''
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>