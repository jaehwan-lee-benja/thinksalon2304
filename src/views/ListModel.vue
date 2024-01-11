<template>
    <div class='liAlignStyle'>

        <button v-if="!isNotTotal" :class="{
            'totalToggleBtn_active': this.toggleActiveHandler === true,
            'totalToggleBtn_inactive': this.toggleActiveHandler === false,
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
            {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }}
        </button>

        <button v-if="isNotTotal" :class="{
            'toggleBtn_active': this.toggleActiveHandler === true,
            'toggleBtn_inactive': this.toggleActiveHandler === false,
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
            {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }}
        </button>

        <div :class="{
            'listViewLiDiv_clicked': this.updateClickedExpenseId === true,
            'listViewLiDiv': this.updateClickedExpenseId === false,
        }">
            <input class="categoryStyle" v-model="getExpenseById[0].category">
            <span> : </span>
            <input class="amountStyle" ref="amountInput" v-model="formattedAmount">
        </div>

        <button class="moreBtn" v-if="isNotTotal" @click="removeExpense(getExpenseById[0])">x</button>
        <button class="moreBtn" @click="handlerLiMoreDiv"> … </button>
        <div class="liMoreDiv" v-if="isLiMoreDivOpened">
            <span> 하위 합계 : </span>
            <input class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
            <span> 메모 : </span>
            <input class="memo" v-model="getExpenseById[0].memo">
        </div>

    </div>
</template>

<script>

export default {
    name: 'ListModel',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => { }
        },
        toggleActiveHandler: {
            type: Boolean,
            default: true
        },
        selectedPageId: {
            type: String,
            default: '',
        },
        clickedExpenseId: {
            type: String,
            default: '',
        },
    },
    watch: {
        selectedPageId: {
            handler() {
                this.handlerLiMoreDivForPageChange()
            },
            deep: true
        },
    },
    data() {
        return {
            isLiMoreDivOpened: false,
            memoSaveBtnHandler: false
        }
    },
    computed: {
        isNotTotal() {
            if (this.getExpenseById[0].level > 1) {
                return true
            } else {
                return false
            }
        },
        formattedAmount: {
            get() {
                // 화면에 표시될 때는 컴마를 포함하여 반환
                return this.getExpenseById[0].amount.toLocaleString();
            },
            set(value) {
                // 사용자가 수정할 때는 숫자만 포함하여 저장
                const numericValue = parseFloat(value.replace(/,/g, ''));
                // 값이 유효한 숫자인 경우에만 저장
                if (!isNaN(numericValue)) {
                    this.getExpenseById[0].amount = numericValue;
                }
            },
        },
        getExpenseById() {
            if (this.expenses.length > 0) {
                return this.expenses.filter(expense => expense.id === this.expenseId)
            } else {
                return [{ category: "로딩중..", amount: 0, id: "" }]
            }
        },
        updateClickedExpenseId() {
            if (this.clickedExpenseId === this.getExpenseById[0].id) {
                return true
            } else {
                return false
            }
        },

    },
    methods: {
        handlerLiMoreDivForPageChange() {
            // Page가 바뀔 때, LiMoreDiv가 열려있는 경우, 없애도록하는 기능
            if (this.isLiMoreDivOpened) { this.isLiMoreDivOpened = false; }
        },
        handlerLiMoreDiv() {
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
            this.handlerLiMoreDivForPageChange();
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