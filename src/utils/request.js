import axios from 'axios'
import { Message } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    // if (store.getters.token) {
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    // config.headers['X-Token'] = getToken()
    // }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    if (res.status !== 200) {
      if (res.status === 3001) { // 用户未登录
        window.location.reload()
        return
      }
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 3.6 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 3.6 * 1000
    })
    return Promise.reject(error)
  }
)

// jsonp 封装
service.jsonp = (url = '', data = {}) => {
  return new Promise((resolve, reject) => {
    // 初始化url
    const dataString = url.indexOf('?') === -1 ? '?' : '&'
    const callbackName = `jsonpCB_${Date.now()}`
    url += `${dataString}callback=${callbackName}`
    if (data) {
      // 有请求参数，依次添加到url
      for (const k in data) {
        url += `&${k}=${data[k]}`
      }
    }
    const jsNode = document.createElement('script')
    jsNode.src = url
    // 触发callback，触发后删除js标签和绑定在window上的callback
    window[callbackName] = result => {
      delete window[callbackName]
      document.body.removeChild(jsNode)
      if (result) {
        resolve(result)
      } else {
        reject('没有返回数据')
      }
    }
    // js加载异常的情况
    jsNode.addEventListener('error', () => {
      delete window[callbackName]
      document.body.removeChild(jsNode)
      reject('JavaScript资源加载失败')
    }, false)
    // 添加js节点到document上时，开始请求
    document.body.appendChild(jsNode)
  })
}

export default service
