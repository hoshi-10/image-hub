<template>
  <div id="AddSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改空间' : '创建空间' }}
    </h2>
    <!-- 搜索表单 垂直布局 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>

      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          提交
        </a-button>
      </a-form-item>
    </a-form>

    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系管理员
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}:大小 {{ formatSize(spaceLevel.maxSize) }},数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { onMounted, reactive, ref } from 'vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import router from '@/router'
import { formatSize } from '@/utils'
import { useRoute } from 'vue-router'

const route = useRoute()
const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)
// const oldSpace = ref<API.SpaceVO>()
//
// //获取老数据
// const getOldSpace = async () => {
//   // 获取数据
//   const id = route.query?.id
//   if (id) {
//     const res = await getSpaceVoByIdUsingGet({
//        id: Number(id),
//     })
//     if (res.data.code == 0 && res.data.data) {
//       const data = res.data.data
//       oldSpace.value = data
//       formData.spaceName = data.spaceName
//       formData.spaceLevel = data.spaceLevel
//     }
//   }
// }
// onMounted(() => {
//   getOldSpace()
// })

const handleSubmit = async (values: any) => {
  // const spaceId = oldSpace.value?.id
  const spaceId = route.query?.id
  loading.value = true
  let res
  // 更新空间
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...values,
    })
  } else {
    // 创建空间
    res = await addSpaceUsingPost({
      ...formData,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败' + res.data.message)
  }
  loading.value = false
}

const spaceLevelList = ref<API.SpaceLevel[]>([])
//获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})
</script>

<style scoped>
#AddSpacePage {
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
