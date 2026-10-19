<template>
  <div id="SpaceManagePage">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank"> +创建空间 </a-button>
      </a-space>
    </a-flex>

    <!-- 搜索表单-->
    <a-form class="searchForm" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" />
      </a-form-item>

      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="searchParams.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>

      <a-form-item label="用户 id " name="userId">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户id" allow-clear />
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
        <!-- 空间级别 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
        </template>
        <!--  使用情况-->
        <template v-else-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }}/{{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }}/{{ record.maxCount }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank"
              >编辑</a-button
            >
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
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
import type { API } from '@/api/typings'
import dayjs from 'dayjs'
import { deleteSpaceUsingPost, listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { formatSize } from '@/utils'

//1.定结构----定义表格的表头
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 2.表格行数据初始值为空
const dataList = ref<any[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 3,
  sortField: 'create_time',
  sortOrder: 'desc',
})

// 4.自动触发请求， 自动调用fetchData
onMounted(() => {
  fetchData()
})

//获取数据
const fetchData = async () => {
  const res = await listSpaceVoByPageUsingPost({ ...searchParams })
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
  const res = await deleteSpaceUsingPost({ id })
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
#SpaceManagePage .searchForm{
  margin-bottom: 16px;
}
</style>
