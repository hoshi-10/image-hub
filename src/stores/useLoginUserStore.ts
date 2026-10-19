import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'
// @ts-ignore
import type { API } from '@/api/typings'

/**
 * 定义用户的存储，远程获取，修改逻辑
 *
 * 全局管理当前登录用户
 * */
export const useLoginUserStore = defineStore(
  'loginUser', () => {

  // 1.定义了一个响应式变量 loginUser
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  //2. 定义动作--获取用户信息（从服务器拉取数据并更新状态）
  async function fetchLoginUser() {
    // res: 服务器的完整响应对象。通常结构是 { code: 0, data: {...}, message: "success" }
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
  }

  //3.定义动作--手动设置用户
  // 定义一个同步函数，用于手动更新用户信息
  function setLoginUser(newLoginUser: API.LoginUserVO) {
    loginUser.value = newLoginUser
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})
