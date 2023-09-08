<template>
    <div :class="listViewLiDiv">
        <input :class="categoryStyle" v-model="getExpenseById[0].category">
        <span> : </span>
        <input :class="amountStyle" v-model="getExpenseById[0].amount">
    </div>
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
            const sorted = this.expenses.filter(expense => expense.id === this.expenseId)
            console.log("sorted = ", sorted)
            return sorted
        }
    },
    methods: {
        test() {
            console.log("expenses = ", this.expenses)
            console.log("expenseId = ", this.expenseId)
        }
    },
    mounted() {
      this.test();  
    }
}
</script>

<style scoped>
@import '../style.css';
</style>