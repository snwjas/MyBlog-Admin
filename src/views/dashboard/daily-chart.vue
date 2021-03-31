<template>
  <ve-line :data="chartData" :settings="chartSettings" :extend="extend" />
</template>

<script>
import { getDailyStatistics } from '@/api/statistics'

export default {
  name: 'StatisticChart',
  props: {
    days: {
      type: Number,
      default: 30
    }
  },
  data() {
    this.chartSettings = {
      labelMap: {
        webVisitCount: '网站访问量',
        blogVisitCount: '博客访问量',
        commentCount: '博客评论量'
      },
      area: true
    }
    this.extend = {
      legend: {
        left: '12'
      },
      grid: {
        bottom: '10'
      }
    }
    return {
      chartData: {
        columns: ['date', 'webVisitCount', 'blogVisitCount', 'commentCount'],
        rows: []
      }
    }
  },
  created() {
    this.getDailyStatistics()
  },
  methods: {
    getDailyStatistics() {
      getDailyStatistics(this.days).then(response => {
        if (response.status === 200) {
          this.chartData.rows = response.data
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
