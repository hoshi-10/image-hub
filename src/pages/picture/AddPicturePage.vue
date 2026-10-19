<template id="AddPicturePage">
  <h2 style="margin-bottom: 16px">
    {{ route.query?.id ? '修改图片' : '创建图片' }}
  </h2>

  <a-typography-paragraph type="secondary">
    保存至空间：
    <a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
  </a-typography-paragraph>

  <!--    选择上传方式-->
  <a-tabs v-model:activeKey="uploadType">
    <a-tab-pane key="file" tab="文件上传">
      <!--  通过图片上传-->
      <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
    </a-tab-pane>

    <a-tab-pane key="url" tab="URL 上传">
      <!--  通过图片上传 url地址 -->
      <UrlPictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
    </a-tab-pane>
  </a-tabs>
  <!--  图片编辑-->
  <a-space size="middle">
    <a-button type="primary" ghost :icon="h(FullscreenOutlined)" @click="doImagePainting">
      AI 扩图
    </a-button>
  </a-space>
  <ImageOutPainting
    ref="imageOutPaintingRef"
    :picture="picture"
    :spaceId="spaceId"
    :onSuccess="onImageOutPaintingSuccess"
  />

  <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
    <a-form-item label="名称" name="name">
      <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
    </a-form-item>

    <a-form-item label="简介" name="introduction">
      <a-textarea
        v-model:value="pictureForm.introduction"
        placeholder="请输入简介"
        allowClear
        :auto-size="{ minRows: 2, maxRows: 5 }"
      />
    </a-form-item>

    <a-form-item label="分类" name="category">
      <a-auto-complete
        v-model:value="pictureForm.category"
        :options="categoryOptions"
        placeholder="请输入分类"
        allowClear
      />
    </a-form-item>

    <a-form-item label="标签" name="tags">
      <a-select
        v-model:value="pictureForm.tags"
        :options="tagOptions"
        mode="tags"
        placeholder="请输入标签"
        allowClear
      />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/icons/PictureUpload.vue'
import ImageOutPainting from '@/components/icons/ImageOutPainting.vue'
import { computed, h, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import type { API } from '@/api/typings'
import UrlPictureUpload from '@/components/icons/UrlPictureUpload.vue'
import ImageCropper from '@/components/icons/ImageCropper.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'



const pictureForm = ref<API.PictureEditRequest>({})
const router = useRouter()
const route = useRoute()
const uploadType = ref<'file' | 'url'>('file')
const spaceId = computed(() => {
  return route.query?.spaceId
})
/**
 * 受控组件
 * */
const picture = ref<API.PictureVO>()
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  // 核心修改：不要只改 name，而是把整个对象重新赋值一遍
  pictureForm.value = {
    ...pictureForm.value, // 保留旧数据
    name: newPicture.name, // 覆盖/新增 name
  }
}

/**
 * 提交表单的函数
 * */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) return
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.data && res.data.code === 0) {
    message.success('创建成功')

    // 跳转到图片的详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败' + res.data.message)
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
  getOldPicture()
})

/**
 * 图片信息修改
 */
const getOldPicture = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    if (res.data.data && res.data.code === 0) {
      const data = res.data.data
      picture.value = data
      pictureForm.value.name = data.name
      pictureForm.value.introduction = data.introduction
      pictureForm.value.tags = data.tags
      pictureForm.value.category = data.category
    }
  }
}

// AI 扩图弹窗引用
const imageOutPaintingRef = ref()

// AI 扩图
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal?.()
  } else {
    console.error('未找到 ImageOutPainting 组件实例')
  }
}

// AI 扩图成功事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
</script>

<style scoped>
#AddPicturePage {
  max-width: 600px;
  margin: 0 auto;
}
</style>
