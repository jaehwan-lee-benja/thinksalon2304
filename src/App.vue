<template>
  <div :class="appBodyGrid">
    <div :class="menuDiv">
      <h1>
        <div>현금흐름</div>
        <div>관리하기</div>
      </h1>
      <button @click="handlingMode"> 
        <span v-if="mode">편집하기</span>
        <span v-else>뒤로가기</span> 
      </button>
      <div>
        <span v-if="mode">'편집하기' 버튼을 누르면, 내용을 편집할 수 있습니다.</span>
        <span v-else>'뒤로가기' 버튼을 누르면, 편집모드가 종료됩니다.(저장되지 않음)</span>
      </div>
    </div>
    <div>
      <ReadingView v-if="mode" />
      <EditingView v-else />
    </div>
  </div>
</template>

<script>
import ReadingView from './views/ReadingView.vue'
import EditingView from './views/EditingView.vue'

export default {
  data() {
    return {
      mode: true,
      appBodyGrid: 'appBodyGrid',
      menuDiv: 'menuDiv'
    }
  },
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    handlingMode() {
      this.mode = !this.mode
    }
  }
}
</script>

<style scoped>
  @import './style.css';
</style>