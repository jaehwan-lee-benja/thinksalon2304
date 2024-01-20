<template>
    <div class="newExpenseDiv">
        <table>
            <tr>
                <th v-if="isThereChild" class="thForNew">
                    <button :class="{
                        'newExpenseBtn_minus': newExpenseBtnOpened === true,
                        'newExpenseBtn_plus': newExpenseBtnOpened === false
                    }" @click="handlerNewListDiv">
                        {{ newExpenseBtnOpened ? "-" : "+" }}
                    </button>
                </th>
                <th v-if="!isThereChild" class="thForNew"> <span>new</span> </th>
                <th v-if="isNewListDivOpened">
                    <form @submit.prevent="createNewExpense(this.theExpense.id, this.theExpense.level)">
                        <div class="listViewLiDiv">
                            <input class="categoryStyle" v-model="this.newCategory" placeholder="새 리스트 적기">
                            <span> : </span>
                            <input class="amountStyle" v-model="newAmount" placeholder="0">
                        </div>
                        <button class="newExpenseDoneBtn">입력</button>
                    </form>
                </th>
            </tr>
        </table>
    </div>
</template>

<script>
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'NewListModel',
    mixins: [expenseMixin],
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => { }
        },
        isThereChild: {
            type: Boolean,
            default: true
        },
    },
    watch: {
        isThereChild: {
            handler() {
                this.controlDivIfNoChild()
            },
            deep: true
        },
    },
    data() {
        return {
            newCategory: '',
            newAmount: 0,
            isNewListDivOpened: false,
            newExpenseBtnOpened: false,
        }
    },
    mounted() {
        this.controlDivIfNoChild()
    },
    computed: {
        // newAmount: {
        //     get(value) {
        //         return value.toLocaleString();
        //     },
        //     set(value) {
        //         // 사용자가 수정할 때는 숫자만 포함하여 저장
        //         console.log("value = ", value)
        //         const numericValue = parseFloat(value.replace(/,/g, ''));
        //         console.log("numericValue = ", numericValue);
        //     }
        // }
    },
    methods: {
        controlDivIfNoChild() {
            if (!this.isThereChild) {
                this.isNewListDivOpened = true;
                this.newExpenseBtnOpened = true;
            } else {
                this.isNewListDivOpened = false;
                this.newExpenseBtnOpened = false;
            }
        },
        handlerNewListDiv() {
            this.isNewListDivOpened = !this.isNewListDivOpened;
            this.newExpenseBtnOpened = !this.newExpenseBtnOpened;
            if (!this.newExpenseBtnOpened) {
                this.newCategory = ''
                this.newAmount = 0
            }
        },
        createNewExpense(parentsIdHere, parentsLevelHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, this.newCategory, this.newAmount);
            this.newCategory = ''
            this.newAmount = 0
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>