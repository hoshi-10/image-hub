<template>
  <div id="userLoginPage">
    <h2 class="title">云图管理平台 - 用户登录</h2>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { userLoginUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import type { API } from '@/api/typings'

const loginUserStore = useLoginUserStore()

// 用于接收表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    //调用全局状态管理方法，重新获取并更新当前登录用户的详细信息
    await loginUserStore.fetchLoginUser()
    //界面弹出绿色的“登录成功”提示消息 UI组件提供
    message.success('登录成功')
    //跳转到首页，replace: true 表示替换当前历史记录，防止用户点击浏览器后退按钮回到登录页。
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
}
.title {
  text-align: center;
  margin-top: 60px;
}
.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
