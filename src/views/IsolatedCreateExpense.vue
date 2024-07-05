<template>
    <div class="isolatedDivStyle">
        <div class='isolatedAlignStyle'>
            <p>[상위 거점 선택하기]</p>
            <select v-model="parentsExpense" @change="selectParentsExpense">
                <option v-for="expense in this.expenses" :key="expense.id" :value="expense.id">
                    {{ expense.category }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>

export default {
    name: 'IsolatedCreateExpense',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        accounts: {
            type: Object,
            default: () => { }
        }
    },
    data() {
        return {
            parentsExpense: "",
        }
    },
    methods: {
        selectAccount() {
            // this.$emit('select-account', expenseIdHere, accountIdHere)
        },
        selectParentsExpense() {
            console.log("parentsExpense = ", this.parentsExpense)
        }
    },
}
</script>

<style scoped>
@import '../style.css';
</style>