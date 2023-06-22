<template>
    <div :class="loginDiv" v-if="loginMode">
      <div :class="loginBtnDiv">
        <div v-if="loginModeSubA">
          <div :class="idPwInputDiv">
            <span>이메일:</span><input :class="normalInput" v-model="email">
            <span>비밀번호:</span><input type="password" :class="normalInput" v-model="password">
          </div>
          <button :class="textBtn" @click="gotoSignup">신규가입</button>
          <span> / </span>
          <button @click="login">로그인</button>
        </div>
        <div v-else>
          <span>[회원가입하기]</span>
          <div :class="idPwInputDiv">
            <span>새 이메일:</span><input :class="normalInput" placeholder="이메일 적기" v-model="newEmail">
            <span>새 비밀번호:</span><input type="password" placeholder="비밀번호 적기" :class="normalInput" v-model="newPassword">
          </div>
          <button :class="textBtn" @click="gotoLogin">뒤로가기</button>
          <span> / </span>
          <button @click="signup">완료</button>
        </div>
      </div>
    </div>
    <div v-else>
      <button @click="signout">sign-out</button>
    </div>

    <button @click="loginGoogle">구글 로그인</button>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'
export default {
    data() {
        return {
            email: '',
            password: '',
            newEmail: '',
            newPassword: '',
            session: '',

            loginDiv: 'loginDiv',
            normalInput: 'normalInput',
            idPwInputDiv: 'idPwInputDiv',
            loginBtnDiv: 'loginBtnDiv',
            textBtn: 'textBtn',

            signoutMode: '',
            loginMode: true,
            loginModeSubA: true,

        }
    },
    mounted() {
      this.checkSession();
    },
    methods: {
    async loginGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      console.log("data = ", data);
      console.log("error = ", error);
    },
    async checkSession() {
      console.log("checkSession here!");
      const { data, error } = await supabase.auth.getSession();
      console.log("error @checkSession = ", error);

      if(this.loginMode == true && data.session !== null) {
        this.loginMode = false
      }

    },
    async signup() {
      const { data, error } = await supabase.auth.signUp({
        email: this.newEmail,
        password: this.newPassword,
      })
      console.log("data = ", data);
      console.log("error = ", error);

      if(error == null) {
        this.loginMode = false;
        window.location.reload(true);
      } else {
        alert('회원가입을 실패하였습니다. *기존 가입이 되어있거나, 비밀번호를 6자리 미만인지 확인바랍니다.')
      }

    },
    async login() {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      })
      console.log("data = ", data);
      console.log("error = ", error);
      if(error == null) {
        window.location.reload(true);
        alert('반갑습니다 :)')
        this.loginMode = false;
      } else {
        alert('아이디 또는 비밀번호를 확인바랍니다.')
      }
    },
    async signout() {
      const { error } = await supabase.auth.signOut()
      console.log("error = ", error);
      if(error == null) {
        this.loginMode = true;
        alert('로그아웃 되었습니다.')
        window.location.reload(true); // [질문] 리로드 방식 expense를 []로
      } else {
        alert('checking..')
      }
    }, 
    gotoSignup() {
      this.loginModeSubA = false;
      this.email = '';
      this.password = '';
    },
    gotoLogin() {
      this.loginModeSubA = true;
      this.email = '';
      this.password = '';
    }
  }
}

</script>

<style scoped>
  @import '../style.css';
</style>