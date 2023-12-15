<template>
    <div :class="listViewLiDiv">
        <input :class="categoryStyle" v-model="getExpenseById[0].category">
        <span> : </span>
        <input :class="amountStyle" v-model="getExpenseById[0].amount" @input="onInputChange">
    </div>
    <button :class="moreBtn" @click="handlerLiMoreDiv()"> … </button>
    <div :class="liMoreDiv" v-if="isLiMoreDivOpened">
        <span> *하위 합계 : </span>
        <input :class="amountStyle" :value="sumExpensesForTotal(getExpenseById[0].id)" readonly>
    </div>

    <ol :class="olBgStyle">

        <li :class="listViewLiStyle"
            v-for="expense2 in sortChildrenByIdAndLevel(getExpenseById[0].id, getExpenseById[0].level)"
            :key="expense2.index">

            <ListModel v-bind:expenses="expenses" :expenseId="expense2.id" @remove-expense="removeExpense"
                @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[expense2.id]"
                :selectedPageId="selectedPageId" />

            <ol :class="olBgStyle" v-if="expense2.show_sub_list">
                <li :class="listViewLiStyle" v-for="expense3 in sortChildrenByIdAndLevel(expense2.id, expense2.level)"
                    :key="expense3.index">

                    <ListModel v-bind:expenses="expenses" :expenseId="expense3.id" @remove-expense="removeExpense"
                        @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[expense3.id]"
                        :selectedPageId="selectedPageId" />

                    <ol :class="olBgStyle" v-if="expense3.show_sub_list">
                        <li :class="listViewLiStyle"
                            v-for="expense4 in sortChildrenByIdAndLevel(expense3.id, expense3.level)" :key="expense4.index">

                            <ListModel v-bind:expenses="expenses" :expenseId="expense4.id" @remove-expense="removeExpense"
                                @toggle-sub-list="toggleSubList"
                                :toggleActiveHandler="this.toggleActiveHandler[expense4.id]"
                                :selectedPageId="selectedPageId" />

                            <ol :class="olBgStyle" v-if="expense4.show_sub_list">
                                <li :class="listViewLiStyle"
                                    v-for="expense5 in sortChildrenByIdAndLevel(expense4.id, expense4.level)"
                                    :key="expense5.index">

                                    <ListModel v-bind:expenses="expenses" :expenseId="expense5.id"
                                        @remove-expense="removeExpense" @toggle-sub-list="toggleSubList"
                                        :toggleActiveHandler="this.toggleActiveHandler[expense5.id]"
                                        :selectedPageId="selectedPageId" />

                                </li>
                                <NewListModel v-bind:expenses="expenses" :expenseId="expense4.id"
                                    @create-new-expense="createNewExpense" />
                            </ol>

                        </li>
                        <NewListModel v-bind:expenses="expenses" :expenseId="expense3.id"
                            @create-new-expense="createNewExpense" />
                    </ol>

                </li>
                <NewListModel v-bind:expenses="expenses" :expenseId="expense2.id" @create-new-expense="createNewExpense" />
            </ol>

        </li>

        <NewListModel v-bind:expenses="expenses" :expenseId="getExpenseById[0].id" @create-new-expense="createNewExpense" />
    </ol>
</template>
  
<script>
import CssData from './CssData.vue'
import ListModel from './ListModel.vue'
import NewListModel from './NewListModel.vue'

export default {
    name: 'ListView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        totalExpenseId: {
            type: String,
            default: '',
        },
        toggleActiveHandler: {
            type: Object,
            default: () => { }
        },
        selectedPageId: {
            type: String,
            default: '',
        },
    },
    mixins: [CssData],
    data() {
        return {
            isLiMoreDivOpened: false,
        }
    },
    computed: {
        getExpenseById() {
            if (this.expenses.length > 0) {
                return this.expenses.filter(expense => expense.id === this.totalExpenseId)
            } else {
                return [{ category: "로딩중..", amount: 0, id: "" }]
            }
        }
    },
    watch: {
        selectedPageId: {
            handler() {
                this.handlerLiMoreDivForPageChange()
            },
            deep: true
        }
    },
    methods: {
        handlerLiMoreDivForPageChange() {
            // Page가 바뀔 때, LiMoreDiv가 열려있는 경우, 없애도록하는 기능
            if (this.isLiMoreDivOpened) { this.isLiMoreDivOpened = false; }
        },
        onInputChange() {
            // ListModel.vue에도 같은 함수 있음
            // 비동기로 다음 렌더링 사이클로 함수 예약
            this.$nextTick(() => {
                const isNumber = !isNaN(this.getExpenseById[0].amount);
                // 값이 바로 적용되도록 $nextTick 내에서 값을 변경
                this.$nextTick(() => {
                    if (!isNumber) {
                        alert("숫자가 아닌 문자가 입력되었습니다. 숫자로 입력해주시기 바랍니다.");
                        this.getExpenseById[0].amount = this.getExpenseById[0].amount.replace(/[^0-9]/g, '');
                    }
                });
            });
        },
        handlerLiMoreDiv() {
            // ListModel.vue에도 같은 함수 있음
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        sumExpensesForTotal(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
        },
        removeExpense(expenseHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-expense', expenseHere)
            }
        },
        sortChildrenByIdAndLevel(parentIdHere, parentsLevelHere) {
            return this.expenses.filter(e => e.parents_id === parentIdHere && e.level === parentsLevelHere + 1);
        },
        toggleSubList(expenseHere) {
            this.$emit('toggle-sub-list', expenseHere)
        },
        createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere)
        },
        cancelEditingExpense() {
            const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")
            if (confirmValue) {
                this.$emit('cancel-editing-expense')
            }
        }
    },
    components: {
        ListModel,
        NewListModel,
    }
}
</script>
  
<style scoped>@import '../style.css';</style>