<template>
    <div :class="listViewLiDiv">
        <!-- <input :class="categoryStyle" v-model="this.expenseHere.category">
        <span> : </span>
        <input :class="amountStyle" v-model="this.expenseHere.amount"> -->
    </div>
    <button @click="removeExpense(expenseHere)">X</button>
    <span> *하위 합계 : </span>
    <input :class="amountStyle" v-model="sumExpenses(this.expenseHere.category)[0]" readonly>
</template>

<script>
export default {
    name: 'ListItem',
    props: {
        expenseHere: {
            type: Object,
            default: () => { }
        }
    },
    methods: {
        test() {
            console.log("YES!")
        }
    },
    mounted() {
      this.test();  
    },
}
</script>