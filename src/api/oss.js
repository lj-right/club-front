import request from './request'

/**
 * 对象存储 OSS / MinIO 上传接口
 */
export function uploadFile(file, bucket = 'user', objectName = 'avatar') {
  const formData = new FormData()
  formData.append('uploadFile', file)
  formData.append('bucket', bucket)
  formData.append('objectName', objectName)
  return request({
    url: '/oss/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getFileUrl(bucketName, objectName) {
  return request({
    url: `/oss/getUrl?bucketName=${bucketName}&objectName=${objectName}`,
    method: 'GET'
  })
}
