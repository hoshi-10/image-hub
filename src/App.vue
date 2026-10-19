<!-- HTML 骨架层-->
<template>
    <div id="app">
    <BasicLayout />
    </div>

</template>

<!-- 业务逻辑层 有数据定义，函数方法，生命周期，引入依赖等内容-->
<script setup lang="ts">
  import BasicLayout  from '@/layouts/BasicLayout.vue'
  import { healthUsingGet} from '@/api/mainController'


  healthUsingGet().then((res) => {
    console.log(res)
  })


</script>

<!-- 美化样式 scoped仅限当前页面的组件生效-->
<style scoped>

</style>
