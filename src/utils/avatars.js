/**
 * 用户头像工具库
 */
import defaultAvatarImg from '@/assets/default_avatar.jpg'

export { defaultAvatarImg }
export const DEFAULT_AVATAR = defaultAvatarImg

const USER_NAME_AVATAR_MAP = {
  '超级管理员': 'http://127.0.0.1:9005/user/avatar/admin.png',
  'admin': 'http://127.0.0.1:9005/user/avatar/admin.png',
  '随风': 'http://127.0.0.1:9005/user/avatar/suifeng.png',
  'suifeng': 'http://127.0.0.1:9005/user/avatar/suifeng.png',
  '随风大架构师': 'http://127.0.0.1:9005/user/avatar/suifeng.png',
  '测试小伙伴': 'http://127.0.0.1:9005/user/avatar/test.png',
  'test_user': 'http://127.0.0.1:9005/user/avatar/test.png',
  '黄金VIP学员': 'http://127.0.0.1:9005/user/avatar/vip.png',
  'vip_coder': 'http://127.0.0.1:9005/user/avatar/vip.png'
}

export function getUserAvatar(userName) {
  if (!userName) return defaultAvatarImg
  if (USER_NAME_AVATAR_MAP[userName]) {
    return USER_NAME_AVATAR_MAP[userName]
  }
  return defaultAvatarImg
}
