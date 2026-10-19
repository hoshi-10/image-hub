<template>
  <a-modal v-model:open="visible" :title="title" :footer="false" @cancel="closeModel">
    <h4>复制分享链接</h4>

    <a-typography-link copyable>
      {{ link }}
    </a-typography-link>

    <div style="margin-bottom: 20px" />

    <h4>手机扫码查看</h4>

    <a-qrcode :value="link" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  link?: string
}

withDefaults(defineProps<Props>(), {
  title: '分享',
  link: '',
})

// 是否显示弹窗
const visible = ref(false)

// 打开弹窗
const openModel = () => {
  visible.value = true
}

// 关闭弹窗
const closeModel = () => {
  visible.value = false
}

// 暴露给父组件
defineExpose({
  openModel,
})
</script>
