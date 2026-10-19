<template>
  <div id="UserManagePage">
    <!-- 搜索表单-->
    <a-form class="searchForm" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>

      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>

      <!--  html-type="submit"和  @finish="doSearch" 高度绑定  如果不加这个，点击按钮可能不会触发表单提交逻辑。-->
      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
      </a-form-item>
    </a-form>

    <!-- 表格  -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <!--      表格组件支持使用Vue的插槽自定义列的展示-->
      <template #bodyCell="{ column, record }">
        <!-- 头像列自定义渲染-->
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="120"></a-image>
        </template>

        <template v-else-if="column.dataIndex === 'userRole'">
          <!--  用户角色列自定义渲染-->
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <!--   danger: 这是一个布尔属性 将按钮样式设置为红色，通常用于表示“危险操作”（如删除、注销），给用户视觉警示 -->
          <a-button danger @click="doDelete(record.id)"> 删除 </a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import type { API } from './api/typings'
import dayjs from 'dayjs'
type UserVO = API.UserVO

//1.定结构----定义表格的表头
const columns = [
  {
    title: 'id',
    // response 返回的字段里
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 2.表格行数据初始值为空
const dataList = ref<UserVO[]>([])
const total = ref(0)

// 3.定参数----搜索条件，reactive: Vue 3 的另一种响应式 API，适合定义对象
//searchParams: 一个响应式对象，存储所有发给后端的查询参数
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 3,
})

// 4.自动触发请求， 自动调用fetchData
onMounted(() => {
  fetchData()
})

// 5.去获取-----获取数据（后端返回数据 ----数据回流与渲染）
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost(
    // { ...searchParams }: 使用展开运算符，把 searchParams 里的所有字段（current, pageSize, 搜索关键词等）都传给后端。
    { ...searchParams },
  )
  // 6.存数据
  if (res.data.data) {
    // 把后端返回的records数据 赋值 给 dataList
    dataList.value = res.data.data.records ?? []
    // 把后端返回的total值 赋值 给 total
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 7.算分页----（current, pageSize, total)其中一个变了就会触发这个函数的运行
// 5个属性（current, pageSize, total, showSizeChanger, showTotal）
//全部都是 Ant Design Vue  表格组件 (<a-table>) 中 pagination 配置对象的官方标准属性。
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    //显示“每页显示 X 条”的下拉框，是否显示pageSize 切换器
    showSizeChanger: true,
    //自定义显示“共 X 条”的文字。
    // 传入一个函数，将数字 58 格式化为中文文案 共 58 条。
    showTotal: (total: any) => `共 ${total} 条`,
  }
})

// 8.表格变化处理
// 假设用户点击了分页器的"分页器的第 2 页 "
// 分页器的current触发了@change事件，这个事件自动抛出page对象，page对象包含了current，pageSize和total三个核心属性
const doTableChange = (page: any) => {
  // 重置参数的数值
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize

  // 再次调用后端接口
  fetchData()
}

// 搜索组件
// 获取数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

//删除数据
const doDelete = async (id: any) => {
  //检查id是否有效
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //刷新数据 重新向后台请求最新的列表数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
#UserManagePage .searchForm{
  margin-bottom: 18px;
}
</style>
