import request from './request'

/**
 * 题库与分类服务接口
 */
export function queryPrimaryCategory(categoryType = 1) {
  return request({
    url: '/subject/subject/category/queryPrimaryCategory',
    method: 'POST',
    data: { categoryType }
  })
}

export function queryCategoryByPrimary(parentId, categoryType = 2) {
  return request({
    url: '/subject/subject/category/queryCategoryByPrimary',
    method: 'POST',
    data: { parentId, categoryType }
  })
}

export function queryLabelByCategoryId(categoryId) {
  return request({
    url: '/subject/subject/label/queryLabelByCategoryId',
    method: 'POST',
    data: { categoryId }
  })
}

export function queryCategoryAndLabel(id) {
  return request({
    url: '/subject/subject/category/queryCategoryAndLabel',
    method: 'POST',
    data: { id }
  })
}

export function getSubjectPage(data) {
  return request({
    url: '/subject/subject/getSubjectPage',
    method: 'POST',
    data
  })
}

export function querySubjectInfo(id) {
  return request({
    url: '/subject/subject/querySubjectInfo',
    method: 'POST',
    data: { id }
  })
}

export function getSubjectPageBySearch(data) {
  return request({
    url: '/subject/subject/getSubjectPageBySearch',
    method: 'POST',
    data
  })
}

export function subjectLiked(subjectId, status = 1) {
  return request({
    url: `/subject/subjectLiked/add?subjectId=${subjectId}&status=${status}`,
    method: 'GET'
  })
}

export function getContributeList() {
  return request({
    url: '/subject/subject/getContributeList',
    method: 'POST'
  })
}
