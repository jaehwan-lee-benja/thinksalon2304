<template>
    <div>
        <span> 하위 합계 : </span>
        <input class="amountStyle" :value="sumExpenses()" readonly>
        <span> 메모 : </span>
        <input class="memo" v-model="theExpense.memo">
    </div>
</template>

<script>

export default {
    name: 'ExpenseDetailModel',
    props: {
        expenseById: {
            type: Object,
            default: () => { }
        },
        expenses: {
            type: Object,
            default: () => { }
        },
    },
    computed: {
        theExpense() {
            return this.expenseById
        },
    },
    methods: {
        sumExpenses() {
            const sum = this.expenses.filter(e => e.parents_id === this.expenseById.parents_id)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>