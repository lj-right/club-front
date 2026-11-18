import request from './request'

/**
 * 管理员鉴权与登录
 */
export function adminDoLogin(validCode = '888888') {
  return request({
    url: `/auth/user/doLogin?validCode=${validCode}`,
    method: 'GET'
  })
}

export function adminLogOut(userName = 'admin') {
  return request({
    url: `/auth/user/logOut?userName=${userName}`,
    method: 'POST'
  })
}

export function getAdminUserInfo(userName = 'admin') {
  return request({
    url: '/auth/user/getUserInfo',
    method: 'POST',
    data: { userName }
  })
}

export function listUsersByIds(userNameList = ['admin', 'suifeng', 'test_user', 'vip_coder']) {
  return request({
    url: '/auth/user/listByIds',
    method: 'POST',
    data: userNameList
  })
}

export function changeUserStatus(data) {
  return request({
    url: '/auth/user/changeStatus',
    method: 'POST',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/auth/user/delete',
    method: 'POST',
    data
  })
}

/**
 * 题目管理接口
 */
export function getSubjectPage(data) {
  return request({
    url: '/subject/getSubjectPage',
    method: 'POST',
    data
  })
}

export function getSubjectPageBySearch(data) {
  return request({
    url: '/subject/getSubjectPageBySearch',
    method: 'POST',
    data
  })
}

export function querySubjectInfo(id) {
  return request({
    url: '/subject/querySubjectInfo',
    method: 'POST',
    data: { id }
  })
}

export function addSubject(data) {
  return request({
    url: '/subject/add',
    method: 'POST',
    data
  })
}

/**
 * 分类管理接口
 */
export function queryPrimaryCategory(categoryType = 1) {
  return request({
    url: '/subject/category/queryPrimaryCategory',
    method: 'POST',
    data: { categoryType }
  })
}

export function queryCategoryByPrimary(parentId, categoryType = 2) {
  return request({
    url: '/subject/category/queryCategoryByPrimary',
    method: 'POST',
    data: { parentId, categoryType }
  })
}

export function queryCategoryAndLabel(id) {
  return request({
    url: '/subject/category/queryCategoryAndLabel',
    method: 'POST',
    data: { id }
  })
}

export function addCategory(data) {
  return request({
    url: '/subject/category/add',
    method: 'POST',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/subject/category/update',
    method: 'POST',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: '/subject/category/delete',
    method: 'POST',
    data: { id }
  })
}

/**
 * 标签管理接口
 */
export function queryLabelByCategoryId(categoryId) {
  return request({
    url: '/subject/label/queryLabelByCategoryId',
    method: 'POST',
    data: { categoryId }
  })
}

export function addLabel(data) {
  return request({
    url: '/subject/label/add',
    method: 'POST',
    data
  })
}

export function updateLabel(data) {
  return request({
    url: '/subject/label/update',
    method: 'POST',
    data
  })
}

export function deleteLabel(id) {
  return request({
    url: '/subject/label/delete',
    method: 'POST',
    data: { id }
  })
}

/**
 * 角色与权限管理接口
 */
export function addRole(data) {
  return request({
    url: '/auth/role/add',
    method: 'POST',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/auth/role/update',
    method: 'POST',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/auth/role/delete',
    method: 'POST',
    data
  })
}

export function addRolePermission(data) {
  return request({
    url: '/auth/rolePermission/add',
    method: 'POST',
    data
  })
}

export function getUserPermission(userName) {
  return request({
    url: `/auth/permission/getPermission?userName=${userName}`,
    method: 'GET'
  })
}

/**
 * 敏感词管理接口 (圈子风控)
 */
export function saveSensitiveWord(words, type = 1) {
  return request({
    url: `/circle/sensitive/words/save?words=${encodeURIComponent(words)}&type=${type}`,
    method: 'GET'
  })
}

export function removeSensitiveWord(id) {
  return request({
    url: `/circle/sensitive/words/remove?id=${id}`,
    method: 'GET'
  })
}
