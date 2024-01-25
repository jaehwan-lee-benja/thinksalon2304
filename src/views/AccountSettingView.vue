<template>
    <div class="pageListStyle">
        <h2>계좌 설정하기</h2>
        <div class="createNewPageDiv">
            <h4>새 계좌 추가하기</h4>
            <span>계좌 별명: </span>
            <input v-model="this.newAccountName" placeholder="새 계좌 별명 적기">
            <button @click="createNewAccount">만들기</button>

        </div>

        <div>
            <h4>기존 계좌 편집하기</h4>
            <ol class="pageSettingOlStyle">
                <li v-for="account in this.accounts" :key="account.id">
                    <input class="pageNameStyle" v-model="account.account_name">
                    <button @click="removeAccount(account)">삭제</button>
                </li>
            </ol>
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
            newAccountName: '',
        }
    },
    methods: {
        createNewAccount() {
            this.$emit('create-new-account', this.newAccountName);
            this.newAccountName = "";
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

