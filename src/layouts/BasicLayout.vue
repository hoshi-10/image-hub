<!-- html -结构 -->
<template>
  <div id="BasicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer"> 智能云图库 2026</a-layout-footer>
    </a-layout>
  </div>
</template>

<!-- js 逻辑，数据 -->
<script setup lang="ts">
import GlobalHeader from '@/components/icons/GlobalHeader.vue'
import GlobalSider from '@/components/icons/GlobalSider.vue'
</script>

<!-- css 样式 -->
<style scoped>
#BasicLayout .content {
  background: #f5f7fa;
  padding: 28px;
  margin-bottom: 28px;
  
}
.footer {
  background: white;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
.header {
  background: white;
  padding-inline: 20px;
  color: unset;
  margin-bottom: 0px;
}
.sider {
  background: white;
  border-right: 0.5px solid #eee;
}
:deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
