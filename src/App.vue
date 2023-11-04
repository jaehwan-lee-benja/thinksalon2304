<template>
  <div :class="bodyDiv">
    <div :class="menuMainGrid">
      <div :class="menuDiv">
      </div>
      <div :class="mainDiv">
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
        <div>
          <ListEditingView />
        </div>
      </div>
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
      menuMainGrid: 'menuMainGrid',
      bodyDiv: 'bodyDiv',
      menuDiv: 'menuDiv'
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