<template>
    <!-- 질문 -->
    <div></div>
    <form @submit.prevent="createNewExpense(getExpenseById[0].id, getExpenseById[0].level)">
        <div :class="listViewLiDiv">
            <!-- <input :class="categoryStyle" v-model="this.inputBoxesForCategory[getExpenseById[0].id]"
                placeholder="새 리스트 적기">
            <span> : </span>
            <input :class="amountStyle" v-model="this.inputBoxesForAmount[getExpenseById[0].id]"
                placeholder="0"> -->
        </div>
        <button>입력</button>
    </form>
</template>

<script>

export default {
    name: 'NewListItem',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => {}
        },
        inputBoxesForCategory: {
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
            // console.log("sorted = ", sorted)
            return sorted
        }
    },
    methods: {
        test() {
        //     console.log("expenses**New = ", this.expenses)
        //     console.log("expenseId**New = ", this.expenseId)
            console.log("this.inputBoxesForCategory = ", this.inputBoxesForCategory)
        },
        // createNewExpense(parentsIdHere, parentsLevelHere) {
        //     const levelForO = parentsLevelHere + 1;
        //     const o = {
        //         id: this.getUuidv4(),
        //         parents_id: parentsIdHere,
        //         category: this.inputBoxesForCategory[parentsIdHere],
        //         amount: this.inputBoxesForAmount[parentsIdHere],
        //         order: this.setOrder(parentsIdHere),
        //         level: levelForO
        //     };
        //     this.expenses.push(o);
        //     this.inputBoxesForCategory[parentsIdHere] = ''
        //     this.inputBoxesForAmount[parentsIdHere] = ''
        // },
    },
    mounted() {
      this.test();  
    }
}
</script>

<style scoped>
@import '../style.css';
</style>