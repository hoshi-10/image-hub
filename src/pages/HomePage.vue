<template xmlns:style="http://www.w3.org/1999/xhtml">
  <div id="HomePage">
    <!--    搜索框-->
    <div class="search-bar">
      <a-input-search
        placeholder="按图片名称或简介搜索"
        v-model:value="searchParams.searchText"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类+标签-->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category"  :tab="category" />
    </a-tabs>

    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 10]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagsList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>

    <!--图片列表-->
    <PictureList :dataList="dataList" :loading="loading" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { API } from '@/api/typings'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import router from '@/router'
import PictureList from '@/pages/PictureList.vue'

/**
 * 数据
 * */
const dataList = ref<any>([])
const loading = ref(true)
const total = ref(0)
/**
 * 搜索条件
 * */
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'create_time',
  sortOrder: 'desc',
})
/**
 *分页参数
 */
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    //切换页号时，会修改搜索参数并获取数据
    onChange: (page: any, pageSize: any) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

/**
 * 获取数据
 * */
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagsList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
onMounted(() => {
  fetchData()
})

const doSearch = () => {
  // 重置搜索条件 让页面回到第一页
  searchParams.current = 1
  fetchData()
}
/**
 * 分页触发按钮
 * */
const onPageChange = (page: number, pageSize: number) => {
  ;((searchParams.current = page), (searchParams.pageSize = pageSize))
  fetchData()
}

const tagList = ref<string[]>([])
const selectedTagsList = ref<string[]>([])
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')

/**
 * 获取标签和分类选项
 * */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()

  if (res.data.data && res.data.code === 0) {
    // 转换成下拉选项组件接受的格式
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#HomePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}
.tag-bar {
  margin-bottom: 24px;
}
</style>
