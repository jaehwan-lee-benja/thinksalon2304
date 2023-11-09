<template>
  <div :class="menuMainGrid">
    <div :class="menuGrid">
      <div :class="pageListDiv">
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

export default {
  data() {
    return {
      loginmenuGrid: 'loginmenuGrid',
      menuMainGrid: 'menuMainGrid',
      menuGrid: 'menuGrid',
      mainDiv: 'mainDiv',
      loginBtn: 'loginBtn',
      pageListDiv: 'pageListDiv',
      loginDiv: 'loginDiv',
    }
  },
  mixins: [LogIn],
  components: {
    ListEditingView
  },
  methods: {
  }
}
</script>

<style scoped>
  @import './style.css';
</style>