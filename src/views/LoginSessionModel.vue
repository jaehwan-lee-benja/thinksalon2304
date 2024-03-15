<template>
  <div></div>
</template>

<script>
import { supabase } from '../lib/supabaseClient.js'

export default {
  data() {
    return {
      isNewUser: '',
      session: '',
      loginMode: true,
      email: '',
      initialPageData: '',
    }
  },
  mounted() {
    this.fetchDataForLogIn(),
      this.sessionListener()
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

      const fetchedData = await supabase
        .from('expense')
        .select()
        .order('order', { ascending: true })

      const session = this.session;

      let userId = "";

      if (session !== null) {
        userId = session.user.id;
      } else {
        userId = null;
      }

      function whatId(el) {
        if (el.user_id === userId) {
          return true
        }
      }

      const dataById = fetchedData.data.filter(whatId);
      const dataLength = dataById.length;

      if (dataLength > 0) {
        this.isNewUser = false;
      } else {
        this.isNewUser = true;
      }

      if (this.isNewUser && session !== null) {
        await this.insertInitailData();
      }

      // await this.fetchData()

    },
    async insertInitailData() {
      const initialExpenseData = {
        id: this.getUuidv4(),
        parents_id: null,
        category: '총계',
        amount: 0,
        order: null,
        level: 1,
        page_id: await this.getPageId()
      }
      this.insertData(initialExpenseData)
    },
    async getPageId() {
      this.initialPageData = {
        id: this.getUuidv4(),
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
    async insertData(dataHere) {
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
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("getSession = ", data)
      console.log("error = ", error)
      return data;
    },
    sessionListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session;
        this.email = session?.user.email;
        this.loginBtnHandler();
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