import request from './request'

/**
 * 在线考场与专项练习服务接口
 */
export function getSpecialPracticeContent() {
  return request({
    url: '/practice/practice/set/getSpecialPracticeContent',
    method: 'POST',
    data: {}
  })
}

export function getPreSetContent(pageInfo = { pageNo: 1, pageSize: 10 }, orderType = null, setName = '') {
  return request({
    url: '/practice/practice/set/getPreSetContent',
    method: 'POST',
    data: { pageInfo, orderType, setName }
  })
}

export function getUnCompletePractice(pageInfo = { pageNo: 1, pageSize: 10 }) {
  return request({
    url: '/practice/practice/set/getUnCompletePractice',
    method: 'POST',
    data: { pageInfo }
  })
}

export function addPractice(assembleIds) {
  return request({
    url: '/practice/practice/set/addPractice',
    method: 'POST',
    data: { assembleIds }
  })
}

export function getSubjects(setId) {
  return request({
    url: '/practice/practice/set/getSubjects',
    method: 'POST',
    data: { setId }
  })
}

export function getPracticeSubject(subjectId, subjectType = 1) {
  return request({
    url: '/practice/practice/set/getPracticeSubject',
    method: 'POST',
    data: { subjectId, subjectType }
  })
}

export function submitSubject(data) {
  return request({
    url: '/practice/practice/detail/submitSubject',
    method: 'POST',
    data
  })
}

export function submitPractice(data) {
  return request({
    url: '/practice/practice/detail/submit',
    method: 'POST',
    data
  })
}

export function getScoreDetail(practiceId) {
  return request({
    url: '/practice/practice/detail/getScoreDetail',
    method: 'POST',
    data: { practiceId }
  })
}

export function getSubjectDetail(subjectId, subjectType = 1) {
  return request({
    url: '/practice/practice/detail/getSubjectDetail',
    method: 'POST',
    data: { subjectId, subjectType }
  })
}

export function getReport(practiceId) {
  return request({
    url: '/practice/practice/detail/getReport',
    method: 'POST',
    data: { practiceId }
  })
}

export function getPracticeRankList() {
  return request({
    url: '/practice/practice/detail/getPracticeRankList',
    method: 'POST',
    data: {}
  })
}

export function giveUpPractice(practiceId) {
  return request({
    url: `/practice/practice/detail/giveUp?practiceId=${practiceId}`,
    method: 'POST'
  })
}
