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

export function getPracticeHistory(params = {}) {
  let pageInfo = { pageNo: 1, pageSize: 20 }
  if (params && params.pageInfo) {
    pageInfo = params.pageInfo
  } else if (params && (params.pageNo || params.pageSize)) {
    pageInfo = params
  }
  return request({
    url: '/practice/practice/set/getPracticeHistory',
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

export function getSubjects(setId, practiceId = null) {
  const data = typeof setId === 'object' && setId !== null ? setId : { setId, practiceId }
  return request({
    url: '/practice/practice/set/getSubjects',
    method: 'POST',
    data
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

export function getSubjectDetail(practiceId, subjectId, subjectType = 1) {
  let payload = {}
  if (typeof practiceId === 'object' && practiceId !== null) {
    payload = practiceId
  } else {
    payload = { practiceId, subjectId, subjectType }
  }
  return request({
    url: '/practice/practice/detail/getSubjectDetail',
    method: 'POST',
    data: payload
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

export function deletePractice(practiceId) {
  return request({
    url: `/practice/practice/detail/giveUp?practiceId=${practiceId}`,
    method: 'POST'
  })
}
