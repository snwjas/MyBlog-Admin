<template>
  <el-drawer
    :visible.sync="drawerVisible"
    direction="rtl"
    title="操作日志"
  >
    <v-log-list :log-list="logList" style="padding: 0 20px" />
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size.sync="searchParams.pageSize"
        :pager-count="5"
        :current-page.sync="searchParams.current"
        @current-change="getLogList"
        @size-change="getLogList"
      />
    </div>
    <div class="footer-toolbar" style="width: 30%">
      <el-popconfirm
        placement="top-start"
        confirm-button-text="确定"
        cancel-button-text="取消"
        icon="el-icon-info"
        icon-color="red"
        :title="`您要永久删除本页操作日志吗？`"
        @confirm="deleteLogs"
      >
        <el-button slot="reference" type="danger" size="small">清空本页</el-button>
      </el-popconfirm>
    </div>
  </el-drawer>
</template>

<script>
import { listLogs, deleteCommentsBatch } from '@/api/log'

export default {
  name: 'MoreLog',
  components: {
    'v-log-list': () => import('@/views/log/log-list')
  },
  data() {
    return {
      drawerVisible: false,
      logList: [],
      total: 0,
      searchParams: {
        current: 1,
        pageSize: 10
      }
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    openDrawer() {
      this.drawerVisible = true
    },
    getLogList() {
      listLogs(this.searchParams).then(resp => {
        this.logList = resp.data.list
        this.total = resp.data.total
      })
    },
    deleteLogs() {
      const logIds = []
      for (const log of this.logList) {
        logIds.push(log.id)
      }
      deleteCommentsBatch(logIds).then(resp => {
        this.getLogList()
        this.$emit('delSucceed')
        this.$message.success(resp.message)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.pagination {
  text-align: center;
  margin: 10px 0 80px 0;
}
</style>
