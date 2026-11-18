import request from './request'

/**
 * 圈子与互动社区服务接口
 */
export function getCircleList() {
  return request({
    url: '/circle/circle/share/circle/list',
    method: 'GET'
  })
}

export function getMoments(circleId, pageNo = 1, pageSize = 20) {
  const data = {
    pageInfo: {
      pageNo,
      pageSize
    }
  }
  if (circleId && circleId !== 'all') {
    data.circleId = circleId
  }
  return request({
    url: '/circle/circle/share/moment/getMoments',
    method: 'POST',
    data
  })
}

export function saveMoment(data) {
  return request({
    url: '/circle/circle/share/moment/save',
    method: 'POST',
    data
  })
}

export function removeMoment(id) {
  return request({
    url: '/circle/circle/share/moment/remove',
    method: 'POST',
    data: { id }
  })
}

export function getCommentList(momentId) {
  return request({
    url: '/circle/circle/share/comment/list',
    method: 'POST',
    data: {
      id: momentId
    }
  })
}

export function saveComment(data) {
  return request({
    url: '/circle/circle/share/comment/save',
    method: 'POST',
    data
  })
}

export function removeComment(id, replyType = 1) {
  return request({
    url: '/circle/circle/share/comment/remove',
    method: 'POST',
    data: { id, replyType }
  })
}

export function getMessages(pageNo = 1, pageSize = 10, isRead = null) {
  return request({
    url: '/circle/circle/share/message/getMessages',
    method: 'POST',
    data: {
      pageInfo: { pageNo, pageSize },
      isRead
    }
  })
}

export function hasUnreadMessages() {
  return request({
    url: '/circle/circle/share/message/unRead',
    method: 'GET'
  })
}
