<template xmlns:style="http://www.w3.org/1999/xhtml">
  <div id="PictureListPage">
    <!--图片列表-->
    <a-list
      :grid="{ gutter: 15, xs: 1, sm: 2, md: 4, lg: 4, xl: 4 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!--  单张图片-->
          <a-card hoverable @click="doClickPicture(picture)" class="picture-card">
            <template #cover>
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.name"
                :src="picture.url?.startsWith('http') ? picture.url : 'https://' + picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
  <div class="card-action" @click="(e: Event) => doSearch(picture, e)">
    <search-outlined />
    <span>搜索</span>
  </div>

  <div class="card-action" @click="(e: Event) => doShare(picture, e)">
    <share-alt-outlined />
    <span>分享</span>
  </div>

  <div class="card-action" @click="(e: Event) => doEdit(picture, e)">
    <edit-outlined />
    <span>编辑</span>
  </div>

  <div class="card-action" @click="(e: Event) => doDelete(picture, e)">
    <delete-outlined />
    <span>删除</span>
  </div>
</template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal title="分享链接" ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/icons/ShareModal.vue'
import { ref } from 'vue'
import {
  SearchOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
})
//跳转至图片详情页
const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}
const doEdit = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  router.push({
    path: `/add_picture`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
const doDelete = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  const id = picture.id
  if (!id) return
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 让外层刷新
    props?.onReload?.()
  } else {
    message.error('删除失败')
  }
}

const doSearch = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}

//分享弹窗引用
const shareModalRef = ref()
//分享链接
const shareLink = ref<string>()

//分享
const doShare = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModel()
  }
}
</script>

<style scoped>
.card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  cursor: pointer;
}

.picture-card {
  width: 100%;
}
</style>