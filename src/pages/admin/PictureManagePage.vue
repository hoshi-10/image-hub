<template>
  <div id="PictureManagePage">
  
    <!-- 搜索表单-->
    <div class="title">
      <a-flex justify="space-between">
        <h2>图片管理</h2>
        <a-space>
          <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>
        </a-space>
      </a-flex>
    </div>
      <PictureSearchForm :on-search="doSearch" />
    <!-- 表格  -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :scroll="{ x: 'max-content' }"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120"></a-image>
        </template>
        <!--  标签-->
        <template v-if="column.dataIndex === 'tags'">
          <a-space>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>

        <!--  图片信息-->
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>

        <!--  审核信息-->
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div>审核人：{{ record.reviewId }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <!--  新增审核通过和拒绝的操作按钮-->
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              v-if="record.reviewStatus != PIC_REVIEW_STATUS_ENUM.PASS"
              type="link"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >通过
            </a-button>
            <a-button
              v-if="record.reviewStatus != PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link"
              danger
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >拒绝
            </a-button>
            <a-button :href="`/add_picture?id=${record.id}`" target="_blank" type="link"
              >编辑
            </a-button>

            <!--   danger: 这是一个布尔属性 将按钮样式设置为红色，通常用于表示“危险操作”（如删除、注销），给用户视觉警示 -->
            <a-button danger @click="doDelete(record.id)"> 删除 </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import PictureSearchForm from '../space/PictureSearchForm.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
  //listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'

import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  //PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture'
//import { deleteSpaceUsingPost } from '@/api/spaceController'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    width: 80,
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

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
//const tagsOptions = ref<{ label: string; value: string }[]>([])

/**
 * 搜索条件
 * */
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 5,
  sortField: 'create_time',
  sortOrder: 'desc',
  tags: [],
})
/**
 * 标签下拉框
 * */

/**
 *分页参数
 */
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total:number) => `共 ${total} 条`,
  }
})

/**
 * 获取数据
 * */
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
onMounted(() => {
  fetchData()
 // TagsOptions()
})

/**
 * 表格变化处理
 * */
const doTableChange = (page: { current?: number; pageSize?: number }) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}
/**
 * 获取数据
 * */
const doSearch = (params: API.PictureQueryRequest) => {
  searchParams.current = 1
  Object.assign(searchParams, params)
  fetchData()
}

/**
 * 删除图片*/
const doDelete = async (id:number) => {
  //检查id是否有效
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //刷新数据 重新向后台请求最新的列表数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}
/**
 * 审核函数
 * */
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    //重新获取列表
    fetchData()
  } else {
    message.error('审核操作失败,' + res.data.message)
  }
}
</script>

<style scoped>
#PictureManagePage .title {
  margin-bottom: 20px;
}
.searchForm {
  margin-bottom: 20px;
}
</style>
