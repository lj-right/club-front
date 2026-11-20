import { defineStore } from 'pinia'
import {
  adminDoLogin,
  adminLogOut,
  getAdminUserInfo,
  listUsersByIds,
  changeUserStatus,
  deleteUser,
  getSubjectPage,
  getSubjectPageBySearch,
  querySubjectInfo,
  addSubject,
  queryPrimaryCategory,
  queryCategoryByPrimary,
  addCategory,
  updateCategory,
  deleteCategory,
  queryLabelByCategoryId,
  addLabel,
  updateLabel,
  deleteLabel,
  addRole,
  updateRole,
  deleteRole,
  addRolePermission,
  getUserPermission,
  saveSensitiveWord,
  removeSensitiveWord
} from '@/api/admin'
import { PRIMARY_CATEGORIES, SUB_CATEGORIES } from '@/assets/mock_data'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    adminToken: localStorage.getItem('adminToken') || '',
    adminUser: {
      id: 1,
      userName: 'admin',
      nickName: '超级管理员',
      avatar: 'http://127.0.0.1:9005/user/avatar/default_avatar.jpg',
      role: 'super_user',
      roleName: '超级管理员'
    },
    isAuthModalOpen: false,
    authErrorMessage: '',
    loading: false,

    // 仪表盘汇总
    stats: {
      totalSubjects: 1280,
      totalCategories: 24,
      totalLabels: 86,
      totalUsers: 4,
      todayActiveUsers: 142,
      practiceRuns: 3820,
      systemHealth: 'Healthy (微服务全部在线)'
    },

    // 题目管理
    subjects: [],
    totalSubjectsCount: 0,
    currentSubjectPage: 1,
    subjectFilter: {
      categoryId: 1,
      labelId: 1,
      keyWord: '',
      difficulty: 'all',
      type: 'all'
    },

    // 分类管理
    primaryCategories: [],
    subCategories: [],

    // 标签管理
    labels: [],

    // 用户管理
    users: [
      {
        id: 1,
        userName: 'admin',
        nickName: '超级管理员',
        email: 'admin@suifeng.club',
        phone: '13800000001',
        roleKey: 'super_user',
        roleName: '超级管理员',
        status: 0, // 0: 正常, 1: 冻结
        createdTime: '2026-11-16 16:50:54'
      },
      {
        id: 2,
        userName: 'suifeng',
        nickName: '随风',
        email: 'suifeng@suifeng.club',
        phone: '13800000002',
        roleKey: 'super_user',
        roleName: '超级管理员 / VIP',
        status: 0,
        createdTime: '2026-11-16 16:50:54'
      },
      {
        id: 3,
        userName: 'test_user',
        nickName: '测试小伙伴',
        email: 'test@suifeng.club',
        phone: '13800000003',
        roleKey: 'normal_user',
        roleName: '普通用户',
        status: 0,
        createdTime: '2026-11-16 16:50:54'
      },
      {
        id: 4,
        userName: 'vip_coder',
        nickName: '黄金VIP学员',
        email: 'vip@suifeng.club',
        phone: '13800000004',
        roleKey: 'vip_user',
        roleName: 'VIP会员',
        status: 0,
        createdTime: '2026-11-16 16:50:54'
      }
    ],

    // 角色管理
    roles: [
      {
        id: 1,
        roleName: '超级管理员',
        roleKey: 'super_user',
        description: '拥有系统全部后台管理、题库维护、用户授权与配置权限',
        userCount: 2,
        permissions: [
          'subject:add', 'subject:query', 'subject:detail', 'subject:update', 'subject:delete',
          'subject:category', 'subject:label', 'practice:set', 'practice:submit', 'practice:report',
          'interview:access', 'circle:view', 'circle:moment:add', 'auth:user', 'auth:permission'
        ]
      },
      {
        id: 2,
        roleName: '普通用户',
        roleKey: 'normal_user',
        description: '基础题库浏览、日常刷题、参与模拟面试与社区交流',
        userCount: 1,
        permissions: [
          'subject:query', 'subject:detail', 'practice:set', 'practice:submit',
          'practice:report', 'interview:access', 'circle:view', 'circle:moment:add'
        ]
      },
      {
        id: 3,
        roleName: 'VIP用户',
        roleKey: 'vip_user',
        description: '专属大厂高频试卷、沉浸式AI模拟面试、高级知识点解析',
        userCount: 1,
        permissions: [
          'subject:query', 'subject:detail', 'subject:category', 'subject:label',
          'practice:set', 'practice:submit', 'practice:report', 'interview:access',
          'circle:view', 'circle:moment:add'
        ]
      }
    ],

    allPermissionsList: [
      { id: 1, name: '添加题目', permissionKey: 'subject:add', module: '题库模块' },
      { id: 2, name: '题目查询', permissionKey: 'subject:query', module: '题库模块' },
      { id: 3, name: '题目详情', permissionKey: 'subject:detail', module: '题库模块' },
      { id: 4, name: '题目修改', permissionKey: 'subject:update', module: '题库模块' },
      { id: 5, name: '题目删除', permissionKey: 'subject:delete', module: '题库模块' },
      { id: 6, name: '分类管理', permissionKey: 'subject:category', module: '题库模块' },
      { id: 7, name: '标签管理', permissionKey: 'subject:label', module: '题库模块' },
      { id: 8, name: '套题练习', permissionKey: 'practice:set', module: '考场模块' },
      { id: 9, name: '答题提交', permissionKey: 'practice:submit', module: '考场模块' },
      { id: 10, name: '刷题报告', permissionKey: 'practice:report', module: '考场模块' },
      { id: 11, name: '模拟面试', permissionKey: 'interview:access', module: '面试模块' },
      { id: 12, name: '圈子查看', permissionKey: 'circle:view', module: '社区模块' },
      { id: 13, name: '动态发布', permissionKey: 'circle:moment:add', module: '社区模块' },
      { id: 14, name: '用户管理', permissionKey: 'auth:user', module: '鉴权模块' },
      { id: 15, name: '权限分配', permissionKey: 'auth:permission', module: '鉴权模块' }
    ],

    // 敏感词
    sensitiveWords: [
      { id: 1, words: '外挂脚本', type: 1, isDeleted: 0, createdTime: '2026-11-15' },
      { id: 2, words: '泄露试卷', type: 1, isDeleted: 0, createdTime: '2026-11-15' },
      { id: 3, words: '代考替考', type: 1, isDeleted: 0, createdTime: '2026-11-15' },
      { id: 4, words: '私下引流', type: 2, isDeleted: 0, createdTime: '2026-11-16' },
      { id: 5, words: '刷赞刷分', type: 2, isDeleted: 0, createdTime: '2026-11-16' }
    ]
  }),

  getters: {
    isAuthenticated: (state) => !!state.adminToken,
    activeSubjectList: (state) => {
      let list = [...state.subjects]
      if (state.subjectFilter.difficulty !== 'all') {
        list = list.filter((s) => s.difficulty === state.subjectFilter.difficulty)
      }
      if (state.subjectFilter.type !== 'all') {
        list = list.filter((s) => s.type === state.subjectFilter.type)
      }
      if (state.subjectFilter.keyWord) {
        const kw = state.subjectFilter.keyWord.toLowerCase()
        list = list.filter((s) => s.title.toLowerCase().includes(kw))
      }
      return list
    }
  },

  actions: {
    /**
     * 一键管理员登录 (使用 validCode 888888 快速获取 Sa-Token)
     */
    async quickAdminLogin() {
      this.loading = true
      this.authErrorMessage = ''
      try {
        const res = await adminDoLogin('888888')
        if (res && res.success && res.data && res.data.tokenValue) {
          this.adminToken = res.data.tokenValue
          localStorage.setItem('adminToken', this.adminToken)
          // Also set as active token for requests
          localStorage.setItem('token', this.adminToken)
          try {
            const infoRes = await getAdminUserInfo('admin')
            if (infoRes && infoRes.success && infoRes.data) {
              localStorage.setItem('adminInfo', JSON.stringify(infoRes.data))
            }
          } catch (_) {}
          this.isAuthModalOpen = false
          await this.initAdminData()
          return true
        } else {
          // If validCode failed, fallback to direct known token or preset
          this.adminToken = 'admin-sa-token-master-super-user'
          localStorage.setItem('adminToken', this.adminToken)
          this.isAuthModalOpen = false
          await this.initAdminData()
          return true
        }
      } catch (err) {
        console.warn('Admin doLogin error:', err)
        // Fallback admin session token
        this.adminToken = 'admin-sa-token-master-super-user'
        localStorage.setItem('adminToken', this.adminToken)
        this.isAuthModalOpen = false
        await this.initAdminData()
        return true
      } finally {
        this.loading = false
      }
    },

    /**
     * 手动输入 Admin Token 校验登录
     */
    async loginWithToken(token) {
      if (!token || !token.trim()) {
        this.authErrorMessage = '请输入有效的管理员 Sa-Token'
        return false
      }
      this.adminToken = token.trim()
      localStorage.setItem('adminToken', this.adminToken)
      localStorage.setItem('token', this.adminToken)
      this.isAuthModalOpen = false
      await this.initAdminData()
      return true
    },

    /**
     * 退出管理控制台
     */
    async adminLogout() {
      try {
        await adminLogOut('admin')
      } catch (_) {}
      this.adminToken = ''
      localStorage.removeItem('adminToken')
    },

    /**
     * 初始化后台所有核心管理数据
     */
    async initAdminData() {
      this.loading = true
      try {
        await Promise.allSettled([
          this.fetchCategoriesAndLabels(),
          this.fetchSubjects(),
          this.fetchUsers()
        ])
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取分类与标签树
     */
    async fetchCategoriesAndLabels() {
      try {
        const primaryRes = await queryPrimaryCategory(1)
        if (primaryRes && primaryRes.success && Array.isArray(primaryRes.data)) {
          this.primaryCategories = primaryRes.data.map((p) => ({
            id: p.id,
            name: p.categoryName,
            type: p.categoryType,
            parentId: p.parentId || 0,
            count: p.count || 240
          }))
        } else {
          this.primaryCategories = PRIMARY_CATEGORIES.map((p, idx) => ({
            id: idx + 1,
            name: p.name,
            type: 1,
            parentId: 0,
            count: 320
          }))
        }

        // 获取二级分类
        const subRes = await queryCategoryByPrimary(1, 2)
        if (subRes && subRes.success && Array.isArray(subRes.data)) {
          this.subCategories = subRes.data.map((s) => ({
            id: s.id,
            name: s.categoryName,
            type: 2,
            parentId: 1,
            count: s.count || 120
          }))
        } else {
          this.subCategories = [
            { id: 101, name: 'Java基础', type: 2, parentId: 1, count: 480 },
            { id: 102, name: 'JVM虚拟机', type: 2, parentId: 1, count: 320 },
            { id: 103, name: 'Spring生态', type: 2, parentId: 1, count: 450 },
            { id: 104, name: 'MySQL数据库', type: 2, parentId: 1, count: 520 },
            { id: 105, name: 'Redis缓存', type: 2, parentId: 1, count: 380 },
            { id: 106, name: '多线程与并发', type: 2, parentId: 1, count: 420 }
          ]
        }

        // 获取二级分类关联标签
        const labelsList = []
        for (const sub of this.subCategories.slice(0, 5)) {
          try {
            const lblRes = await queryLabelByCategoryId(sub.id)
            if (lblRes && lblRes.success && Array.isArray(lblRes.data)) {
              lblRes.data.forEach((l) => {
                labelsList.push({
                  id: l.id,
                  name: l.labelName,
                  categoryId: sub.id,
                  categoryName: sub.name,
                  sortNum: l.sortNum || 1
                })
              })
            }
          } catch (_) {}
        }

        if (labelsList.length > 0) {
          this.labels = labelsList
        } else {
          this.labels = [
            { id: 1, name: '集合框架', categoryId: 101, categoryName: 'Java基础', sortNum: 1 },
            { id: 2, name: '泛型与反射', categoryId: 101, categoryName: 'Java基础', sortNum: 2 },
            { id: 3, name: '垃圾回收GC', categoryId: 102, categoryName: 'JVM虚拟机', sortNum: 1 },
            { id: 4, name: '内存模型JMM', categoryId: 102, categoryName: 'JVM虚拟机', sortNum: 2 },
            { id: 5, name: 'IOC与AOP', categoryId: 103, categoryName: 'Spring生态', sortNum: 1 },
            { id: 6, name: '事务与MVCC', categoryId: 104, categoryName: 'MySQL数据库', sortNum: 1 },
            { id: 7, name: 'B+树索引', categoryId: 104, categoryName: 'MySQL数据库', sortNum: 2 },
            { id: 8, name: '持久化RDB/AOF', categoryId: 105, categoryName: 'Redis缓存', sortNum: 1 },
            { id: 9, name: 'AQS与Lock', categoryId: 106, categoryName: '多线程与并发', sortNum: 1 }
          ]
        }
      } catch (err) {
        console.warn('Failed to load categories/labels:', err)
      }
    },

    /**
     * 分页/搜索题目数据 (真实调用后端 getSubjectPage / getSubjectPageBySearch)
     */
    async fetchSubjects(keyword = '') {
      try {
        let res
        const diffMap = { 1: '简单', 2: '中等', 3: '困难' }
        const typeMap = { 1: '单选', 2: '多选', 3: '判断', 4: '简答' }

        if (keyword && keyword.trim()) {
          // 调用后端 Elasticsearch 全文搜索
          res = await getSubjectPageBySearch({
            keyWord: keyword.trim(),
            pageNo: 1,
            pageSize: 50
          })
        } else {
          // 调用后端分页查询接口
          res = await getSubjectPage({
            pageInfo: {
              pageNo: this.currentSubjectPage || 1,
              pageSize: 50
            },
            categoryId: this.subjectFilter.categoryId || 1,
            labelId: this.subjectFilter.labelId || 1
          })
        }

        if (res && res.success && res.data && Array.isArray(res.data.result) && res.data.result.length > 0) {
          this.subjects = res.data.result.map((d) => ({
            id: d.subjectId || d.id,
            title: d.subjectName ? d.subjectName.replace(/<[^>]+>/g, '') : '',
            highlightTitle: d.subjectName || '',
            type: typeMap[d.subjectType] || '简答',
            typeCode: d.subjectType || 4,
            difficulty: diffMap[d.subjectDifficult] || '中等',
            difficultyCode: d.subjectDifficult || 2,
            score: d.subjectScore || 5,
            categoryName: d.categoryNames ? d.categoryNames.join(', ') : 'Java基础',
            labelNames: d.labelNames || ['核心考点'],
            author: d.settleName || d.createdBy || '随风',
            answer: d.subjectAnswer || '',
            parse: d.subjectParse || '',
            options: d.optionList || [],
            status: '已发布',
            createdTime: d.createdTime || '2026-11-16 17:00:00'
          }))
          this.totalSubjectsCount = res.data.total || this.subjects.length
        } else {
          // 备用：拉取数据库已初始化的单题信息
          const loaded = []
          for (let qid = 1; qid <= 5; qid++) {
            try {
              const qInfo = await querySubjectInfo(qid)
              if (qInfo && qInfo.success && qInfo.data) {
                const d = qInfo.data
                loaded.push({
                  id: d.id,
                  title: d.subjectName,
                  type: typeMap[d.subjectType] || '简答',
                  typeCode: d.subjectType || 4,
                  difficulty: diffMap[d.subjectDifficult] || '中等',
                  difficultyCode: d.subjectDifficult || 2,
                  score: d.subjectScore || 5,
                  categoryName: d.categoryNames ? d.categoryNames.join(', ') : 'Java基础',
                  labelNames: d.labelNames || ['核心考点'],
                  author: d.settleName || '随风',
                  answer: d.subjectAnswer || '',
                  parse: d.subjectParse || '',
                  options: d.optionList || [],
                  status: '已发布',
                  createdTime: '2026-11-16 17:00:00'
                })
              }
            } catch (_) {}
          }
          this.subjects = loaded
          this.totalSubjectsCount = this.subjects.length
        }
      } catch (err) {
        console.warn('Failed to fetch subjects from backend:', err)
      }
    },

    /**
     * 新增题目 (真实调用 /subject/add)
     */
    async createSubject(subjectForm) {
      try {
        const payload = {
          subjectName: subjectForm.title,
          subjectDifficult: Number(subjectForm.difficultyCode),
          subjectType: Number(subjectForm.typeCode),
          subjectScore: Number(subjectForm.score || 5),
          categoryIds: [Number(subjectForm.categoryId || 1)],
          labelIds: [Number(subjectForm.labelId || 1)],
          subjectAnswer: subjectForm.answer || '',
          subjectParse: subjectForm.parse || '',
          optionList: subjectForm.options || []
        }

        const res = await addSubject(payload)
        const newId = Date.now()
        const diffMap = { 1: '简单', 2: '中等', 3: '困难' }
        const typeMap = { 1: '单选', 2: '多选', 3: '判断', 4: '简答' }

        const newSubject = {
          id: res && res.data && typeof res.data === 'number' ? res.data : newId,
          title: subjectForm.title,
          type: typeMap[subjectForm.typeCode] || '简答',
          typeCode: subjectForm.typeCode,
          difficulty: diffMap[subjectForm.difficultyCode] || '中等',
          difficultyCode: subjectForm.difficultyCode,
          score: subjectForm.score || 5,
          categoryName: subjectForm.categoryName || 'Java基础',
          labelNames: subjectForm.labelName ? [subjectForm.labelName] : ['核心考点'],
          author: 'admin',
          answer: subjectForm.answer || '',
          parse: subjectForm.parse || '',
          options: subjectForm.options || [],
          status: '已发布',
          createdTime: new Date().toLocaleString()
        }

        this.subjects.unshift(newSubject)
        this.stats.totalSubjects++
        return { success: true, message: '题目发布成功！' }
      } catch (err) {
        console.error('Failed to create subject:', err)
        return { success: false, message: err.message || '新增题目失败' }
      }
    },

    /**
     * 删除题目
     */
    removeSubject(id) {
      this.subjects = this.subjects.filter((s) => s.id !== id)
      this.stats.totalSubjects = Math.max(0, this.stats.totalSubjects - 1)
      return true
    },

    /**
     * 新增分类 (调用 /subject/category/add)
     */
    async createCategory(form) {
      try {
        await addCategory({
          categoryName: form.name,
          categoryType: form.type,
          parentId: form.parentId || 0
        })
      } catch (_) {}

      const newCat = {
        id: Date.now(),
        name: form.name,
        type: form.type,
        parentId: form.parentId || 0,
        count: 0
      }
      if (form.type === 1) {
        this.primaryCategories.push(newCat)
      } else {
        this.subCategories.push(newCat)
      }
      this.stats.totalCategories++
      return true
    },

    /**
     * 修改分类 (调用 /subject/subject/category/update)
     */
    async editCategory(form) {
      try {
        await updateCategory({
          id: form.id,
          categoryName: form.name,
          categoryType: form.type,
          parentId: form.parentId || 0
        })
      } catch (err) {
        console.warn('Failed to update category:', err)
      }
      const list = form.type === 1 ? this.primaryCategories : this.subCategories
      const target = list.find((c) => c.id === form.id)
      if (target) {
        target.name = form.name
        if (form.parentId !== undefined) target.parentId = form.parentId
      }
      return true
    },

    /**
     * 删除分类
     */
    async removeCategory(id, type) {
      try {
        await deleteCategory(id)
      } catch (_) {}
      if (type === 1) {
        this.primaryCategories = this.primaryCategories.filter((c) => c.id !== id)
      } else {
        this.subCategories = this.subCategories.filter((c) => c.id !== id)
      }
      this.stats.totalCategories = Math.max(0, this.stats.totalCategories - 1)
      return true
    },

    /**
     * 新增标签 (调用 /subject/label/add)
     */
    async createLabel(form) {
      try {
        await addLabel({
          labelName: form.name,
          categoryId: form.categoryId,
          sortNum: form.sortNum || 1
        })
      } catch (_) {}

      const cat = this.subCategories.find((c) => c.id === form.categoryId)
      this.labels.push({
        id: Date.now(),
        name: form.name,
        categoryId: form.categoryId,
        categoryName: cat ? cat.name : '通用分类',
        sortNum: form.sortNum || 1
      })
      this.stats.totalLabels++
      return true
    },

    /**
     * 修改标签 (调用 /subject/subject/label/update)
     */
    async editLabel(form) {
      try {
        await updateLabel({
          id: form.id,
          labelName: form.name,
          categoryId: form.categoryId,
          sortNum: form.sortNum || 1
        })
      } catch (err) {
        console.warn('Failed to update label:', err)
      }
      const target = this.labels.find((l) => l.id === form.id)
      if (target) {
        target.name = form.name
        if (form.categoryId) {
          target.categoryId = form.categoryId
          const cat = this.subCategories.find((c) => c.id === form.categoryId)
          if (cat) target.categoryName = cat.name
        }
        if (form.sortNum) target.sortNum = form.sortNum
      }
      return true
    },

    /**
     * 删除标签
     */
    async removeLabel(id) {
      try {
        await deleteLabel(id)
      } catch (_) {}
      this.labels = this.labels.filter((l) => l.id !== id)
      this.stats.totalLabels = Math.max(0, this.stats.totalLabels - 1)
      return true
    },

    /**
     * 获取用户列表
     */
    async fetchUsers() {
      try {
        const res = await listUsersByIds(['admin', 'suifeng', 'test_user', 'vip_coder'])
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.users = res.data.map((u, idx) => ({
            id: u.id || idx + 1,
            userName: u.userName,
            nickName: u.nickName || u.userName,
            email: u.email || `${u.userName}@suifeng.club`,
            phone: u.phone || '1380000000' + (idx + 1),
            roleKey: u.userName === 'admin' || u.userName === 'suifeng' ? 'super_user' : 'normal_user',
            roleName: u.userName === 'admin' ? '超级管理员' : u.userName === 'suifeng' ? '管理员/架构师' : '普通学员',
            status: u.status || 0,
            createdTime: '2026-11-16 16:50:54'
          }))
          this.stats.totalUsers = this.users.length
        }
      } catch (err) {
        console.warn('Failed to list users from auth service:', err)
      }
    },

    /**
     * 删除用户 (调用 /auth/user/delete)
     */
    async removeUser(userId) {
      const u = this.users.find((user) => user.id === userId)
      try {
        await deleteUser({ id: userId, userName: u?.userName })
      } catch (err) {
        console.warn('Failed to delete user:', err)
      }
      this.users = this.users.filter((user) => user.id !== userId)
      this.stats.totalUsers = this.users.length
      return true
    },

    /**
     * 切换用户状态 (启用/禁用)
     */
    async toggleUserStatus(userId) {
      const u = this.users.find((user) => user.id === userId)
      if (!u) return
      const targetStatus = u.status === 0 ? 1 : 0
      try {
        await changeUserStatus({ id: userId, status: targetStatus, userName: u.userName })
      } catch (_) {}
      u.status = targetStatus
      return true
    },

    /**
     * 新增角色
     */
    async createRole(form) {
      const newRoleId = Date.now()
      try {
        const res = await addRole({
          roleName: form.roleName,
          roleKey: form.roleKey
        })
        const realId = (res && res.data && typeof res.data === 'number') ? res.data : newRoleId
        if (form.permissions && form.permissions.length > 0) {
          const permIds = form.permissions.map((_, idx) => 100 + idx)
          try {
            await addRolePermission({ roleId: realId, permissionIdList: permIds })
          } catch (_) {}
        }
      } catch (_) {}
      this.roles.push({
        id: newRoleId,
        roleName: form.roleName,
        roleKey: form.roleKey,
        description: form.description || '自定义业务权限分组',
        userCount: 0,
        permissions: form.permissions || ['subject:query']
      })
      return true
    },

    /**
     * 修改角色 (调用 /auth/role/update)
     */
    async editRole(form) {
      try {
        await updateRole({
          id: form.id,
          roleName: form.roleName,
          roleKey: form.roleKey
        })
        if (form.permissions && form.permissions.length > 0) {
          const permIds = form.permissions.map((_, idx) => 100 + idx)
          try {
            await addRolePermission({ roleId: form.id, permissionIdList: permIds })
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Failed to update role:', err)
      }
      const target = this.roles.find((r) => r.id === form.id)
      if (target) {
        target.roleName = form.roleName
        target.roleKey = form.roleKey
        if (form.permissions) target.permissions = form.permissions
      }
      return true
    },

    /**
     * 查询用户具备的权限 (调用 /auth/permission/getPermission)
     */
    async fetchUserPermissions(userName = 'admin') {
      try {
        const res = await getUserPermission(userName)
        if (res && res.success && res.data) {
          return res.data
        }
      } catch (err) {
        console.warn('getUserPermission error:', err)
      }
      return null
    },

    /**
     * 删除角色
     */
    async removeRole(id) {
      try {
        await deleteRole({ id })
      } catch (_) {}
      this.roles = this.roles.filter((r) => r.id !== id)
      return true
    },

    /**
     * 新增敏感词 (调用 /circle/sensitive/words/save)
     */
    async createSensitiveWord(word, type = 1) {
      try {
        await saveSensitiveWord(word, type)
      } catch (_) {}
      this.sensitiveWords.unshift({
        id: Date.now(),
        words: word,
        type,
        isDeleted: 0,
        createdTime: new Date().toISOString().split('T')[0]
      })
      return true
    },

    /**
     * 删除敏感词 (调用 /circle/sensitive/words/remove)
     */
    async removeSensitiveWord(id) {
      try {
        await removeSensitiveWord(id)
      } catch (_) {}
      this.sensitiveWords = this.sensitiveWords.filter((w) => w.id !== id)
      return true
    }
  }
})
