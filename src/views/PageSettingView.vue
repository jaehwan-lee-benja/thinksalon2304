<template>
    <div class="pageSettingDiv">
        <div class="createNewPageDiv">
            <h4>새 페이지 만들기</h4>
            <span>새 페이지명: </span>
            <input class="pageNameStyle" v-model="this.newPageName" placeholder="새 페이지명 적기">
            <button @click="createNewPage">만들기</button>
        </div>
        <div>
            <h4>기존 페이지 편집하기</h4>
            <ol class="pageSettingOlStyle">
                <li v-for="page in this.expensePages" :key="page.id">
                    <input class="pageNameStyle" v-model="page.page_name">
                    <button @click="selectPageByPageSetting(page.id)">열기</button>
                    <button @click="removePage(page)">삭제</button>
                </li>
            </ol>
        </div>
    </div>
    <div class="settingSaveBtnDiv">
        <button :class="{
            'pageEditedBtn_active': isPageEdited === true,
            'pageEditedBtn_inactive': isPageEdited === false
        }" :disabled="!isPageEdited" @click="editPage">편집한 내용 저장</button>
        <button :class="{
            'cancelPageEditedBtn_active': isPageEdited === true,
            'cancelPageEditedBtn_inactive': isPageEdited === false
        }" :disabled="!isPageEdited" @click="cancelEditingPage">편집 취소</button>
    </div>
</template>

<script>

export default {
    name: 'PageSettingView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        expensePages: {
            type: Object,
            default: () => { }
        },
        isPageEdited: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            newPageName: '',
        }
    },
    methods: {
        createNewPage() {
            this.$emit('create-new-page', this.newPageName);
            this.newPageName = "";
        },
        editPage() {
            this.$emit('edit-page');
        },
        cancelEditingPage() {
            const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")
            if (confirmValue) {
                this.$emit('cancel-editing-page')
            }
        },
        async removePage(pageHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-page', pageHere);
            }
        },
        async selectPageByPageSetting(pageIdHere) {
            const selectedPage = this.expensePages.find(e => e.id === pageIdHere);
            if (!this.isPageEdited) {
                this.$emit('set-page-by-select-page', selectedPage);
                this.$emit('show-section', 'flowView');
            } else {
                const confirmValue = confirm("편집 중인 내용을 저장하시겠습니까? 저장하지 않으면, 편집 중인 내용은 사라집니다.")
                if (confirmValue) {
                    this.$emit('edit-page');
                    this.$emit('set-page-by-select-page', selectedPage);
                    this.$emit('show-section', 'flowView');
                }
            }
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>
