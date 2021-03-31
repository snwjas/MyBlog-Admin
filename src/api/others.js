import request from '@/utils/request'

// 获得ip定位信息
export function getIpLocation(ip) {
  const url = `http://ip-api.com/json/${ip}`
  return request.jsonp(url, { lang: 'zh-CN' })
}

