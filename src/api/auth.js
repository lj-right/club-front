import request from './request'

/**
 * 用户与鉴权服务接口
 */
export function doLogin(validCode) {
  return request({
    url: `/auth/user/doLogin?validCode=${encodeURIComponent(validCode)}`,
    method: 'POST'
  })
}

export function getUserInfo(userName) {
  return request({
    url: '/auth/user/getUserInfo',
    method: 'POST',
    data: { userName }
  })
}

export function updateUserInfo(data) {
  return request({
    url: '/auth/user/update',
    method: 'POST',
    data
  })
}

export function logOut(userName) {
  return request({
    url: `/auth/user/logOut?userName=${encodeURIComponent(userName)}`,
    method: 'POST'
  })
}

export function isLogin() {
  return request({
    url: '/auth/user/isLogin',
    method: 'GET'
  })
}

export function getOAuthRenderUrl(platform) {
  return request({
    url: `/auth/oauth/render/${encodeURIComponent(platform)}`,
    method: 'GET'
  })
}

export function doOAuthLogin(data) {
  return request({
    url: '/auth/oauth/login',
    method: 'POST',
    data
  })
}

