<template>
    <div class="pageListStyle">
        <h2>계좌 설정하기</h2>
        <div class="createNewPageDiv">
            <h4>새 계좌 추가하기</h4>
            <table>
                <tr>
                    <td>계좌 별명</td>
                    <td>은행</td>
                    <td>계좌 번호</td>
                    <td>역할</td>
                    <td>타입</td>
                    <td>수수료 여부</td>
                    <td>메모</td>
                </tr>
                <tr>
                    <td><input v-model="this.newName" placeholder="계좌 별명 적기"></td>
                    <td><input v-model="this.newBank" placeholder="은행 적기"></td>
                    <td><input v-model="this.newNumber" placeholder="계좌 번호 적기"></td>
                    <td><input v-model="this.newRole" placeholder="역할 적기"></td>
                    <td><input v-model="this.newType" placeholder="타입 적기"></td>
                    <td><input v-model="this.newTransferFee" placeholder="수수료 여부 적기"></td>
                    <td><input v-model="this.newMemo" placeholder="메모 적기"></td>
                    <td><button @click="createNewAccount">만들기</button></td>
                </tr>
            </table>


        </div>

        <div>
            <h4>기존 계좌 편집하기</h4>
            <table>
                <tr>
                    <td>계좌 별명</td>
                    <td>은행</td>
                    <td>계좌 번호</td>
                    <td>역할</td>
                    <td>타입</td>
                    <td>수수료 여부</td>
                    <td>메모</td>
                </tr>
                <tr v-for="account in accounts" :key="account.id">
                    <td><input v-model="account.name"></td>
                    <td><input v-model="account.bank"></td>
                    <td><input v-model="account.number"></td>
                    <td><input v-model="account.role"></td>
                    <td><input v-model="account.type"></td>
                    <td><input v-model="account.transfer_fee"></td>
                    <td><input v-model="account.memo"></td>
                    <td><button @click="removeAccount(account)">삭제</button></td>
                </tr>

            </table>
            <button :class="{
                'pageEditedBtn_active': isAccountEdited === true,
                'pageEditedBtn_inactive': isAccountEdited === false
            }" :disabled="!isAccountEdited" @click="editAccount">편집한 내용 저장</button>
            <button :class="{
                'cancelPageEditedBtn_active': isAccountEdited === true,
                'cancelPageEditedBtn_inactive': isAccountEdited === false
            }" :disabled="!isAccountEdited" @click="cancelEditingAccount">편집 취소</button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'AccountSettingView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        accounts: {
            type: Object,
            default: () => { }
        },
        isAccountEdited: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            newName: '',
            newBank: '',
            newNumber: '',
            newRole: '',
            newType: '',
            newTransferFee: '',
            newMemo: '',
        }
    },
    mounted() {
        console.log("this.accounts = ", this.accounts)
    },
    methods: {
        createNewAccount() {

            const newAccount = {
                name: this.newName,
                bank: this.newBank,
                number: this.newNumber,
                role: this.newRole,
                type: this.newType,
                transfer_fee: this.newTransferFee,
                memo: this.newMemo,
            }

            this.$emit('create-new-account', newAccount);

            this.newName = ''
            this.newBank = ''
            this.newNumber = ''
            this.newRole = ''
            this.newType = ''
            this.newTransferFee = ''
            this.newMemo = ''

        },
        editAccount() {
            this.$emit('edit-account');
        },
        cancelEditingAccount() {
            const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")
            if (confirmValue) {
                this.$emit('cancel-editing-account')
            }
        },
        async removeAccount(accountHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-account', accountHere);
            }
        },
    }

}
</script>

<style scoped>
@import '../style.css';
</style>

