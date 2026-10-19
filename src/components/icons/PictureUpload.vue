<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="props.picture?.url" :src="props.picture?.url" alt="avatar" />
      <!--      没图时的备用界面-->
      <div v-else>
        <!--       显示加载图标-->
        <loading-outlined v-if="loading"></loading-outlined>
        <!--        loading为false时，没有加载图标，显示加号-->
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'

import { uploadPictureUsingPost } from '@/api/pictureController'
import type { API } from '@/api/typings'

const loading = ref<boolean>(false)

// defineProps Vue3特殊属性 动作开启接收外来东西
interface Props {
  picture?: API.PictureVO
  spaceId?: string
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()



//上传前校验函数
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  // 效验图片格式
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐jpg或png')
  }

  // 校验图片大小
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
  }
  return isJpgOrPng && isLt2M
}

// 上传
const handleUpload = async ({ file }: any) => {
  // 图片加载按钮
  loading.value = true
  try {
    // 检查是否已经有一张照片
    const params : API.PictureUploadRequest =props.picture ? { id: props.picture.id } : {}
    params.spaceId=props.spaceId ;
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}
.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
