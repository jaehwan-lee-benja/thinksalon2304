<template>
    <div :class="liAlignStyle">
        <button :class="{
            'toggleBtn_active': this.toggleActiveHandler === true,
            'toggleBtn_inactive': this.toggleActiveHandler === false
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
        {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }} 
        </button>

        <div :class="listViewLiDiv">
            <input :class="categoryStyle" v-model="getExpenseById[0].category">
            <span> : </span>
            <input :class="amountStyle" v-model="getExpenseById[0].amount">
        </div>

        <button :class="moreBtn" @click="handlerLiMoreDiv()"> … </button>
        <div :class="liMoreDiv" v-if="isLiMoreDivOpened">
            <button @click="removeExpense(getExpenseById[0])">삭제</button>
            <span> *하위 합계 : </span>
            <input :class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
        </div>
        
    </div>
    
</template>

<script>
import CssData from './CssData.vue'

export default {
    name: 'ListModel',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => {}
        },
        toggleActiveHandler: {
            type: Boolean,
            default: true
        }
    }, 
    mixins: [CssData],
    data() {
        return {
            isLiMoreDivOpened: false
        }
    },
    computed: {
        getExpenseById() {
            return this.expenses.filter(expense => expense.id === this.expenseId)
        }
    },
    methods: {
        handlerLiMoreDiv() {
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
        },
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
        },
        toggleSubList(expenseHere) {
            this.$emit('toggle-sub-list', expenseHere);
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>