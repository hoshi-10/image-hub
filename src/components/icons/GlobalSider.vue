<template>
  <div id="GlobalSider">
    <a-layout-sider v-if="loginUserStore.loginUser.id" width="200" class="sider" breakpoint="lg" collapsed-width="0">
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
const loginUserStore = useLoginUserStore()
/**
 * 点击菜单时捕捉到 key 然后触发 doMenuClick 函数执行 随后路由监听到页面跳转 将跳转的路经赋值给 current 形成菜单项高亮
 * */
const router = useRouter()

//路由跳转事件
// 本来是(event:any)=> ( event : {key:string}  ) => { key }:{ key: string } 解构+类型
const doMenuClick = ({ key }: { key: string }) => {
  router.push({ path: key })
}
// 高亮同步
const current = ref<string[]>(['/'])
//监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 2.原始菜单
const menuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
]
</script>

<style scoped>

</style>
