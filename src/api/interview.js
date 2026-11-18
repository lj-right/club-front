import request from './request'

/**
 * AI 简历分析与模拟面试服务接口
 */
export function analyseResume(url, engine = 'JI_CHI') {
  return request({
    url: '/interview/interview/analyse',
    method: 'POST',
    data: { url, engine }
  })
}

export function startInterview(questionList, engine = 'JI_CHI') {
  return request({
    url: '/interview/interview/start',
    method: 'POST',
    data: { engine, questionList }
  })
}

export function submitInterview(data) {
  return request({
    url: '/interview/interview/submit',
    method: 'POST',
    data
  })
}

export function getInterviewHistory(pageNo = 1, pageSize = 10) {
  return request({
    url: '/interview/interview/getHistory',
    method: 'POST',
    data: {
      pageInfo: { pageNo, pageSize }
    }
  })
}

export function getInterviewDetail(id) {
  return request({
    url: `/interview/interview/detail?id=${id}`,
    method: 'GET'
  })
}
