<template>
  <div class="app-container">
    <div class="search-box">
      <el-form ref="searchParamsForm" :inline="true" :model="searchParams" size="small">
        <el-form-item label="关键词：" prop="name">
          <el-input v-model="searchParams.name" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="附件类型：" prop="mediaType">
          <el-select v-model="searchParams.mediaType" style="width: 160px" placeholder="">
            <el-option
              v-for="(mediaType,index) in mediaTypeList"
              :key="index"
              :value="mediaType"
              :label="mediaType"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getAttachmentList">查 询</el-button>
          <el-button @click="resetSearchParams('searchParamsForm')">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" size="small" icon="el-icon-upload" @click="uploadDialog=true">上传附件</el-button>
      <el-button v-if="!batchOperation" size="small" icon="el-icon-s-release" @click="batchOperation=!batchOperation">
        批量操作
      </el-button>
      <span v-else>
        <el-popconfirm
          placement="top-start"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon="el-icon-info"
          icon-color="red"
          :title="`您要永久删除这些附件吗？`"
          style="margin: 0 10px"
          @confirm="deleteAttachments"
        >
          <el-button slot="reference" type="danger" size="small" icon="el-icon-delete">删 除</el-button>
        </el-popconfirm>
        <el-button size="small" icon="el-icon-close" @click="cancelBatchDelete">取 消</el-button>
      </span>
    </div>
    <div>
      <v-empty-data v-if="attachmentList.length===0" style="width: 100px" />
      <el-checkbox-group v-model="deleteIds">
        <el-row v-loading="listLoading" :gutter="20">
          <el-col v-for="(attachment,index) in attachmentList" :key="attachment.id" :xs="6" :sm="4">
            <div class="attachment-item" @click="batchOperation?batchDeleteChecked(index):openDetailDrawer(index)">
              <el-checkbox v-if="batchOperation" :label="attachment.id" class="check-box" />
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
      </el-checkbox-group>
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
    <!-- 附件详情Drawer -->
    <el-drawer :visible.sync="detailDrawer" direction="rtl" destroy-on-close title="附件详情">
      <v-detail-drawer ref="detailDrawer" style="padding: 0 20px 70px 20px" />
      <div class="footer-toolbar" style="width: 30%">
        <el-popconfirm
          placement="top-start"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon="el-icon-info"
          icon-color="red"
          :title="`您要永久删除附件【${currentName}】吗？`"
          @confirm="deleteAttachment"
        >
          <el-button slot="reference" type="danger" size="medium">删 除</el-button>
        </el-popconfirm>
      </div>
    </el-drawer>
    <!-- 附件上传dialog -->
    <el-dialog title="上传附件" :visible.sync="uploadDialog" destroy-on-close width="30vw" @close="getAttachmentList">
      <v-upload />
    </el-dialog>
  </div>
</template>

<script>
import { listAttachments, listAllMediaTypes, deleteAttachment, deleteAttachments } from '@/api/attachment'

export default {
  name: 'Attachment',
  components: {
    'v-image': () => import('@/components/Common/simple-image'),
    'v-empty-data': () => import('@/components/Common/empty-data'),
    'v-detail-drawer': () => import('@/views/attachment/detail'),
    'v-upload': () => import('@/views/attachment/upload')
  },
  data() {
    return {
      searchParams: {
        current: 1,
        pageSize: 18,
        name: '',
        mediaType: null
      },
      total: 0,
      mediaTypeList: [],
      attachmentList: [],
      deleteIds: [],
      listLoading: false,
      detailDrawer: false,
      uploadDialog: false,
      batchOperation: false,
      currentIndex: 0
    }
  },
  computed: {
    currentName() {
      if (this.attachmentList[this.currentIndex]) {
        return this.attachmentList[this.currentIndex].name
      }
      return ''
    }
  },
  created() {
    this.getMediaTypeList()
    this.getAttachmentList()
  },
  methods: {
    resetSearchParams(formName) {
      this.$refs[formName].resetFields()
      this.searchParams.current = 1
      this.getAttachmentList()
    },
    openDetailDrawer(index) {
      this.currentIndex = index
      this.detailDrawer = true
      const data = this.attachmentList[index]
      const _this = this
      setTimeout(function() {
        _this.$refs.detailDrawer.setData(data)
      }, 200)
    },
    // 选择删除的附件
    batchDeleteChecked(index) {
      const id = this.attachmentList[index].id
      const itemIdx = this.deleteIds.indexOf(id)
      if (itemIdx < 0) {
        this.deleteIds.push(id)
      } else {
        this.deleteIds.splice(itemIdx, 1)
      }
    },
    // 取消批量操作
    cancelBatchDelete() {
      this.batchOperation = !this.batchOperation
      this.deleteIds = []
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
    },
    // 获取所有文件类型
    getMediaTypeList() {
      listAllMediaTypes(this.searchParams).then(resp => {
        if (resp.status === 200) {
          this.mediaTypeList = resp.data
        }
      })
    },
    // 删除单个附件
    deleteAttachment() {
      const id = this.attachmentList[this.currentIndex].id
      deleteAttachment(id).then(resp => {
        if (resp.status === 200) {
          this.detailDrawer = false
          this.$message.success(resp.message)
          this.getAttachmentList()
        }
      })
    },
    // 批量删除附件
    deleteAttachments() {
      if (this.deleteIds.length < 1) {
        this.$message.info('您未选择附件')
        return
      }
      deleteAttachments(this.deleteIds).then(resp => {
        if (resp.status === 200) {
          this.batchOperation = false
          this.$message.success(resp.message)
          this.getAttachmentList()
        }
      })
    }
  }
}
</script>

<style lang="scss">
.search-box {
  .el-form-item {
    margin-right: 40px;
  }
}

.el-col {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-dialog__body {
  padding: 10px 20px 20px;
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

  .check-box {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
</style>
