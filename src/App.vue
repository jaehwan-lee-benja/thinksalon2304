<template>
  <nav>
    <router-link to="/reading">읽기모드</router-link> |
    <router-link to="/editing">편집모드</router-link>
  </nav>
  <router-view /> <!-- 실제 페이지가 보여질 위치 -->
</template>