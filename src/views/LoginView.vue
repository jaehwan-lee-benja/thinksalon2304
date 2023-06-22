<template>
    <div :class="loginDiv">
        <div :class="idPwInputDiv">
          <span>email:</span><input :class="normalInput" v-model="email">
          <span>password:</span><input :class="normalInput" v-model="password">
        </div>
        <div :class="loginBtnDiv">
          <button @click="signup">sing-up</button>
          <button @click="login">login</button>
          <button @click="signout">sign-out</button>
        </div>
      </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'
export default {
    data() {
        return {
            email: '',
            password: '',
            session: '',

            loginDiv: 'loginDiv',
            normalInput: 'normalInput',
            idPwInputDiv: 'idPwInputDiv',
            loginBtnDiv: 'loginBtnDiv'
        }
    },
    methods: {
    async signup() {
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
      })
    console.log("email = ", this.email);
    console.log("password = ", this.password);
    console.log("data = ", data);
    console.log("error = ", error);
    },
    async login() {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      })
    console.log("data = ", data);
    console.log("error = ", error);
    
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("session = ", data)
      console.log("error = ", error)
    },
    async signout() {
      const { error } = await supabase.auth.signOut()
      console.log("error = ", error);
    }, 
  }
}

</script>

<style scoped>
  @import '../style.css';
</style>