<template>
    <div>
        <span> 하위 합계 : </span>
        <input class="amountStyle" :value="sumExpenses" readonly>
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
        sumExpenses: {
            type: String,
            default: '',
        },
    },
    computed: {
        theExpense() {
            return this.expenseById
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>