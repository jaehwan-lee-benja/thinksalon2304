<template>
  <div></div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'
import Mutex from '../lib/mutex.js'

const mutex = new Mutex()

export default {
  data() {
    return {
      isNewUser: '',
      session: '',
      loginMode: true,
      email: '',
      initialPageData: '',
      initialDataInserted: false, // 새로운 데이터가 삽입되었는지 여부를 추적하는 상태 추가
    }
  },
  mounted() {
    this.sessionListener()
  },
  watch: {
  },
  methods: {
    async loginGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        //   options: {
        //   redirectTo: 'https://thinksalon.github.io/moneyflow/'
        // }
      })
      console.log("data = ", data);
      console.log("error = ", error);
    },
    async signout() {
      const confirmValue = confirm("로그아웃하시겠습니까?")

      if (confirmValue) {
        const { error } = await supabase.auth.signOut()
        console.log("error = ", error);
        if (error == null) {
          alert('로그아웃 되었습니다.')
          window.location.reload(true); // 리로드 방식 expense를 []로
        } else {
          alert('checking..')
        }
      }
    },
    async fetchDataForLogIn() {

      if (this.session) {

        await mutex.lock() // 여기서 mutex가 유휴 상태일 때 까지 대기하며, 유휴 상태가 되면 잠금을 걸고 진행한다.

        try {

          // 사용자가 로그인한 경우에만 실행
          const fetchedData = await supabase
            .from('expense')
            .select()
            .order('order', { ascending: true })

          const userId = this.session.user.id;

          const dataById = fetchedData.data.filter(el => el.user_id === userId);
          const dataLength = dataById.length;

          this.isNewUser = dataLength === 0;

          if (this.isNewUser && !this.initialDataInserted) {

            await this.insertInitailExpenseData(userId);
            await this.insertInitailAccountData(userId);
            this.initialDataInserted = true;

            this.fetchData()

          }

        } finally {

          mutex.release() // 반드시 실행한다. 그렇지 않으면 Dead-lock 발생함.

        }

      }
    },
    async insertInitailExpenseData(userIdHere) {
      const initialExpenseData = {
        id: await this.getUuidv4(),
        parents_id: null,
        category: '총계',
        amount: 0,
        order: null,
        level: 1,
        page_id: await this.getPageId(),
        account_id: null,
        user_id: userIdHere
      }
      await this.insertExpenseData(initialExpenseData)

      this.createdExpenseIdForMonitor = initialExpenseData.id;

    },
    async insertInitailAccountData(userIdHere) {
      const initialAccountData = {
        id: await this.getUuidv4(),
        name: "미지정",
        number: "",
        order: 0,
        user_id: userIdHere
      }
      await this.insertAccountData(initialAccountData)
    },
    async getPageId() {
      this.initialPageData = {
        id: await this.getUuidv4(),
        page_name: '새 페이지',
        order: 0,
      }
      await this.insertPageData(this.initialPageData)
      this.selectedPageId = this.initialPageData.id

      return this.initialPageData.id
    },
    async insertPageData(dataHere) {
      try {
        const { error } = await supabase
          .from('expense_page')
          .insert(dataHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async insertExpenseData(dataHere) {
      try {
        const { error } = await supabase
          .from('expense')
          .insert(dataHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async insertAccountData(dataHere) {
      try {
        const { error } = await supabase
          .from('account')
          .insert(dataHere)
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("getSession = ", data)
      console.log("error = ", error)
      return data;
    },
    sessionListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        if(event ==='SIGNED_IN'){
        this.session = session;
        this.email = session?.user.email;
        this.loginBtnHandler();
        this.fetchDataForLogIn()
        }
      })
    },
    loginBtnHandler() {
      const session = this.session;
      if (session !== null) {
        this.loginMode = false;
      } else {
        this.loginMode = true;
      }
    },
  }
}
</script>

<style scoped>
@import '../style.css';
</style>