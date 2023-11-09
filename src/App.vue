<template>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">
        <button @click="openPageDiv()">페이지 설정하기</button>
          <div v-if="isPageDivOpened" :class="modal">
                <PageList v-bind:expenses="expenses" @remove-e-by-pageId="removeExpenseByPageDelete" />
          </div>
          <div v-if="isPageDivOpened" :class="modalOverlay" @click="closePageDiv"></div>
      </div>
      <div :class="loginDiv"> 
        <div v-if="loginMode" >
          <button @click="loginGoogle">구글 로그인</button>
          <p> *버튼을 눌러 로그인할 수 있습니다.</p>
        </div>
        <div v-else>
          <p> 로그인 계정: {{ email }}</p>
          <button :class="loginBtn" @click="signout">로그아웃</button>
        </div>
      </div>
    </div>
    <div :class="mainDiv">
      <ListEditingView />
    </div>
  </div>
</template>

<script>
import LogIn from './views/LogIn.vue'
import ListEditingView from './views/ListEditingView.vue'
import PageList from './views/PageList.vue'

export default {
  data() {
    return {
      isPageDivOpened: false,

      loginmenuGrid: 'loginmenuGrid',
      menuMainGrid: 'menuMainGrid',
      menuGrid: 'menuGrid',
      mainDiv: 'mainDiv',
      loginBtn: 'loginBtn',
      pageListDiv: 'pageListDiv',
      loginDiv: 'loginDiv',
      modal: 'modal',
      modalOverlay: 'modalOverlay',
    }
  },
  mixins: [LogIn],
  components: {
    ListEditingView,
    PageList,
  },
  methods: {
    openPageDiv() {
        this.isPageDivOpened = true;
    },
    closePageDiv() {
        this.isPageDivOpened = false;
    },
  }
}
</script>

<style scoped>
  @import './style.css';
</style>