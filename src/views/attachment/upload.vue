<template>
  <div>
    <el-upload
      ref="upload"
      drag
      :action="uploadUrl"
      multiple
      with-credentials
      :on-success="uploadSucceed"
      :before-upload="beforeUpload"
      :auto-upload="true"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">可上传任何类型文件，但单个文件大小不能超过10MB</div>
    </el-upload>
  </div>
</template>

<script>
import { uploadUrl } from '@/api/attachment'

export default {
  name: 'Upload',
  data() {
    this.uploadUrl = uploadUrl
    return {}
  },
  methods: {
    uploadSucceed(response, file, fileList) {
      if (response.status === 200) {
        this.$message.success(response.message)
      } else {
        this.$message.error(response.message)
      }
      this.removeFile(file, fileList)
    },
    beforeUpload(file) {
      const isLt10MB = file.size / 1024 / 1024 < 10
      if (!isLt10MB) {
        this.$message.warning('上传的文件大小请不要超过10MB')
        this.removeFile(file, this.$refs.upload.uploadFiles)
        return false
      }
    },
    removeFile(file, fileList) {
      fileList.splice(fileList.indexOf(file), 1)
    }
  }
}
</script>

<style lang="scss">
.el-upload, .el-upload-dragger {
  width: 100%;
}
</style>
