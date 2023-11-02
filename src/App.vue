<template>
  <div :class="mainBodyDiv">
    <div :class="titleDiv">
      <h1>현금흐름 관리하기</h1>
    </div>
    <div :class="subMenuGrid">
      <div :class="loginMenuDiv">
          <div v-if="loginMode" >
            <button @click="loginGoogle">구글 로그인</button>
            <span> *버튼을 눌러 로그인할 수 있습니다.</span>
          </div>
          <div v-else>
            <span> 로그인 계정: {{ email }} | </span>
            <button @click="signout">로그아웃</button>

          </div>
      </div>
    </div>
    <div>
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
      loginMenuDiv: 'loginMenuDiv',
      titleDiv: 'titleDiv',
      subMenuGrid: 'subMenuGrid',
      mainBodyDiv: 'mainBodyDiv',
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