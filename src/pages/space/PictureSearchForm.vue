<template>
  <div id="PictureSearchForm">
    <!-- 搜索表单-->
    <a-form class="searchForm" layout="horizontal" :model="searchParams" @finish="doSearch">
      <a-row :gutter="[16, 8]">
        <a-col span="6">
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="分类" name="category">
            <a-auto-complete
              v-model:value="searchParams.category"
              :options="categoryOptions"
              placeholder="请输入分类"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="标签" name="tags">
          <a-select
  v-model:value="searchParams.tags"
  placeholder="请输入标签"
  mode="multiple"
  :options="tagOptions"
  allow-clear
/>
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="日期">
            <a-range-picker
              style="width: 100%"
              show-time
              v-model:value="dateRange"
              :placeholder="['编辑开始日期', '编辑结束时间']"
              format="YYYY-MM-DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="名称" name="name">
            <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="简介" name="introduction">
            <a-input
              v-model:value="searchParams.introduction"
              placeholder="请输入简介"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col span="4">
          <a-form-item label="宽度" name="picWidth">
            <a-input-number style="width: 100%" v-model:value="searchParams.picWidth" />
          </a-form-item>
        </a-col>
        <a-col span="4">
          <a-form-item label="高度" name="picHeight">
            <a-input v-model:value="searchParams.picHeight" allow-clear />
          </a-form-item>
        </a-col>
        <a-col span="4">
          <a-form-item label="格式" name="picFormat">
            <a-input v-model:value="searchParams.picFormat" placeholder="请输入格式" allow-clear />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">搜索</a-button>
              <a-button html-type="reset" @click="doClear">重置</a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
type PictureQueryRequest = API.PictureQueryRequest

interface Props {
  onSearch?: (searchParams: PictureQueryRequest) => void
}
const props = defineProps<Props>()

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})
// 获取数据
const doSearch = () => {
  props.onSearch?.(searchParams)
}

const dateRange = ref<[]>([])
const rangePresets = ref([
  { label: '过去7天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去14天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去30天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去90天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

/**
 * 日期范围更改时触发
 * */
const onRangeChange = (dates: dayjs.Dayjs[] | null) => {
  if (!dates || dates.length !== 2) {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  } else {
    searchParams.startEditTime = dates[0].format('YYYY-MM-DD HH:mm:ss')
    searchParams.endEditTime = dates[1].format('YYYY-MM-DD HH:mm:ss')
  }
}

const tagOptions = ref<{ value: string; label: string }[]>([])
const categoryOptions = ref<{ value: string; label: string }[]>([])
/**
 * 获取标签和分类选项
 * */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()

  if (res.data.data && res.data.code === 0) {
    // 转换成下拉选项组件接受的格式

    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败' + res.data.message)
  }
}
// 页面只加载一次
// 通常“标签”和“分类”这种基础数据是不会经常变的。进页面时拿一次就够了，用户在页面上操作时，不需要反复刷新这些选项。
onMounted(() => {
  getTagCategoryOptions()
})
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key: string) => {
    //，这里的 key 一定是 searchParams 里的属性名
    // typeof searchParams：获取 searchParams 这个对象的类型。
    // keyof ...：获取该类型所有的键
    searchParams[key as keyof typeof searchParams] = undefined
  })

  dateRange.value = []
  props.onSearch?.(searchParams)
}
</script>

<style scoped>
#PictureSearchForm {
  margin-top: 30px;
}
</style>
