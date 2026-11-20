export const PRIMARY_CATEGORIES = [
  { id: 'backend', name: '后端开发', count: 2840 },
  { id: 'frontend', name: 'Web 前端', count: 860 },
  { id: 'mobile', name: '移动端开发', count: 420 },
  { id: 'algorithm', name: '算法与数据结构', count: 580 },
  { id: 'architecture', name: '高并发系统架构', count: 320 },
  { id: 'bigdata', name: '大数据与数仓', count: 350 },
  { id: 'qa', name: '测试与质量保障', count: 280 },
  { id: 'devops', name: '运维与DevOps', count: 310 },
  { id: 'ai', name: '人工智能与大模型', count: 360 },
  { id: 'cloudnative', name: '云原生与微服务', count: 290 }
];

export const SUB_CATEGORIES = {
  backend: [
    { id: 'all', name: '全部后端', count: 2840, labels: ['高频必考', '大厂核心', '底层源码', '实战避坑'] },
    { id: 'java-core', name: 'Java基础', count: 600, labels: ['集合框架', '泛型与反射', 'I/O与NIO', 'JDK新特性', '异常体系'] },
    { id: 'jvm', name: 'JVM原理', count: 500, labels: ['内存结构与OOM', '垃圾回收GC', '类加载双亲委派', 'JVM实战调优', 'JIT即时编译'] },
    { id: 'spring', name: 'Spring生态', count: 500, labels: ['IOC与AOP', 'Bean生命周期', 'SpringBoot自动装配', 'Spring事务失效', '三级缓存循环依赖'] },
    { id: 'mysql', name: 'MySQL数据库', count: 500, labels: ['B+树索引机制', '事务与MVCC', '行锁与间隙锁', '慢查询EXPLAIN', '分库分表与主从'] },
    { id: 'redis', name: 'Redis缓存', count: 400, labels: ['核心数据结构', '持久化RDB/AOF', '缓存击穿雪崩穿透', 'Redisson分布式锁', '高可用哨兵集群'] },
    { id: 'juc', name: '多线程与并发', count: 500, labels: ['线程池底层', 'AQS与Lock', 'CAS与Atomic', 'ThreadLocal', 'JMM内存模型'] },
    { id: 'microservice', name: '微服务架构', count: 300, labels: ['Gateway网关路由', 'Seata分布式事务', 'Sentinel限流熔断', 'Nacos配置注册', 'RPC调用与Feign'] }
  ],
  frontend: [
    { id: 'all', name: '全部前端', count: 860, labels: ['Vue3', 'React', 'TypeScript', '前端工程化', '性能优化'] },
    { id: 'vue', name: 'Vue.js 生态', count: 340, labels: ['响应式原理Proxy', '虚拟DOM与Diff', 'Pinia状态管理', 'VueRouter底层'] },
    { id: 'react', name: 'React.js 生态', count: 280, labels: ['Fiber双缓存', 'Hooks实现原理', '并发渲染模式', '状态流转'] },
    { id: 'ts', name: 'JavaScript / TS', count: 260, labels: ['闭包与原型链', 'EventLoop', 'TS类型体操', 'Promise与Async'] },
    { id: 'engineering', name: '前端工程化与构建', count: 240, labels: ['Vite构建原理', '首屏性能优化', '浏览器重排重绘', '微前端架构'] }
  ],
  mobile: [
    { id: 'all', name: '全部移动端', count: 420, labels: ['Flutter', 'Android Framework', 'iOS Runtime', '跨端渲染'] },
    { id: 'android', name: 'Android 开发', count: 260, labels: ['Activity生命周期', 'Handler机制', 'View绘制流程', 'Jetpack架构'] },
    { id: 'flutter', name: 'Flutter 跨端', count: 160, labels: ['Widget三棵树', '状态管理Riverpod', 'Isolate多线程', 'PlatformChannel'] }
  ],
  algorithm: [
    { id: 'all', name: '全部算法', count: 580, labels: ['动态规划', '二叉树与递归', '滑动窗口与双指针', '回溯与贪心', '图论与最短路径'] },
    { id: 'dp', name: '动态规划与贪心', count: 240, labels: ['背包问题', '最长递增子序列', '编辑距离', '股票买卖', '打家劫舍'] },
    { id: 'tree', name: '树与图论算法', count: 180, labels: ['二叉树遍历', '最近公共祖先LCA', '二叉搜索树BST', '拓扑排序', 'Dijkstra最短路径'] }
  ],
  architecture: [
    { id: 'all', name: '全部架构', count: 320, labels: ['高并发海量削峰', '分布式锁设计', '消息队列Kafka', '分布式链路追踪SkyWalking', '多级缓存架构'] },
    { id: 'high-concurrency', name: '高并发与削峰', count: 180, labels: ['秒杀系统全链路', '限流令牌桶漏桶', '多级缓存Caffeine', '异步化解耦'] },
    { id: 'distributed', name: '分布式核心组件', count: 140, labels: ['分布式事务Seata', '分布式ID雪花算法', '分布式锁Redisson', '一致性协议Raft'] }
  ],
  bigdata: [
    { id: 'all', name: '全部大数据', count: 350, labels: ['Spark计算引擎', 'Flink流计算', 'Hive数仓分层', '数据倾斜优化'] },
    { id: 'spark', name: 'Spark计算引擎', count: 180, labels: ['RDD算子与内存模型', 'Shuffle底层原理', 'SparkSQL催化剂优化'] },
    { id: 'flink', name: 'Flink流计算', count: 170, labels: ['Watermark水位线', 'Exactly-Once精确一致', 'State与Checkpoint'] }
  ],
  qa: [
    { id: 'all', name: '全部测试', count: 280, labels: ['自动化测试', '性能压测', '全链路灰度', '安全渗透'] },
    { id: 'auto-test', name: '自动化测试', count: 150, labels: ['Pytest/JUnit5框架', 'Selenium/Playwright', 'API接口自动化'] },
    { id: 'perf-test', name: '性能与压测', count: 130, labels: ['JMeter场景压测', 'TPS与RT响应时间', '瓶颈分析与定位'] }
  ],
  devops: [
    { id: 'all', name: '全部运维', count: 310, labels: ['Kubernetes', 'Docker容器化', 'CI/CD流水线', 'Prometheus监控'] },
    { id: 'k8s', name: 'Kubernetes (K8s)', count: 180, labels: ['Pod生命周期', 'Service与Ingress', 'Deployment滚动更新', 'ETCD一致性'] },
    { id: 'docker', name: 'Docker容器化', count: 130, labels: ['镜像分层构建', 'Namespace与Cgroups', 'Docker网络模式'] }
  ],
  ai: [
    { id: 'all', name: '全部大模型', count: 360, labels: ['Transformer架构', 'LoRA微调', 'RAG知识库', 'Agent智能体'] },
    { id: 'llm', name: '大语言模型 (LLM)', count: 190, labels: ['Transformer注意力机制', 'LoRA与QLoRA微调', 'Prompt提示词工程'] },
    { id: 'rag', name: 'RAG与向量检索', count: 170, labels: ['向量数据库Milvus/Faiss', 'Embedding嵌入模型', '多路召回与重排序'] }
  ],
  cloudnative: [
    { id: 'all', name: '全部云原生', count: 290, labels: ['Service Mesh', 'API网关', 'Serverless', '零信任安全'] },
    { id: 'mesh', name: 'Service Mesh服务网格', count: 150, labels: ['Istio控制面与数据面', 'Envoy代理机制', '流量切分与金丝雀'] },
    { id: 'gateway', name: 'API网关与流量中台', count: 140, labels: ['APISIX/Kong架构', '全局鉴权与限流', '动态路由加载'] }
  ]
};

export const QUESTIONS_DATA = [
      {
        id: 1,
        title: "详细讲解 Java 中 HashMap 的底层实现、扩容机制，及为什么容量必须强制为 2 的幂次方？",
        primaryCat: "backend",
        subCat: "java-core",
        label: "集合框架",
        company: "字节跳动",
        companyRate: "98% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "42.8k",
        likes: 1820,
        tags: ["Java 核心", "集合框架", "并发底层"],
        summary: "JDK 1.8 采用『数组 + 链表 + 红黑树』架构，当链表长度 ≥ 8 且数组容量 ≥ 64 时树化；扩容阈值为 capacity * 0.75。2 的幂次方设计保证位运算代替取模，散列均匀。\n\n![JDK 1.8 HashMap 数组链表红黑树内存拓扑图](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=80)",
        duckTip: "<strong>鸭鸭口诀：</strong>容量 2 的幂次方便位与取模 (hash & (length - 1))；扩容迁移巧用高位为 0 留在原位、高位为 1 移到原位 + 旧容量！",
        solutionHtml: `
          <div class="solution-h3">1. 底层存储结构与树化阈值</div>
          <p>在 JDK 1.8 中，HashMap 采用<strong>数组 + 单向链表 + 红黑树</strong>的组合结构。默认初始容量为 16，负载因子（loadFactor）默认为 0.75，计算扩容阈值 <code>threshold = capacity * loadFactor = 12</code>。</p>
          <ul>
            <li>当发生 Hash 冲突时，冲突节点以单链表尾插法存入（JDK 1.7 是头插法，并发扩容容易引发死循环环形链表）。</li>
            <li><strong>树化条件：</strong>单个链表长度达到 8，且当前哈希表总容量 ≥ 64 时，链表转化为红黑树以优化极端冲突下的查询性能（从 O(n) 降低至 O(log n)）。</li>
            <li><strong>退化条件：</strong>当红黑树节点在扩容拆分后数量 ≤ 6 时，会重新退化回链表。</li>
          </ul>

          <div class="solution-h3">2. 为什么容量必须强制为 2 的幂次方？</div>
          <p>核心原因有两个：</p>
          <ol>
            <li><strong>高效计算槽位索引（位运算替代取模）：</strong>在计算机底层中，模运算 <code>hash % length</code> 性能远不如位与运算 <code>hash & (length - 1)</code>。当 length 为 2 的幂次方时，<code>length - 1</code> 的二进制位全是 1（例如 16 的 length-1 是 01111），与 hash 值进行位与运算完全等价于取模，计算极快。</li>
            <li><strong>保证元素散列均匀，降低哈希碰撞几率：</strong>如果 length 不是 2 的次幂（例如 15，二进制为 01110），最后一位是 0，那么任何 hash 值与 01110 进行位与，结果最后一位永远为 0，导致所有奇数索引槽位永远无法利用，白白浪费 50% 空间且大幅增加哈希碰撞。</li>
          </ol>

          <div class="solution-h3">3. 扩容（Resize）机制的高低位分流</div>
          <div class="code-block-wrap">
            <div class="code-header">
              <div class="code-dots"><span class="code-dot red"></span><span class="code-dot yellow"></span><span class="code-dot green"></span></div>
              <span>HashMap.java (JDK 1.8 扩容高低位划分伪代码)</span>
              <button class="btn-copy-code" onclick="copyCode(this)">复制代码</button>
            </div>
            <pre><code><span class="comment">// JDK 1.8 扩容元素无需重新调用 hashCode()，直接通过新增的高位 bit 判断</span>
<span class="kw">if</span> ((e.hash & oldCap) == <span class="str">0</span>) {
    <span class="comment">// 高位为 0，索引不变：newIndex = oldIndex</span>
    loHead.next = e;
} <span class="kw">else</span> {
    <span class="comment">// 高位为 1，索引变为：newIndex = oldIndex + oldCap</span>
    hiHead.next = e;
}</code></pre>
          </div>
        `,
        followUps: [
          "追问 1：为什么 HashMap 树化阈值是 8，退化阈值是 6？为什么不都是 8？（答：避免在临界点频繁添加删除导致树与链表反复转换的震荡消耗；根据泊松分布，正常 Hash 冲突达到 8 的概率不足千万分之一）。",
          "追问 2：HashMap 是线程安全的吗？高并发下会有什么问题？（答：非线程安全。JDK 1.7 并发扩容死循环、数据覆盖；JDK 1.8 虽无死循环但仍存在 put 覆盖与 size 计数不准）。"
        ],
        rawJson: {
          code: 200,
          message: "操作成功",
          data: {
            subjectId: 1,
            subjectName: "HashMap底层原理与2的幂次方",
            subjectDifficult: 2,
            settleState: 1,
            author: "随风",
            likeCount: 1820
          }
        }
      },
      {
        id: 2,
        title: "ConcurrentHashMap 在 JDK 1.7 与 JDK 1.8 中的锁粒度演进及并发扩容机制？",
        primaryCat: "backend",
        subCat: "juc",
        label: "CAS与Atomic",
        company: "阿里巴巴",
        companyRate: "96% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "38.5k",
        likes: 1540,
        tags: ["JUC", "CAS与Atomic", "高并发锁"],
        summary: "1.7 采用 Segment 分段锁（继承 ReentrantLock，并发度默认为 16）；1.8 抛弃分段锁，改为『CAS + synchronized 锁头节点』，锁粒度精确到单个哈希桶，并发度提升至与桶同级。",
        duckTip: "<strong>鸭鸭口诀：</strong>1.7 粗粒度锁分段，1.8 细粒度锁桶头！CAS 占位，synchronized 锁链表头/树根节点！",
        solutionHtml: `
          <div class="solution-h3">1. JDK 1.7 Segment 分段锁设计</div>
          <p>JDK 1.7 采用 Segment 数组 + HashEntry 数组结构。Segment 继承自 <code>ReentrantLock</code>，每个 Segment 独立加锁。并发度在初始化时固定为 <code>concurrencyLevel</code>（默认 16），后续扩容只扩容单个 Segment 内的 HashEntry 数组。</p>

          <div class="solution-h3">2. JDK 1.8 CAS + Synchronized 锁细化</div>
          <p>JDK 1.8 彻底废弃 Segment，数据结构回归与 HashMap 类似的 Node 数组 + 链表/红黑树：</p>
          <ul>
            <li><strong>put 操作节点为空：</strong>使用无锁 <code>CAS(Unsafe.compareAndSwapObject)</code> 尝试将新节点原子放入数组槽位。</li>
            <li><strong>节点不为空发生冲突：</strong>使用 <code>synchronized</code> 仅锁定当前哈希桶的<strong>头节点</strong>（Node 实例），其他哈希桶的并发读写完全不受阻碍，锁冲突概率大幅下降。</li>
          </ul>
        `,
        followUps: [
          "追问：ConcurrentHashMap 的 size() 是如何高效统计的？（答：使用类似 LongAdder 的 CounterCell 数组与 baseCount 机制，高并发分摊写冲突后最终汇总求和）。"
        ],
        rawJson: {
          code: 200,
          data: { subjectId: 2, subjectName: "ConcurrentHashMap并发演进", subjectDifficult: 3 }
        }
      },
      {
        id: 3,
        title: "ThreadLocal 内存泄漏底层成因是什么？为什么 Entry 要继承 WeakReference？",
        primaryCat: "backend",
        subCat: "juc",
        label: "ThreadLocal",
        company: "腾讯",
        companyRate: "95% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "34.1k",
        likes: 1290,
        tags: ["ThreadLocal", "WeakReference", "JVM内存"],
        summary: "ThreadLocalMap 中的 Entry 其 Key 为 WeakReference(ThreadLocal)，弱引用在 GC 时会被回收导致 Key 为 null，但 Value 强引用存在，若线程长期不销毁（如线程池），Value 便无法被回收造成内存泄漏。",
        duckTip: "<strong>鸭鸭口诀：</strong>Key 弱引用被回收成 null，Value 强引用挂在线程上！必须在 finally 里显式调用 remove()！",
        solutionHtml: `
          <div class="solution-h3">1. 引用链全景剖析</div>
          <p>每一个 <code>Thread</code> 内部持有一个 <code>ThreadLocal.ThreadLocalMap</code> 实例，该 Map 的 <code>Entry</code> 继承自 <code>WeakReference&lt;ThreadLocal&lt;?&gt;&gt;</code>：</p>
          <ul>
            <li><code>Key</code> 是弱引用：<code>WeakReference(ThreadLocal)</code>。</li>
            <li><code>Value</code> 是普通强引用：<code>Object value</code>。</li>
          </ul>
          <p>当外部持有的 <code>ThreadLocal</code> 强引用被置为 null 时，下次垃圾回收（GC）发生，Key 必定被回收，变为 <code>null</code>。但如果当前线程处于<strong>线程池</strong>中被反复复用而长期不销毁，引用链为：<code>Thread -> ThreadLocalMap -> Entry -> Value</code>，Value 依然存活，导致该 Value 内存无法释放。</p>

          <div class="solution-h3">2. 最佳防范实践</div>
          <p>每次使用完毕后，务必在 <code>finally</code> 块中显式调用 <code>threadLocal.remove()</code>，从底层 Map 中移除对应的 Entry。</p>
        `,
        followUps: [
          "追问：如果 Entry 的 Key 设计成强引用会更好吗？（答：不会，强引用会导致即使外部 ThreadLocal 置为 null，只要线程不挂，ThreadLocal 本身连同 Value 都无法被 GC，泄漏更严重）。"
        ],
        rawJson: { code: 200, data: { subjectId: 3, subjectName: "ThreadLocal弱引用与内存泄漏" } }
      },
      {
        id: 4,
        title: "线程池核心参数如何根据 CPU 密集型与 IO 密集型合理配置？四大拒绝策略有哪些？",
        primaryCat: "backend",
        subCat: "juc",
        label: "线程池底层",
        company: "美团",
        companyRate: "97% 考过",
        difficulty: "简单",
        type: "简答题",
        views: "51.2k",
        likes: 2150,
        tags: ["线程池", "JUC", "CPU密集型"],
        summary: "CPU 密集型配置 N_cpu + 1；IO 密集型配置 2 * N_cpu 或 N_cpu / (1 - 阻塞系数)。四大策略：AbortPolicy(抛异常)、CallerRunsPolicy(调用者线程执行)、DiscardPolicy(静默丢弃)、DiscardOldestPolicy(丢弃最早排队任务)。",
        duckTip: "<strong>鸭鸭口诀：</strong>算力为主 N+1，网络等待 2N 起；生产核心用调用者执行 (CallerRunsPolicy) 降速避崩溃！",
        solutionHtml: `
          <div class="solution-h3">1. 核心线程数确定准则</div>
          <ul>
            <li><strong>CPU 密集型（大量复杂数学计算/排序/图像）：</strong><code>corePoolSize = CPU 核数 + 1</code>。+1 是为了防止偶发缺页中断或暂停时 CPU 闲置。</li>
            <li><strong>IO 密集型（大量数据库读写/RPC网络调用/文件传输）：</strong><code>corePoolSize = 2 * CPU 核数</code> 或 <code>CPU核数 / (1 - 阻塞系数)</code>（通常阻塞系数在 0.8~0.9 之间）。</li>
          </ul>

          <div class="solution-h3">2. 拒绝策略（RejectedExecutionHandler）</div>
          <ol>
            <li><code>AbortPolicy</code>（默认）：直接抛出 <code>RejectedExecutionException</code> 运行时异常。</li>
            <li><code>CallerRunsPolicy</code>：交由提交任务的主调用者线程同步执行，形成天然反压（Backpressure）机制。</li>
            <li><code>DiscardPolicy</code>：静默丢弃新任务，不予任何通知。</li>
            <li><code>DiscardOldestPolicy</code>：丢弃阻塞队列中最靠前（等待时间最久）的任务，尝试重新提交当前任务。</li>
          </ol>
        `,
        followUps: [
          "追问：为什么《阿里巴巴 Java 开发手册》严禁直接使用 Executors 创建线程池？（答：FixedThreadPool 允许请求队列长度为 Integer.MAX_VALUE，易导致 OOM；CachedThreadPool 允许创建最大线程数为 Integer.MAX_VALUE，易撑爆线程数量导致 OOM）。"
        ],
        rawJson: { code: 200, data: { subjectId: 4, subjectName: "线程池参数配置与拒绝策略" } }
      },
      {
        id: 5,
        title: "MySQL InnoDB 为什么选用 B+ 树作为索引结构，而不选用哈希表、二叉平衡树或 B 树？",
        primaryCat: "backend",
        subCat: "mysql",
        label: "B+树索引机制",
        company: "快手",
        companyRate: "94% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "36.8k",
        likes: 1430,
        tags: ["MySQL", "InnoDB", "B+树索引"],
        summary: "B+ 树非叶子节点仅存键值不存数据，单页可容纳更多索引项，树高度更矮（通常 3-4 层可存数千万条记录，减少磁盘 I/O）；叶子节点双向链表相连，区间范围查询极快。",
        duckTip: "<strong>鸭鸭口诀：</strong>B+ 树非叶只存键，扇出极大层数浅；叶子双向链表连，区间范围直接撵！",
        solutionHtml: `
          <div class="solution-h3">1. 与其他数据结构对比</div>
          <ul>
            <li><strong>哈希表：</strong>仅支持单值等值查询 O(1)，无法支持 <code>WHERE id BETWEEN 10 AND 50</code> 的范围查询和 <code>ORDER BY</code> 排序。</li>
            <li><strong>二叉平衡树 / 红黑树：</strong>出度扇出固定为 2，数据量大时树的高度急剧升高，每次寻址都需要一次随机磁盘 I/O，读取极慢。</li>
            <li><strong>B 树（B-Tree）：</strong>每个节点不仅存索引键，还存储整行数据。在 InnoDB 默认每页 16KB 大小限制下，每个节点能存储的键值数大大减少，导致树层数变高，相同数据量下需要更多磁盘 I/O。</li>
          </ul>

          <div class="solution-h3">2. B+ 树核心优势</div>
          <p>InnoDB 根节点与枝干节点只存索引键与指针，每个节点可存上千个索引项（高扇出）。3 层 B+ 树即可存储超过 2000 万行数据，寻址只需 3 次磁盘 I/O（根节点常驻内存，实际仅 1~2 次物理 I/O）。叶子节点按顺序形成双向链表，极度契合分页查询与范围扫描。</p>
        `,
        followUps: [
          "追问：什么是覆盖索引与回表？如何避免回表？（答：查询的字段全部包含在辅助索引中无需再查主键索引聚簇索引叫覆盖索引；若辅助索引缺少字段需要再查一次主键 B+ 树获取整行数据叫回表）。"
        ],
        rawJson: { code: 200, data: { subjectId: 5, subjectName: "InnoDB为什么选用B+树" } }
      },
      {
        id: 6,
        title: "MySQL 可重复读（RR）隔离级别下，是如何通过 MVCC 与 Next-Key Lock 解决幻读的？",
        primaryCat: "backend",
        subCat: "mysql",
        label: "事务隔离与MVCC",
        company: "阿里巴巴",
        companyRate: "93% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "29.4k",
        likes: 1180,
        tags: ["MySQL", "MVCC", "幻读解决方案"],
        summary: "快照读（普通 SELECT）通过 MVCC（Read View 与 Undo Log 版本链）实现，事务启动后始终读取首次生成的视图；当前读（SELECT FOR UPDATE / UPDATE）通过 Next-Key Lock（记录锁 + 间隙锁 Gap Lock）锁定间隙，防止其他事务插入新数据。",
        duckTip: "<strong>鸭鸭口诀：</strong>普通快照读靠 MVCC 版本链固定视图；当前写读靠 Next-Key 间隙锁锁死插入缝隙！",
        solutionHtml: `
          <div class="solution-h3">1. 什么是幻读（Phantom Read）？</div>
          <p>同一个事务内在同一查询条件下连续读取，后一次读取看到了前一次未看到的<strong>新插入行</strong>。</p>

          <div class="solution-h3">2. 快照读解决策略：MVCC (多版本并发控制)</div>
          <p>在 RR 隔离级别下，事务在执行第一次 <code>SELECT</code> 时会生成全局一致性视图 <code>Read View</code>。通过 <code>trx_id</code> 与 Undo Log 链比对，后续无论外界如何插入新记录，快照读均只能读取到该事务启动时刻之前已提交的旧版本快照，从逻辑上屏蔽了幻读。</p>

          <div class="solution-h3">3. 当前读解决策略：Next-Key Lock</div>
          <p>当执行当前读（如 <code>SELECT ... FOR UPDATE</code>）时，InnoDB 会在扫描的索引项上加 <code>Next-Key Lock</code>（包含行锁 Record Lock 与间隙锁 Gap Lock），锁定索引记录前后的开区间，禁止其他并发事务向该区间内 <code>INSERT</code> 新行，从物理上杜绝了幻读。</p>
        `,
        followUps: [
          "追问：在 RR 下真的 100% 不会发生任何幻读吗？（答：特殊场景仍会：事务 A 快照读查无某行，事务 B 插入该行并提交，事务 A 紧接着执行 UPDATE 更新了该行，由于 UPDATE 是当前读会使该行生成针对事务 A 的新版本，随后 A 再次快照读便能读出该行，出现幻读）。"
        ],
        rawJson: { code: 200, data: { subjectId: 6, subjectName: "MVCC与NextKeyLock解决幻读" } }
      },
      {
        id: 7,
        title: "Redis 缓存穿透、缓存击穿、缓存雪崩三者的根本区别与工程化多级防线方案？",
        primaryCat: "backend",
        subCat: "redis",
        label: "缓存击穿雪崩穿透",
        company: "字节跳动",
        companyRate: "99% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "64.2k",
        likes: 2890,
        tags: ["Redis", "高并发缓存", "穿透击穿雪崩"],
        summary: "穿透：查不存在的数据，绕过缓存直接冲垮 DB（方案：布隆过滤器、空值缓存+短过期）；击穿：单个热点 Key 过期瞬间海量并发打崩 DB（方案：互斥分布式锁、逻辑不过期）；雪崩：大量 Key 同时过期或 Redis 宕机（方案：TTL加随机偏差、哨兵集群、降级熔断）。",
        duckTip: "<strong>鸭鸭口诀：</strong>穿透查无此人（布隆防），击穿单个热点（互斥锁），雪崩大片倒塌（随机差）！",
        solutionHtml: `
          <div class="solution-h3">1. 核心定义与场景区别</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin:8px 0;">
            <tr style="background:var(--bg-subtle);">
              <th style="border:1px solid var(--border-color);padding:8px;">类型</th>
              <th style="border:1px solid var(--border-color);padding:8px;">本质原因</th>
              <th style="border:1px solid var(--border-color);padding:8px;">影响范围</th>
            </tr>
            <tr>
              <td style="border:1px solid var(--border-color);padding:8px;font-weight:700;">缓存穿透</td>
              <td style="border:1px solid var(--border-color);padding:8px;">请求的数据在缓存和数据库中都<strong>根本不存在</strong></td>
              <td style="border:1px solid var(--border-color);padding:8px;">黑客恶意攻击，全量穿透打到底层 DB</td>
            </tr>
            <tr>
              <td style="border:1px solid var(--border-color);padding:8px;font-weight:700;">缓存击穿</td>
              <td style="border:1px solid var(--border-color);padding:8px;">某个超高并发的<strong>单一热点 Key</strong> 突然过期失效</td>
              <td style="border:1px solid var(--border-color);padding:8px;">瞬间数万并发并发回源查 DB</td>
            </tr>
            <tr>
              <td style="border:1px solid var(--border-color);padding:8px;font-weight:700;">缓存雪崩</td>
              <td style="border:1px solid var(--border-color);padding:8px;"><strong>大量 Key 具有相同的过期时间</strong>或 Redis 实例整体宕机</td>
              <td style="border:1px solid var(--border-color);padding:8px;">整个底层数据库因负载瞬间暴涨崩溃</td>
            </tr>
          </table>

          <div class="solution-h3">2. 生产级多级防护落地方案</div>
          <ul>
            <li><strong>防穿透：</strong>在网关层使用 <code>BitMap / 布隆过滤器 (BloomFilter)</code> 快速校验；对查询结果为空的数据写入特定空标记并设置较短 TTL（如 60 秒）。</li>
            <li><strong>防击穿：</strong>查询缓存失效时使用 Redisson 分布式互斥锁，仅允许 1 个线程去查库回填，其余线程自旋等待；或使用热点数据逻辑永不过期后台定时异步续期。</li>
            <li><strong>防雪崩：</strong>所有缓存 Key 过期时间强制附加随机散列值（如 <code>baseTTL + Random(1~300s)</code>）；配置 Redis 哨兵或 Cluster 集群高可用，并搭配 Sentinel 熔断降级。</li>
          </ul>
        `,
        followUps: [
          "追问：布隆过滤器存在误判，误判率如何评估？如何解决无法删除元素的问题？（答：误判率通过哈希函数数量 k 和位图长度 m 计算控制；删除可通过 Counting Bloom Filter 计数型布隆过滤器解决）。"
        ],
        rawJson: { code: 200, data: { subjectId: 7, subjectName: "缓存穿透击穿雪崩" } }
      },
      {
        id: 8,
        title: "Redisson 分布式锁看门狗（Watchdog）续期机制与底层 Lua 脚本原子性原理？",
        primaryCat: "backend",
        subCat: "redis",
        label: "Redisson分布式锁",
        company: "美团",
        companyRate: "95% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "31.2k",
        likes: 1210,
        tags: ["Redis", "Redisson", "分布式锁底层"],
        summary: "加锁、重入计数与释放锁通过 Lua 脚本在 Redis 服务端原子执行；加锁未指定 leaseTime 时启动 Watchdog 守护线程，每隔 internalLockLeaseTime / 3（默认 10 秒）通过定时任务自动将锁有效期延长至 30 秒，防止业务未执行完锁被提前释放。",
        duckTip: "<strong>鸭鸭口诀：</strong>Lua 脚本保证原子哈希增减计数；看门狗三分之一周期定时自动续杯！",
        solutionHtml: `
          <div class="solution-h3">1. 为什么必须使用 Lua 脚本？</div>
          <p>Redisson 分布式锁采用 Hash 数据结构存储：<code>KEY = 锁名</code>，<code>FIELD = 线程UUID:线程ID</code>，<code>VALUE = 重入次数</code>。包含判断锁是否存在、增加重入次数、设置过期时间等多步操作，借助 Redis 的单线程特性与 Lua 脚本保证复合指令的原子性（要么全成功，要么全失败）。</p>

          <div class="solution-h3">2. 看门狗（Watchdog）自动续期原理</div>
          <p>如果获取锁时未显式指定 <code>leaseTime</code>（即默认 -1），Redisson 会启动后台守护线程 <code>Watchdog</code>：</p>
          <ul>
            <li>默认锁租期为 30 秒。</li>
            <li>Watchdog 会利用 Netty 的 <code>HashedWheelTimer</code>（时间轮）调度定时任务，每隔 <code>30 / 3 = 10 秒</code> 向 Redis 执行一次续期 Lua 脚本，将锁有效时间重新重置为 30 秒。</li>
            <li>当客户端发生宕机，Watchdog 定时任务停止运行，锁将在 30 秒后自然过期，彻底杜绝死锁。</li>
          </ul>
        `,
        followUps: [
          "追问：Redisson 分布式锁能完全解决主从架构下的丢锁问题吗？（答：不能，Redis 主从复制是异步的，若 Master 加锁成功后尚未同步给 Slave 立即宕机，Slave 晋升为 Master 会导致锁丢失。追求绝对强一致可采用 Redlock 红锁或 Zookeeper/Etcd）。"
        ],
        rawJson: { code: 200, data: { subjectId: 8, subjectName: "Redisson看门狗与分布式锁" } }
      },
      {
        id: 9,
        title: "分布式事务 Seata AT 模式的一阶段与二阶段提交机制及全局锁设计原理？",
        primaryCat: "backend",
        subCat: "microservice",
        label: "Seata分布式事务",
        company: "阿里大文娱",
        companyRate: "92% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "22.5k",
        likes: 980,
        tags: ["微服务", "Seata", "分布式事务"],
        summary: "一阶段：业务 SQL 执行前生成 beforeImage，执行后生成 afterImage，同时申请全局锁，将业务数据和 undo_log 在同一个本地事务提交；二阶段成功：异步快速删除 undo_log 释放全局锁；二阶段失败：通过 afterImage 校验防脏写，用 beforeImage 还原回滚。",
        duckTip: "<strong>鸭鸭口诀：</strong>一阶段记前后镜像同提本地；二阶段成功秒删日志，二阶段失败逆向回滚！",
        solutionHtml: `
          <div class="solution-h3">1. Seata AT 模式架构三大角色</div>
          <ul>
            <li><strong>TC (Transaction Coordinator)：</strong>事务协调器，维护全局和分支事务状态，驱动全局提交或回滚。</li>
            <li><strong>TM (Transaction Manager)：</strong>事务管理器，定义全局事务范围，负责发起全局事务。</li>
            <li><strong>RM (Resource Manager)：</strong>资源管理器，管理分支事务资源，驱动分支事务提交或回滚。</li>
          </ul>

          <div class="solution-h3">2. 一阶段与二阶段提交执行流</div>
          <p><strong>一阶段（业务执行）：</strong>RM 拦截业务 SQL，解析出更新前的数据（beforeImage），执行业务 SQL 后再查询出更新后的数据（afterImage）。接着向 TC 申请行级<strong>全局锁</strong>。成功获取后，将业务数据更新与生成的 <code>undo_log</code> 记录合并在一个本地事务中原子提交，立即释放本地数据库连接。</p>
          <p><strong>二阶段提交：</strong>TC 收到各分支成功通知，异步通知 RM 清理 <code>undo_log</code> 表记录，整个过程极快，无长时间行锁等待。</p>
          <p><strong>二阶段回滚：</strong>RM 校验当前数据是否与 afterImage 一致（防止脏写），若一致则用 beforeImage 生成逆向补偿 SQL 并执行，恢复原状。</p>
        `,
        followUps: [
          "追问：如果出现脏写（外界无 Seata 拦截的程序篡改了数据）导致 afterImage 不匹配怎么办？（答：AT 会报错报警人工介入处理；因此强一致场景建议业务 SQL 均加 @GlobalTransactional 或使用 SELECT FOR UPDATE 获取全局锁）。"
        ],
        rawJson: { code: 200, data: { subjectId: 9, subjectName: "Seata AT模式机制" } }
      },
      {
        id: 10,
        title: "Spring Cloud Gateway 底层基于 WebFlux 与 Netty 的 Filter 链执行流程与路由寻址机制？",
        primaryCat: "backend",
        subCat: "microservice",
        label: "Gateway网关路由",
        company: "腾讯",
        companyRate: "91% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "21.0k",
        likes: 890,
        tags: ["微服务", "Gateway", "WebFluxNetty"],
        summary: "基于 Spring 5 / Reactor / Netty 构建非阻塞反应式架构。流程：Gateway HandlerMapping 根据 Route 断言 Predicate 匹配目标路由；WebHandler 加载过滤器链（GlobalFilter + GatewayFilter），按 @Order 优先级执行 pre 过滤，转发下游返回后执行 post 过滤。",
        duckTip: "<strong>鸭鸭口诀：</strong>Netty 反应式事件轮询，断言匹配路由，过滤器链 Pre 鉴权防刷 Post 埋点统计！",
        solutionHtml: `
          <div class="solution-h3">1. 核心三大组件</div>
          <ul>
            <li><strong>Route (路由)：</strong>网关基础单元，由 ID、目标 URI、断言集合（Predicates）和过滤器集合（Filters）组成。</li>
            <li><strong>Predicate (断言)：</strong>基于 Java 8 Predicate，匹配 HTTP 请求的 Path、Method、Header 等条件。</li>
            <li><strong>Filter (过滤器)：</strong>用于在请求前（Pre）与响应后（Post）执行统一鉴权、限流、日志打点。</li>
          </ul>

          <div class="solution-h3">2. 相比传统 Zuul 1.x 的质的提升</div>
          <p>Zuul 1.x 基于 Servlet 阻塞式 I/O，每一个接入请求都需要分配一个专有线程处理（Thread-per-request），高并发下大量线程阻塞在下游 I/O 导致线程池耗尽。Gateway 采用 Netty 反应式非阻塞模型，少量事件循环线程即可支撑数万级并发路由寻址。</p>
        `,
        followUps: [
          "追问：如何在 Gateway 中与 Sa-Token 配合实现全局无状态鉴权？（答：使用 SaReactorFilter 统一拦截，在预过滤器中校验请求头中的 satoken，校验失败直接向 ServerWebExchange 写入 401 响应并中断链）。"
        ],
        rawJson: { code: 200, data: { subjectId: 10, subjectName: "SpringCloudGateway执行流程" } }
      },
      {
        id: 11,
        title: "Vue 3 相比 Vue 2 的响应式原理有何颠覆性变化？为什么能彻底解决数组监听痛点？",
        primaryCat: "frontend",
        subCat: "vue",
        label: "响应式原理Proxy",
        company: "百度",
        companyRate: "95% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "32.6k",
        likes: 1320,
        tags: ["Vue3", "Proxy", "响应式原理"],
        summary: "Vue 2 使用 Object.defineProperty 递归劫持属性，无法感知属性新增删除及数组直接赋值；Vue 3 使用原生 Proxy 代理整个对象，配合 Reflect 实现惰性递归拦截 13 种对象操作，原生支持 Map/Set 与数组。",
        duckTip: "<strong>鸭鸭口诀：</strong>Vue2 劫持属性先递归，Vue3 代理对象懒收集；13 种操作全拦截，数组新增无需 set！",
        solutionHtml: `
          <div class="solution-h3">1. Vue 2 Object.defineProperty 局限</div>
          <p>初始化时必须一次性深度递归遍历对象所有属性，无法原生拦截 <code>arr[0] = 123</code> 或 <code>arr.length = 0</code>，必须对数组 7 个原型方法进行重写篡改。</p>

          <div class="solution-h3">2. Vue 3 Proxy 的核心突破</div>
          <p>Proxy 直接代理整个对象本身，只要对对象执行属性读取或赋值，均会被 <code>get</code> / <code>set</code> 拦截器捕获。嵌套对象仅在访问到该属性时才递归包裹 <code>reactive()</code>（惰性代理），大幅降低首屏渲染内存消耗与耗时。</p>
        `,
        followUps: [
          "追问：Vue3 的 ref 和 reactive 有什么区别？（答：ref 用于基本类型通过 RefImpl 对象的 get value/set value 拦截，reactive 用于引用类型通过 Proxy 拦截）。"
        ],
        rawJson: { code: 200, data: { subjectId: 11, subjectName: "Vue3响应式Proxy" } }
      },
      {
        id: 12,
        title: "React 18 Fiber 架构的设计理念是什么？双缓存机制如何实现无闪烁更新？",
        primaryCat: "frontend",
        subCat: "react",
        label: "Fiber双缓存",
        company: "美团",
        companyRate: "93% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "27.4k",
        likes: 1120,
        tags: ["React", "Fiber", "双缓存架构"],
        summary: "Fiber 将以前不可中断的递归更新拆解为可暂停、可恢复的链表工作单元任务；双缓存机制维护 current 树（当前展示）与 workInProgress 树（内存构建），构建完成后一次性原子切换指针，杜绝白屏闪烁。",
        duckTip: "<strong>鸭鸭口诀：</strong>链表单元拆任务，时间切片保流畅；内存预演 Wip 树，指针一换即展示！",
        solutionHtml: `
          <div class="solution-h3">1. Stack Reconciler 的瓶颈</div>
          <p>React 15 以前的虚拟 DOM 采用深度优先递归遍历对比，一旦开始就无法中断。如果组件树庞大，主线程被长时间占用，导致浏览器无法响应用户点击、动画掉帧卡顿。</p>

          <div class="solution-h3">2. Fiber 与双缓存（Double Buffering）</div>
          <p>Fiber 将树结构重构为带有 <code>child</code>, <code>sibling</code>, <code>return</code> 指针的单向链表。配合浏览器的 <code>requestIdleCallback / Scheduler</code> 实现时间切片，在浏览器空闲时执行。</p>
          <p>屏幕上当前渲染的为 <code>current Fiber 树</code>，内存中正在运算的为 <code>workInProgress Fiber 树</code>。所有 DOM 创建与 diff 都在内存中完成，完成所有任务后将根节点的 <code>current</code> 指针直接指向 <code>workInProgress</code>，实现无缝瞬时渲染。</p>
        `,
        followUps: [
          "追问：React 18 自动批量更新（Automatic Batching）机制是怎样的？（答：将 Promise、setTimeout、原生事件内的多次 setState 统一在同一个宏任务微任务结束后合并为一次渲染）。"
        ],
        rawJson: { code: 200, data: { subjectId: 12, subjectName: "React18 Fiber双缓存" } }
      },
      {
        id: 13,
        title: "求解最长递增子序列（LIS）的动态规划与贪心 + 二分查找解法及复杂度对比？",
        primaryCat: "algorithm",
        subCat: "dp",
        label: "最长递增子序列",
        company: "字节跳动",
        companyRate: "96% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "38.5k",
        likes: 1450,
        tags: ["算法", "动态规划", "二分查找"],
        summary: "传统 DP 状态定义 dp[i] 为以 nums[i] 结尾的最长长度，双层遍历时间复杂度 O(n²)；贪心 + 二分查找维护 tails 数组，二分查找插入位置，时间复杂度优化至 O(n log n)。",
        duckTip: "<strong>鸭鸭口诀：</strong>DP 遍历平方慢，贪心二分对数快；tails 数组保单调，二分替换最右界！",
        solutionHtml: `
          <div class="solution-h3">1. 动态规划解法 (O(n²))</div>
          <p>定义 dp[i] 为考虑前 i 个元素，以第 i 个数字结尾的最长上升子序列长度。转移方程：<code>dp[i] = max(dp[j]) + 1 (0 ≤ j < i 且 nums[j] < nums[i])</code>。</p>
          <div class="solution-h3">2. 贪心 + 二分查找解法 (O(n log n))</div>
          <p>维护一个数组 tails，其中 tails[k] 的值代表长度为 k+1 的子序列尾部元素最小值。遍历 nums，利用二分查找快速定位替换点，大幅削减搜索开销。</p>
        `,
        followUps: [
          "追问：如果要求输出具体的最长递增子序列数组本身，该如何回溯记录？（答：通过额外的 pre 索引数组记录每一个元素的前驱指针，最后反向回溯提取）。"
        ],
        rawJson: { code: 200, data: { subjectId: 13, subjectName: "LIS最长递增子序列" } }
      },
      {
        id: 14,
        title: "二叉树的最近公共祖先（LCA）核心算法原理与递归边界处理逻辑？",
        primaryCat: "algorithm",
        subCat: "tree",
        label: "最近公共祖先LCA",
        company: "腾讯",
        companyRate: "94% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "34.1k",
        likes: 1280,
        tags: ["算法", "二叉树", "递归DFS"],
        summary: "采用后序遍历 DFS 递归。边界条件：当前节点为 null 或等于 p、q 则返回当前节点；递归遍历左右子树，若左右均非空说明当前节点即为 LCA，否则返回非空的一侧。",
        duckTip: "<strong>鸭鸭口诀：</strong>空或匹配直接回，左右后序探虚实；双侧有果即祖先，单侧有果传上面！",
        solutionHtml: `
          <div class="solution-h3">1. 核心后序遍历逻辑</div>
          <p>后序遍历天然自底向上回溯，先处理子节点再处理父节点。当左右子树递归返回值都不为空时，说明 p 和 q 分别位于当前根节点的两侧，当前根节点即为最近公共祖先。</p>
        `,
        followUps: [
          "追问：如果是二叉搜索树（BST），LCA 查找能优化到什么复杂度？（答：利用 BST 顺序性，只要 root.val 在 [p.val, q.val] 之间即为分界点，时间复杂度优化至 O(h)）。"
        ],
        rawJson: { code: 200, data: { subjectId: 14, subjectName: "二叉树LCA算法" } }
      },
      {
        id: 15,
        title: "如何设计一个支持千万级秒杀的高并发系统？从客户端削峰、多级缓存到分布式锁落地？",
        primaryCat: "architecture",
        subCat: "high-concurrency",
        label: "秒杀系统全链路",
        company: "阿里巴巴",
        companyRate: "98% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "52.0k",
        likes: 2460,
        tags: ["系统架构", "高并发", "海量削峰"],
        summary: "遵循『动静分离、分层削峰、异步化解耦、短路容灾』原则。前端 CDN + 静态化；网关防刷限流与验签；Redis + Lua 脚本原子预扣减库存；RocketMQ 异步投递订单入库；MySQL 乐观锁最终防超卖。",
        duckTip: "<strong>鸭鸭口诀：</strong>动静分离靠 CDN，网关限流先防刷；Redis+Lua 扣库存，MQ 异步落订单！",
        solutionHtml: `
          <div class="solution-h3">1. 读写多层分流设计</div>
          <ul>
            <li><strong>接入层：</strong>静态资源上 CDN，验证码与防刷滑块打散请求峰值。</li>
            <li><strong>缓存层：</strong>商品详情与预热库存全量驻留 Redis 集群，Lua 脚本原子扣减，单机扛 10w+ QPS。</li>
            <li><strong>消息层：</strong>下单请求发送 MQ 削峰填谷，下游平滑消费写入 MySQL。</li>
          </ul>
        `,
        followUps: [
          "追问：如何彻底杜绝超卖现象？（答：Redis Lua 校验并自减，DB 扣减时执行 update stock = stock - 1 where id = ? and stock > 0 乐观版本校验）。"
        ],
        rawJson: { code: 200, data: { subjectId: 15, subjectName: "千万级秒杀高并发系统设计" } }
      },
      {
        id: 16,
        title: "高并发多级缓存架构设计：本地 Caffeine + 分布式 Redis 缓存一致性与击穿防护方案？",
        primaryCat: "architecture",
        subCat: "high-concurrency",
        label: "多级缓存Caffeine",
        company: "美团",
        companyRate: "95% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "36.8k",
        likes: 1590,
        tags: ["系统架构", "多级缓存", "Redis"],
        summary: "L1 本地缓存（Caffeine，微秒级无网络开销）+ L2 集中缓存（Redis，毫秒级全局一致）。更新采用 Canal 监听 MySQL Binlog 异步更新 Redis，并通过 Redis Pub/Sub 广播淘汰所有节点本地 Caffeine 缓存。",
        duckTip: "<strong>鸭鸭口诀：</strong>L1 本地微秒级，L2 分布式抗大流；Binlog 异步更 Redis，PubSub 广播清本地！",
        solutionHtml: `
          <div class="solution-h3">1. 多级缓存解决的核心痛点</div>
          <p>热点 Key 极高并发下容易打满 Redis 单分片网络带宽或引发连接池阻塞。L1 本地缓存直接在 JVM 内存寻址，单机吞吐可达数百万级 QPS。</p>
        `,
        followUps: [
          "追问：热点 Key 突然失效如何防击穿？（答：采用互斥锁 Mutex 或逻辑过期异步加载机制）。"
        ],
        rawJson: { code: 200, data: { subjectId: 16, subjectName: "多级缓存架构设计" } }
      },
      {
        id: 17,
        title: "Flutter 渲染流水线从 Widget 到 Element 再到 RenderObject 的三棵树架构与 Diff 优化机制？",
        primaryCat: "mobile",
        subCat: "flutter",
        label: "Widget三棵树",
        company: "字节跳动",
        companyRate: "90% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "22.4k",
        likes: 830,
        tags: ["移动端", "Flutter", "跨端底层"],
        summary: "Widget 为不可变配置说明书；Element 挂载在树上维护生命周期与逻辑骨架；RenderObject 负责真实的排版布局与绘制（Paint）。更新时通过 canUpdate(oldWidget, newWidget) 比对 runtimeType 和 key 决定复用或重建。",
        duckTip: "<strong>鸭鸭口诀：</strong>Widget 配置轻量造，Element 骨架管状态；Render 绘制定宽高，Diff 对比 key 与型！",
        solutionHtml: `
          <div class="solution-h3">1. 三棵树职责分工</div>
          <p>Widget 极其轻量，每次 setState 都会重建；Element 常驻内存协调生命周期；RenderObject 负责复杂的几何计算与 Skia/Impeller 绘制，最大限度复用避免 GPU 压力。</p>
        `,
        followUps: [
          "追问：Flutter 为什么比原生 WebView 性能高得多？（答：绕过了 JavaScript 桥接与浏览器 DOM 布局，直接使用 C++ 引擎与 Skia 绘制在 Surface 上）。"
        ],
        rawJson: { code: 200, data: { subjectId: 17, subjectName: "Flutter三棵树渲染机制" } }
      },
      {
        id: 18,
        title: "Android Handler 机制中 Looper、MessageQueue 与 Epoll 阻塞唤醒机制底层原理？",
        primaryCat: "mobile",
        subCat: "android",
        label: "Handler机制",
        company: "华为",
        companyRate: "92% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "28.9k",
        likes: 1120,
        tags: ["移动端", "Android", "Handler底层"],
        summary: "Handler 依赖 Looper 从单链表 MessageQueue 轮询消息。主线程死循环不卡死的核心在于 Native 层的 Linux epoll_wait 机制，当无消息时线程让出 CPU 陷入内核休眠，有新消息写入管道时被精确唤醒。",
        duckTip: "<strong>鸭鸭口诀：</strong>Looper 死循环轮询，无信 epoll 入休眠；有信管道被唤醒，ThreadLocal 绑主线！",
        solutionHtml: `
          <div class="solution-h3">1. Epoll 机制保证不空转</div>
          <p>MessageQueue.next() 在无消息或延迟消息未到期时，会调用 nativePollOnce() 阻塞在 epoll 事件监听上。此时线程进入休眠态，不占用 CPU 时间片；当 sendMessage() 时调用 nativeWake() 向 pipe 写入字节唤醒。</p>
        `,
        followUps: [
          "追问：同步屏障（Sync Barrier）有什么用？（答：插入一个 target 为 null 的消息，优先处理异步消息如 VSYNC 屏幕刷新信号，保证绘制流畅）。"
        ],
        rawJson: { code: 200, data: { subjectId: 18, subjectName: "Android Handler Epoll底层" } }
      },
      {
        id: 19,
        title: "Spark RDD 宽依赖与窄依赖的根本区别是什么？Shuffle 阶段为什么是性能瓶颈？",
        primaryCat: "bigdata",
        subCat: "spark",
        label: "Shuffle底层原理",
        company: "快手",
        companyRate: "93% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "19.5k",
        likes: 740,
        tags: ["大数据", "Spark", "Shuffle"],
        summary: "窄依赖（如 map/filter）父 RDD 分区最多被子 RDD 的一个分区使用，可在单节点流水线并发执行；宽依赖（如 groupByKey/reduceByKey）一个父分区被多个子分区使用，必须跨节点网络洗牌（Shuffle Write/Fetch 磁盘落盘与网络传输），成为最大性能瓶颈。",
        duckTip: "<strong>鸭鸭口诀：</strong>窄依赖单向流动不落地，宽依赖网络洗牌全落盘；少用 groupByKey 多用 reduceByKey 预聚合！",
        author: "随风"
      },
      {
        id: 20,
        title: "大语言模型（LLM）中 LoRA（Low-Rank Adaptation）微调的数学原理与显存节省机制？",
        primaryCat: "ai",
        subCat: "llm",
        label: "LoRA与QLoRA微调",
        company: "微软",
        companyRate: "97% 考过",
        difficulty: "困难",
        type: "简答题",
        views: "44.2k",
        likes: 2100,
        tags: ["人工智能", "大模型", "LoRA微调"],
        summary: "LoRA 冻结原始预训练权重 W0 (d×k)，旁路引入低秩分解矩阵 A (d×r) 和 B (r×k)，其中秩 r ≪ min(d, k)。训练时仅更新 A 与 B 的极少参数（参数量通常不足全量的 1%），显存消耗降低 70% 以上，推理时可直接无损合并回 W0。",
        duckTip: "<strong>鸭鸭口诀：</strong>大矩阵冻结不动，低秩小矩阵旁路插；参数不到百分一，推理合并零时延！",
        author: "随风"
      },
      {
        id: 21,
        title: "Kubernetes (K8s) 中 Pod 从创建、调度、拉取镜像到就绪探测（Readiness）全生命周期流转？",
        primaryCat: "devops",
        subCat: "k8s",
        label: "Pod生命周期",
        company: "阿里云",
        companyRate: "95% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "31.8k",
        likes: 1240,
        tags: ["DevOps", "Kubernetes", "Pod生命周期"],
        summary: "APIServer 接收定义写入 ETCD；Kube-Scheduler 监听未调度 Pod，通过预选与优选算法选定 Node；目标节点的 Kubelet 监听后调用 CRI 创建容器沙箱，通过 CNI 分配 IP，执行 liveness 与 readiness 探针，通过后加入 Service Endpoints 承接流量。",
        duckTip: "<strong>鸭鸭口诀：</strong>APIServer 存 ETCD，Scheduler 算最佳节点；Kubelet 调 CRI 启容器，探针合格挂流量！",
        author: "随风"
      },
      {
        id: 22,
        title: "高并发接口性能压测中，如何准确定位系统瓶颈是处于数据库连接池、GC 还是线程阻塞？",
        primaryCat: "qa",
        subCat: "perf-test",
        label: "瓶颈分析与定位",
        company: "美团",
        companyRate: "94% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "23.6k",
        likes: 910,
        tags: ["质量保障", "性能压测", "JMeter全链路"],
        summary: "结合 Grafana + Prometheus 与 Arthas 抓取 JVM。若 TPS 不增但 CPU 极低，排查数据库 HikariCP 连接池等待；若 CPU 极高且伴随 RT 抖动，排查 Full GC 频次；若线程大量处于 BLOCKED/WAITING，抓取 Thread Dump 定位锁竞争。",
        duckTip: "<strong>鸭鸭口诀：</strong>TPS 上不去先看 CPU，CPU 低看连接池，CPU 飙升查 GC，响应突刺查锁争！",
        author: "随风"
      },
      {
        id: 23,
        title: "Istio Service Mesh 如何通过 Envoy Sidecar 实现零侵入流量切分（金丝雀发布）与故障注入？",
        primaryCat: "cloudnative",
        subCat: "mesh",
        label: "流量切分与金丝雀",
        company: "华为",
        companyRate: "92% 考过",
        difficulty: "中等",
        type: "简答题",
        views: "21.3k",
        likes: 860,
        tags: ["云原生", "Istio", "ServiceMesh"],
        summary: "基于 iptables 将 Pod 进出流量透明拦截到 Envoy 代理中。通过 VirtualService 定义路由规则与权重百分比（如 v1 90%, v2 10%），由 DestinationRule 定义子集 Subset；控制面 Pilot 动态将配置以 xDS 协议推送到数据面，业务无感知。",
        duckTip: "<strong>鸭鸭口诀：</strong>iptables 透明劫持，VirtualService 分流定权重，xDS 动态下发零重启！",
        author: "随风"
      }
    ];



export const CIRCLE_MOMENTS_DATA = [
      {
        id: 1,
        author: "随风",
        avatar: "http://127.0.0.1:9005/user/avatar/avatar_suifeng.png",
        badge: "资深架构师",
        channel: "interview",
        channelName: "职场面经",
        time: "10分钟前",
        content: "刚面完字节电商广告后端三面，核心全程围绕【高并发下 Redis 缓存一致性与 Redisson 分布式锁实战】深挖！考官特别追问了：如果 Redis 主从切换瞬间锁丢失怎么办？大家一定要准备 Redlock 或降级双写方案！",
        images: [
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
        ],
        likes: 124,
        isLiked: false,
        comments: [
          { user: "CodeArt", avatar: "http://127.0.0.1:9005/user/avatar/avatar_codeart.png", text: "字节三面确实偏实战！感谢随风大佬的题库，刚才刚好刷到这题！" },
          { user: "小明学Java", avatar: "http://127.0.0.1:9005/user/avatar/avatar_xiaoming.png", text: "请问 Redisson 的 Watchdog 机制考官有追问吗？" }
        ]
      },
      {
        id: 2,
        author: "架构小哥",
        avatar: "http://127.0.0.1:9005/user/avatar/avatar_jiagou.png",
        badge: "中间件研发",
        channel: "architecture",
        channelName: "架构心得",
        time: "1小时前",
        content: "生产环境避坑记录：Seata AT 模式在微服务批量更新场景下，一定要注意 undo_log 的膨胀问题！建议合理拆解长事务，并开启异步批量提交。",
        likes: 89,
        isLiked: false,
        comments: [
          { user: "极客老李", avatar: "http://127.0.0.1:9005/user/avatar/avatar_laoli.png", text: "非常赞同！还有全局锁超时的重试次数也需要结合业务调优。" }
        ]
      },
      {
        id: 3,
        author: "前端小菜鸟",
        avatar: "http://127.0.0.1:9005/user/avatar/avatar_cainiao.png",
        badge: "全栈开发者",
        channel: "tech",
        channelName: "技术交流",
        time: "3小时前",
        content: "今天排查了一个内存泄漏 Bug，发现是 Node.js 闭包和全局 EventEmitter 遗漏 removeListener 导致的！大家写事件监听千万记得在生命周期销毁时解绑！",
        likes: 56,
        isLiked: false,
        comments: []
      },
      {
        id: 4,
        author: "算法大牛",
        avatar: "http://127.0.0.1:9005/user/avatar/avatar_daniu.png",
        badge: "ACM金牌",
        channel: "interview",
        channelName: "职场面经",
        time: "5小时前",
        content: "分享一下面试微信后台的心得：DP 动态规划和前缀树字典树几乎必问，手写 LRU 缓存要熟练到 5 分钟内纯手撕双向链表+哈希表！",
        likes: 102,
        isLiked: false,
        comments: [
          { user: "小明学Java", avatar: "http://127.0.0.1:9005/user/avatar/avatar_xiaoming.png", text: "收下这份面经秘籍！LRU 确实是高频考点！" }
        ]
      },
      {
        id: 5,
        author: "测试喵",
        avatar: "http://127.0.0.1:9005/user/avatar/avatar_miao.png",
        badge: "测试专家",
        channel: "tech",
        channelName: "技术交流",
        time: "昨天",
        content: "在全链路压测时，流量染色和影子库隔离方案非常关键，大家做自动化测试平台时一定要严格区分测试数据与真实生产数据。",
        likes: 67,
        isLiked: false,
        comments: []
      }
    ];

export const SENSITIVE_WORDS = ['代考', '作弊', '泄题', '兼职代写', '刷单'];
