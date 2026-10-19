<template>
  <div id="GlobalHeader">
    <!-- :wrap="false"   禁止换行-->
    <a-row :wrap="false">
      <a-col flex="200px">
        <!--  只要是网站内部的页面跳转（比如从“登录页”跳到“首页”，从“列表页”跳到“详情页”），必须使用 <router-link>。-->
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="@/assets/img1.ico" />
            <div class="title">智能云图库</div>
          </div>
        </router-link>
      </a-col>

      <!--  业务逻辑：布局（auto），渲染（v-model），数据渲染（:items）,状态（高亮），交互（事件监听）-->
      <a-col flex="auto">
        <a-menu
          class="items-status"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>

      <a-col flex="100px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <!--   下拉菜单组件。 它包裹的内容会作为一个“触发器”-->
            <a-dropdown>
              <!-- <a-space> 间距布局组件，用于自动给子元素之间添加间隔。-->
              <a-space direction="horizontal">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                <span class="username-text">
                  {{ loginUserStore.loginUser.userName ?? '无名' }}
                </span>
              </a-space>

              <!-- #是具名插槽 是dropdown 常用的插槽名 -->
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_space">
                      <UserOutlined />
                      我的空间
                    </router-link>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

// 存储当前登录用户的信息状态
const loginUserStore = useLoginUserStore()
// 初始化---获取到的 Vue Router 实例。
const router = useRouter()

/**
 * 是 doMenuClick 函数先主动修改了路由，然后路由跳转完成后，
 * router.afterEach 才被触发来高亮同步状态（作为兜底或修正）。
 * */

// 本来是(event:any)=> ( event : {key:string}  ) => { key }:{ key: string } 解构+类型
const doMenuClick = ({ key }: { key: string }) => {
  router.push({ path: key })
}
// 高亮同步
const current = ref<string[]>(['/'])
// 只要路由跳转成功，这个函数就会自动执行
// to: 即将进入的目标路由对象
router.afterEach((to) => {
  current.value = [to.path]
})

// 2.原始菜单
const originItems = [
  {
    //菜单项的唯一标识符。
    key: '/',
    // () => h(..) 调用h()函数将图标代码渲染成图标显示到屏幕上
    icon: () => h(HomeOutlined),
    //菜单项显示的文字内容
    label: '主页',
    //鼠标悬停在菜单上时显示的原生提示文本
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
]

// 定义一个函数，用于过滤菜单
const filterMenus = (menus:MenuProps['items'] = [] ) => {
  return menus?.filter((menu) => {
    if (menu&&'key'in menu && menu.key?.toString().startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

const items = computed(() => filterMenus(originItems))

//用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#GlobalHeader .title-bar {
  display: flex;
  align-items: center;
}
.logo {
  height: 50px;
}
.title {
  color: black;
  font-size: 15px;
  margin-left: 3px;
}

#GlobalHeader .items-status {
  font-size: 15px;
}

.login-status {
  font-size: 15px;
  margin-left: 3px;
}

.username-text {
  max-width: 200px; /* 限制最大宽度 */
  overflow: hidden; /* 隐藏超出的部分 */
  text-overflow: ellipsis; /* 显示省略号 (...) */
  white-space: nowrap; /* 强制不换行 */
  font-weight: 500;
}
</style>
