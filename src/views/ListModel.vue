<template>
    <div :class="liAlignStyle">
        <button :class="{
            'toggleBtn_active': this.toggleActiveHandler === true,
            'toggleBtn_inactive': this.toggleActiveHandler === false
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
            {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }}
        </button>

        <div :class="{
            'listViewLiDiv_clicked': this.updateClickedExpenseId === true,
            'listViewLiDiv': this.updateClickedExpenseId === false,
        }">
            <input :class="categoryStyle" v-model="getExpenseById[0].category">
            <span> : </span>
            <input :class="amountStyle" ref="amountInput" v-model="formattedAmount" @input="onInputChange">
            <!-- <input :class="amountStyle" ref="amountInput" v-model="formattedAmount" @click="removeComma"> -->
        </div>

        <button :class="moreBtn" @click="handlerLiMoreDiv"> … </button>
        <div :class="liMoreDiv" v-if="isLiMoreDivOpened">
            <button @click="removeExpense(getExpenseById[0])">삭제</button>
            <span> 하위 합계 : </span>
            <input :class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
            <span> 메모 : </span>
            <input :class="memo" v-model="getExpenseById[0].memo">
        </div>

    </div>
</template>

<script>
import CssData from './CssData.vue'

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
    mixins: [CssData],
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
            // set(value) {
            //     // 사용자가 수정 중일 때만 값 처리
            //     if (this.$refs.amountInput === document.activeElement) {
            //         const isCommaInput = value.includes(',');
            //         const numericValue = parseFloat(value.replace(/,/g, ''));

            //         if (!isNaN(numericValue) || isCommaInput) {
            //             this.getExpenseById[0].amount = isCommaInput ? value : numericValue;
            //         } else {
            //             // 값이 유효한 숫자가 아니면 경고 후 이전 값으로 되돌림
            //             alert("숫자가 아닌 문자가 입력되었습니다. 숫자로 입력해주시기 바랍니다.");
            //             this.$nextTick(() => {
            //                 this.formattedAmount = this.getExpenseById[0].amount.toLocaleString();
            //             });
            //         }
            //     }
            // },
        },
        getExpenseById() {
            return this.expenses.filter(expense => expense.id === this.expenseId)
        },
        updateClickedExpenseId() {
            if (this.clickedExpenseId === this.getExpenseById[0].id) {
                return true
            } else {
                return false
            }
        }
    },
    methods: {

        // removeComma() {
        //     const amountAsString = String(this.getExpenseById[0].amount);
        //     this.getExpenseById[0].amount = amountAsString.replace(/,/g, '');
        // },
        // onInputChange() {
        //     // 수정 중일 땐, 무조건 컴마도 안되도록 하게해야겠다.

        //     // ListView.vue에도 같은 함수 있음
        //     // 비동기로 다음 렌더링 사이클로 함수 예약
        //     this.$nextTick(() => {
        //         const isNumber = !isNaN(this.formattedAmount);
        //         // 값이 바로 적용되도록 $nextTick 내에서 값을 변경
        //         this.$nextTick(() => {
        //             if (!isNumber) {
        //                 alert("숫자가 아닌 문자가 입력되었습니다. 숫자로 입력해주시기 바랍니다.");
        //                 this.formattedAmount = this.formattedAmount.replace(/[^0-9]/g, '');
        //             }
        //         });
        //     });
        // },
        handlerLiMoreDivForPageChange() {
            // Page가 바뀔 때, LiMoreDiv가 열려있는 경우, 없애도록하는 기능
            if (this.isLiMoreDivOpened) { this.isLiMoreDivOpened = false; }
        },
        handlerLiMoreDiv() {
            // ListView.vue에도 같은 함수 있음
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
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