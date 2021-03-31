<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 添加/编辑友链 -->
      <el-col :xs="24" :sm="10">
        <el-card>
          <div slot="header">{{ isAdd ? '添加' : '修改' }}友链</div>
          <el-form label-position="top" :model="addOrUpdateData" size="small">
            <el-form-item label="友链名称：" prop="name">
              <el-input v-model="addOrUpdateData.name" />
            </el-form-item>
            <el-form-item label="友链链接：" prop="url">
              <el-input v-model="addOrUpdateData.url" placeholder="请附带http[s]://前缀" @blur.native.capture="checkUrl" />
            </el-form-item>
            <el-form-item label="Logo链接：" prop="logo">
              <el-input v-model="addOrUpdateData.logo" />
            </el-form-item>
            <el-form-item label="友链排名：" prop="topRank">
              <el-input-number v-model="addOrUpdateData.topRank" controls-position="right" style="width: 100%" />
              <p class="input-tips">* 值越大越靠前</p>
            </el-form-item>
            <el-form-item label="描述：" prop="description">
              <el-input v-model="addOrUpdateData.description" :rows="3" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="isAdd?addLink():updateLink()">
                  {{ isAdd ? '保 存' : '更 新' }}
                </el-button>
                <el-button v-if="!isAdd" @click="resetForm">返回添加</el-button>
              </el-button-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <!-- 友链列表 -->
      <el-col :xs="24" :sm="14">
        <el-card>
          <div slot="header">友链列表</div>
          <el-table
            ref="blogListTable"
            v-loading="tableDataLoading"
            :data="linkList"
            tooltip-effect="dark"
            :header-cell-style="{fontWeight:'normal', color:'#666'}"
          >
            <el-table-column prop="name" label="名称" width="180" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-link target="_blank" type="primary" :href="scope.row.url" :underline="false">
                  {{ scope.row.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="topRank" label="排名" width="100" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="primary" size="mini" @click="tryUpdate(scope.$index)">编辑</el-button>
                  <el-popconfirm
                    placement="top-start"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    icon="el-icon-info"
                    icon-color="red"
                    :title="`您要永久删除友链【${scope.row.name}】吗？`"
                    @confirm="deleteLink(scope.$index)"
                  >
                    <el-button slot="reference" type="danger" size="mini">删除</el-button>
                  </el-popconfirm>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          <div class="clearfix">
            <div class="pagination ">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :page-size.sync="searchParams.pageSize"
                :current-page.sync="searchParams.current"
                @current-change="getLinkList"
                @size-change="getLinkList"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listLinks, addLink, deleteLink, updateLink } from '@/api/link'

export default {
  name: 'Link',
  data() {
    return {
      searchParams: {
        current: 1,
        pageSize: 10
      },
      total: 0,
      linkList: [],
      tableDataLoading: false,
      isAdd: true,
      addOrUpdateData: {
        name: '',
        url: '',
        logo: '',
        topRank: 0,
        description: ''
      }
    }
  },
  created() {
    this.getLinkList()
  },
  methods: {
    resetForm() {
      this.isAdd = true
      this.addOrUpdateData = {
        name: '',
        url: '',
        logo: '',
        topRank: 0,
        description: ''
      }
    },
    operationSuccess(msg) {
      this.$message.success(msg)
      this.getLinkList()
      this.resetForm()
    },
    tryUpdate(index) {
      this.isAdd = false
      this.addOrUpdateData = JSON.parse(JSON.stringify(this.linkList[index]))
    },
    checkUrl() {
      const url = this.addOrUpdateData.url || ''
      if (!new RegExp('^https?://').test(url)) {
        this.addOrUpdateData.url = 'http://' + url
      }
    },
    // 获取友链列表信息
    getLinkList() {
      this.tableDataLoading = true
      listLinks(this.searchParams).then(resp => {
        if (resp.status === 200) {
          this.total = resp.data.total
          this.linkList = resp.data.list
        }
        this.tableDataLoading = false
      })
    },
    // 删除友链
    deleteLink(index) {
      const id = this.linkList[index].id
      deleteLink(id).then(resp => {
        if (resp.status === 200) {
          this.operationSuccess(resp.message)
        }
      })
    },
    addLink() {
      addLink(this.addOrUpdateData).then(resp => {
        if (resp.status === 200) {
          this.operationSuccess(resp.message)
        }
      })
    },
    updateLink() {
      updateLink(this.addOrUpdateData).then(resp => {
        if (resp.status === 200) {
          this.operationSuccess(resp.message)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.el-card {
  &__header, &__body {
    padding: 12px 12px;
  }
}
</style>

<style scoped lang="scss">
.pagination {
  float: right;
  margin: 16px 0;
}
</style>
