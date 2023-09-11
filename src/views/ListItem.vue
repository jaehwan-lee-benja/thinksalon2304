<template>
    <div :class="listViewLiDiv">
        <input :class="categoryStyle" v-model="getExpenseById[0].category">
        <span> : </span>
        <input :class="amountStyle" v-model="getExpenseById[0].amount">
    </div>
    <button @click="toggleSubList(getExpenseById[0])">
        {{ getExpenseById[0].show_sub_list ? "숨기기" : "펼치기" }}
    </button>
    
    <button @click="removeExpense(getExpenseById[0])">X</button>
    <span> *하위 합계 : </span>
    <input :class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
    
</template>

<script>

export default {
    name: 'ListItem',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => {}
        },
    }, 
    data() {
        return {
            listViewLiDiv: 'listViewLiDiv',
            categoryStyle: 'categoryStyle',
            amountStyle: 'amountStyle',
        }
    },
    computed: {
        getExpenseById() {
            return this.expenses.filter(expense => expense.id === this.expenseId)
        }
    },
    methods: {
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