<!-- 选择图片drawer -->
<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-input
        v-model="searchParams.name"
        placeholder="请输入关键词"
        clearable
        size="small"
        style="width:calc(100% - 120px);margin-right: 10px"
      />
      <el-button
        icon="el-icon-search"
        type="primary"
        size="small"
        style="width: 50px"
        @click="getAttachmentList"
      />
      <el-button
        icon="el-icon-upload"
        type="primary"
        size="small"
        style="width: 50px"
        @click="uploadDialog=true"
      />
    </div>
    <div>
      <v-empty-data v-if="attachmentList.length===0" style="width: 100px" />
      <el-row v-loading="listLoading" :gutter="20">
        <el-col v-for="(attachment,index) in attachmentList" :key="attachment.id" :span="12">
          <div class="attachment-item" @click="selected(index)">
            <v-image :src="baseUrl + attachment.thumbPath" :alt="attachment.name">
              <div slot="error">
                <i v-if="attachment.mediaType.search('image') !== -1" class="el-icon-picture-outline" />
                <span v-else>{{ attachment.mediaType }}</span>
              </div>
            </v-image>
            <div class="name" :title="attachment.name">{{ attachment.name }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 分页 -->
    <div style="margin-top: 20px;text-align: center">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size.sync="searchParams.pageSize"
        :current-page.sync="searchParams.current"
        @current-change="getAttachmentList"
        @size-change="getAttachmentList"
      />
    </div>
    <!-- 附件上传dialog -->
    <el-dialog
      title="上传附件"
      :visible.sync="uploadDialog"
      destroy-on-close
      width="30vw"
      append-to-body
      @close="getAttachmentList"
    >
      <v-upload />
    </el-dialog>
  </div>
</template>

<script>
import { listAttachments } from '@/api/attachment'

export default {
  name: 'Select',
  components: {
    'v-image': () => import('@/components/Common/simple-image'),
    'v-empty-data': () => import('@/components/Common/empty-data'),
    'v-upload': () => import('@/views/attachment/upload')
  },
  data() {
    return {
      searchParams: {
        current: 1,
        pageSize: 6,
        name: ''
      },
      total: 0,
      attachmentList: [],
      listLoading: false,
      uploadDialog: false
    }
  },
  created() {
    this.getAttachmentList()
  },
  methods: {
    selected(index) {
      // const data = JSON.parse(JSON.stringify(this.attachmentList[index]))
      const data = this.attachmentList[index]
      this.$emit('selected', data)
    },
    // 获取附件列表信息
    getAttachmentList() {
      this.listLoading = true
      listAttachments(this.searchParams).then(resp => {
        if (resp.status === 200) {
          this.total = resp.data.total
          this.attachmentList = resp.data.list
        }
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="scss">

.el-col {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

</style>

<style scoped lang="scss">
.attachment-item {
  position: relative;

  .name {
    padding: 6px;
    font-size: 12px;
    color: #5a5e66;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
