<template>
  <div id="SpaceDetailPage">
    <!--   空间信息-->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }}(私有空间)</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank">
          +创建图片
        </a-button>
        <a-tooltip :title="`占用空间 ${formatSize(space.totalSize)}/${formatSize(space.maxSize)}`">
          <a-progress
            type="cicle"
            :percent="(((space.totalSize ?? 0) * 100) / (space.maxSize ?? 0)).toFixed(1)"
            :size="42"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <!-- 搜索表单-->
    <PictureSearchForm :onSearch="onSearch" />
    <!--    按颜色搜索-->
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" @pureColorChange="onColorChange" style="width: 100px; height: 40px" />
    </a-form-item>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" showOp :onReload="fetchData" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      :show-total="() => `图片总数${total}/${space?.maxCount}`"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import PictureList from '@/pages/PictureList.vue'
import PictureSearchForm from '@/pages/space/PictureSearchForm.vue'
import { formatSize } from '@/utils'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
const props = defineProps<{ id: string | number }>()

const space = ref<API.SpaceVO>({})
// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id as any,
    })
    if (res.data.code == 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败，' + e.message)
  }
}
const onColorChange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id as any,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败,' + res.data.message)
  }
}
/**
 * 数据
 * */
const dataList = ref<any>([])
const loading = ref(true)
const total = ref(0)
/**
 * 搜索条件
 * */
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'create_time',
  sortOrder: 'desc',
})

/**
 * 分页触发按钮
 * */
const onPageChange = (page: number, pageSize: number) => {
  ;((searchParams.value.current = page), (searchParams.value.pageSize = pageSize))
  fetchData()
}

/**
 * 获取数据
 * */
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
/**
 * 页面加载时请求一次
 * */
onMounted(() => {
  fetchData()
  fetchSpaceDetail()
})
</script>

<style scoped></style>
