import request from '@/utils/request'

const api_prefix = '/api/admin/statistic'

// 获取统计信息
export function getCommonStatistics() {
  return request({
    url: `${api_prefix}`,
    method: 'get'
  })
}

// 获取统计信息
export function getDailyStatistics(days) {
  return request({
    url: `${api_prefix}/${days}`,
    method: 'get'
  })
}
