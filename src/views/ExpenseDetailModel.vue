<template>
    <div class="isolatedTableDivStyle">
        <table>
            <tr>
                <td>
                    합계 :
                </td>
                <td>
                    <input class="amountStyle" :value="sumExpenses()" readonly>
                </td>
            </tr>
            <tr>
                <td>
                    메모 :
                </td>
                <td>
                    <input class="categoryStyle" v-model="theExpenseById.memo">
                </td>
            </tr>
        </table>
    </div>
</template>

<script>

export default {
    name: 'ExpenseDetailModel',
    props: {
        expenseById: {
            type: Object,
            default: () => ({})
        },
        expenses: {
            type: Object,
            default: () => ({})
        },
    },
    computed: {
        theExpenseById() {
            return this.expenseById
        }
    },
    methods: {
        sumExpenses() {
            const sumArr = this.expenses.filter(e => e.parents_id === this.expenseById.id)
            const sum = sumArr.reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>