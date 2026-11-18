// ==========================================================================
    // 1. 分类级别与技术标签字典 (严格对齐 sf-club-subject 接口)
    // ==========================================================================
    const PRIMARY_CATEGORIES = [
      { id: 'backend', name: '后端开发', count: 2840 },
      { id: 'frontend', name: 'Web 前端', count: 860 },
      { id: 'mobile', name: '移动端开发', count: 420 },
      { id: 'algorithm', name: '算法与数据结构', count: 580 },
      { id: 'architecture', name: '高并发系统架构', count: 320 }
    ];

    const SUB_CATEGORIES = {
      backend: [
        { id: 'all', name: '全部后端', count: 2840, labels: ['高频必考', '大厂核心', '底层源码', '实战避坑'] },
        { id: 'java-core', name: 'Java 基础与核心', count: 680, labels: ['集合框架', '泛型与反射', 'I/O与NIO', 'JDK新特性', '异常体系'] },
        { id: 'juc', name: '并发编程 (JUC)', count: 520, labels: ['线程池底层', 'AQS与Lock', 'CAS与Atomic', 'ThreadLocal', 'JMM内存模型', 'Volatile原理'] },
        { id: 'jvm', name: 'JVM 虚拟机调优', count: 410, labels: ['内存结构与OOM', '垃圾收集器(G1/ZGC)', '类加载双亲委派', 'JVM实战调优', 'JIT即时编译'] },
        { id: 'mysql', name: 'MySQL 数据库底层', count: 480, labels: ['B+树索引机制', '事务隔离与MVCC', '行锁与间隙锁', '慢查询EXPLAIN', '分库分表与主从'] },
        { id: 'redis', name: 'Redis 高并发缓存', count: 450, labels: ['核心数据结构', '持久化RDB/AOF', '缓存击穿雪崩穿透', 'Redisson分布式锁', '高可用哨兵集群'] },
        { id: 'microservice', name: '微服务与分布式治理', count: 300, labels: ['Gateway网关路由', 'Seata分布式事务', 'Sentinel限流熔断', 'Nacos配置注册', 'RPC调用与Feign'] }
      ],
      frontend: [
        { id: 'all', name: '全部前端', count: 860, labels: ['Vue3', 'React', 'TypeScript', '前端工程化', '性能优化'] },
        { id: 'vue', name: 'Vue 核心生态', count: 340, labels: ['响应式原理Proxy', '虚拟DOM与Diff', 'Pinia状态管理', 'VueRouter底层'] },
        { id: 'react', name: 'React 体系架构', count: 280, labels: ['Fiber双缓存', 'Hooks实现原理', '并发渲染模式', '状态流转'] },
        { id: 'engineering', name: '前端工程化与构建', count: 240, labels: ['Vite构建原理', '首屏性能优化', '浏览器渲染重排重绘', '微前端架构'] }
      ],
      mobile: [
        { id: 'all', name: '全部移动端', count: 420, labels: ['Flutter', 'Android Framework', 'iOS Runtime', '跨端渲染'] }
      ],
      algorithm: [
        { id: 'all', name: '全部算法', count: 580, labels: ['动态规划', '二叉树与递归', '滑动窗口与双指针', '回溯与贪心', '图论与最短路径'] }
      ],
      architecture: [
        { id: 'all', name: '全部架构', count: 320, labels: ['高并发海量削峰', '分布式锁设计', '消息队列Kafka', '分布式链路追踪SkyWalking', '多级缓存架构'] }
      ]
    };

    // ==========================================================================
    // 2. 真实深度高频面试题目数据库 (QUESTIONS_DATA)
    // ==========================================================================
    const QUESTIONS_DATA = [
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
        summary: "JDK 1.8 采用『数组 + 链表 + 红黑树』架构，当链表长度 ≥ 8 且数组容量 ≥ 64 时树化；扩容阈值为 capacity * 0.75。2 的幂次方设计保证位运算代替取模，散列均匀。",
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
      }
    ];

    // ==========================================================================
    // 3. 在线考场真题数据 (PRACTICE_EXAM_DATA)
    // ==========================================================================
    const PRACTICE_EXAM_DATA = [
      {
        id: 1,
        type: "单选题",
        title: "在 JDK 1.8 中，HashMap 链表转化为红黑树的临界阈值条件是什么？",
        options: [
          "A. 链表长度达到 8，且数组总容量达到 64",
          "B. 链表长度达到 8，无需考虑数组总容量",
          "C. 链表长度达到 6，数组总容量达到 32",
          "D. 链表长度达到 16，负载因子达到 0.75"
        ],
        correct: 0,
        explanation: "当链表长度 ≥ 8 且当前数组容量 ≥ 64 时转化为红黑树；若容量不足 64 则优先进行 resize 扩容。"
      },
      {
        id: 2,
        type: "单选题",
        title: "以下关于 ThreadLocal 内存泄漏的说法中，正确的是哪一项？",
        options: [
          "A. Entry 的 Key 是强引用，因此无法被垃圾回收",
          "B. Entry 的 Key 是弱引用，但 Value 是强引用，线程池复用下 Value 无法回收",
          "C. 只要调用 threadLocal.set(null) 即可彻底避免内存泄漏",
          "D. ThreadLocal 在现代 JDK 中已通过弱引用彻底解决了内存泄漏"
        ],
        correct: 1,
        explanation: "Key 为 WeakReference，GC 时被清空为 null，但 Value 强引用依然挂在 Thread 对象的 ThreadLocalMap 上，必须调用 remove()。"
      },
      {
        id: 3,
        type: "单选题",
        title: "在 MySQL InnoDB 引擎中，为什么辅助索引的叶子节点不直接存储整行数据的物理地址？",
        options: [
          "A. 为了防止辅助索引过大，减少 I/O",
          "B. 存储主键值而非物理地址，可避免行发生移动或页分裂时修改所有辅助索引",
          "C. InnoDB 根本不支持存储物理地址",
          "D. 保证所有查询都必须经过主键索引回表以校验事务版本"
        ],
        correct: 1,
        explanation: "当发生行更新或 B+ 树页分裂时行物理地址会改变，如果辅助索引存主键值，则无需更新辅助索引，极大降低维护代价。"
      },
      {
        id: 4,
        type: "单选题",
        title: "在 Redis 中，当遇到海量并发查询不存在的数据，绕过缓存直接冲击底层数据库，这种现象被称为？",
        options: [
          "A. 缓存击穿",
          "B. 缓存穿透",
          "C. 缓存雪崩",
          "D. 缓存污染"
        ],
        correct: 1,
        explanation: "查无此数据被称为缓存穿透；单一热点 Key 失效称为击穿；大面积 Key 同时失效称为雪崩。"
      },
      {
        id: 5,
        type: "单选题",
        title: "Redisson 分布式锁看门狗（Watchdog）在未手动指定 leaseTime 的情况下，默认的续期周期与锁租期分别是？",
        options: [
          "A. 续期周期 10 秒，锁初始租期 30 秒",
          "B. 续期周期 5 秒，锁初始租期 15 秒",
          "C. 续期周期 15 秒，锁初始租期 60 秒",
          "D. 续期周期 30 秒，锁初始租期 30 秒"
        ],
        correct: 0,
        explanation: "看门狗默认锁初始有效期为 30 秒，每隔 internalLockLeaseTime / 3（即 10 秒）自动续期重置为 30 秒。"
      },
      {
        id: 6,
        type: "单选题",
        title: "分布式事务 Seata AT 模式中，一阶段提交的核心机制是什么？",
        options: [
          "A. 仅执行业务 SQL，等待二阶段集中写日志",
          "B. 生成前后镜像并申请全局锁，与业务数据在同一本地事务中提交",
          "C. 使用两阶段全局 XA 锁锁定底层数据库物理连接",
          "D. 依靠消息队列最大努力通知"
        ],
        correct: 1,
        explanation: "一阶段生成 beforeImage 和 afterImage，在本地事务中提交业务数据与 undo_log 并释放本地锁，极大缩短持锁时间。"
      },
      {
        id: 7,
        type: "单选题",
        title: "Spring Cloud Gateway 底层采用的核心反应式网络引擎是？",
        options: [
          "A. Tomcat NIO",
          "B. Undertow",
          "C. Netty",
          "D. Jetty"
        ],
        correct: 2,
        explanation: "Gateway 基于 Spring 5 WebFlux 与 Netty 构建非阻塞反应式事件循环。"
      },
      {
        id: 8,
        type: "单选题",
        title: "Vue 3 相比 Vue 2 响应式原理，采用 Proxy 的核心优势之一是？",
        options: [
          "A. 必须在初始化时对对象所有属性进行深度全量递归",
          "B. 可以原生拦截数组通过索引修改元素及 length 修改",
          "C. 不再需要虚拟 DOM 即可完成视图编译",
          "D. 运行在服务端 Node.js 效率更高"
        ],
        correct: 1,
        explanation: "Proxy 可以直接代理数组与对象的所有 13 种拦截操作，解决了 Vue2 无法监听数组索引与长度变化的缺陷。"
      },
      {
        id: 9,
        type: "单选题",
        title: "在 Java 线程池中，当任务队列已满且线程数已达到 maximumPoolSize 时，若使用 CallerRunsPolicy 拒绝策略，任务将如何处理？",
        options: [
          "A. 直接抛出 RejectedExecutionException 异常",
          "B. 静默丢弃，不执行也不报错",
          "C. 交由提交任务的主调用者线程直接同步执行",
          "D. 丢弃队列中最老的任务并重新入队"
        ],
        correct: 2,
        explanation: "CallerRunsPolicy 会将任务退回给调用者线程执行，延缓新任务产生，提供反压保护。"
      },
      {
        id: 10,
        type: "单选题",
        title: "在 MySQL 可重复读（RR）隔离级别下，当前读（如 SELECT ... FOR UPDATE）通过什么机制阻止其他事务并发插入导致幻读？",
        options: [
          "A. 仅通过 MVCC 视图快照",
          "B. Next-Key Lock (行记录锁 + 间隙锁 Gap Lock)",
          "C. 表级排他锁 (Table X-Lock)",
          "D. 乐观锁版本号版本控制"
        ],
        correct: 1,
        explanation: "当前读通过 Next-Key Lock 锁死索引记录及间隙，禁止其他事务在此期间 INSERT 新行。"
      }
    ];

    // ==========================================================================
    // 4. 技术圈子动态数据 (CIRCLE_MOMENTS_DATA)
    // ==========================================================================
    const CIRCLE_MOMENTS_DATA = [
      {
        id: 1,
        author: "随风",
        avatar: "风",
        badge: "资深架构师",
        channel: "大厂面经",
        time: "10分钟前",
        content: "刚面完字节电商广告后端三面，核心全程围绕【高并发下 Redis 缓存一致性与 Redisson 分布式锁实战】深挖！考官特别追问了：如果 Redis 主从切换瞬间锁丢失怎么办？大家一定要准备 Redlock 或降级双写方案！",
        likes: 124,
        isLiked: false,
        comments: [
          { user: "CodeArt", text: "字节三面确实偏实战！感谢随风大佬的题库，刚才刚好刷到这题！" },
          { user: "小明学Java", text: "请问 Redisson 的 Watchdog 机制考官有追问吗？" }
        ]
      },
      {
        id: 2,
        author: "架构小哥",
        avatar: "架",
        badge: "中间件研发",
        channel: "架构与源码",
        time: "1小时前",
        content: "生产环境避坑记录：Seata AT 模式在微服务批量更新场景下，一定要注意 undo_log 的膨胀问题！建议合理拆解长事务，并开启异步批量提交。",
        likes: 89,
        isLiked: false,
        comments: [
          { user: "极客老李", text: "非常赞同！还有全局锁超时的重试次数也需要结合业务调优。" }
        ]
      },
      {
        id: 3,
        author: "前端小菜鸟",
        avatar: "鸟",
        badge: "全栈开发者",
        channel: "技术避坑",
        time: "3小时前",
        content: "今天排查了一个内存泄漏 Bug，发现是 Node.js 闭包和全局 EventEmitter 遗漏 removeListener 导致的！大家写事件监听千万记得在生命周期销毁时解绑！",
        likes: 56,
        isLiked: false,
        comments: []
      }
    ];

    // ==========================================================================
    // 5. 全局响应式状态机 (State Store)
    // ==========================================================================
    let currentView = 'home';
    let currentPrimaryCat = 'backend';
    let currentSubCat = 'all';
    let currentSelectedLabel = null;
    let currentCompany = 'all';
    let currentDifficulty = 'all';
    let currentType = 'all';
    let currentSort = 'recommend';
    let isReciteMode = false;
    let activeQuestionId = 1;
    let examCurrentIndex = 0;
    let examUserAnswers = {};
    let examFlagged = {};
    let isCheckedIn = false;
    let streakDays = 7;

    // ==========================================================================
    // 6. 视图切换引擎 (View Engine)
    // ==========================================================================
    function switchView(viewName) {
      currentView = viewName;

      // 更新顶部导航激活态
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const activeNav = document.getElementById('nav-' + viewName);
      if (activeNav) activeNav.classList.add('active');

      // 更新页面视图激活态
      document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
      const activeView = document.getElementById('view-' + viewName);
      if (activeView) activeView.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 进入特定视图时触发特定初始化
      if (viewName === 'subject') {
        renderSubjectModule();
      } else if (viewName === 'circle') {
        renderCircleMoments();
      } else if (viewName === 'home') {
        renderHomeHeatmap();
      } else if (viewName === 'profile') {
        renderProfileTabContent('favorites');
      }
    }

    // ==========================================================================
    // 7. 题库模块渲染与分类级别/标签过滤联动 (核心规范满足)
    // ==========================================================================
    function renderSubjectModule() {
      renderPrimaryCategories();
      renderSubCategories();
      renderLabelPills();
      renderQuestionsList();
    }

    // 渲染一级大类
    function renderPrimaryCategories() {
      const container = document.getElementById('primaryCatBar');
      if (!container) return;

      container.innerHTML = PRIMARY_CATEGORIES.map(cat => `
        <div class="primary-cat-item ${cat.id === currentPrimaryCat ? 'active' : ''}" onclick="selectPrimaryCategory('${cat.id}')">
          <span>${cat.name}</span>
          <span class="cat-count">(${cat.count})</span>
        </div>
      `).join('');
    }

    // 切换一级大类
    function selectPrimaryCategory(catId) {
      currentPrimaryCat = catId;
      currentSubCat = 'all';
      currentSelectedLabel = null;
      renderPrimaryCategories();
      renderSubCategories();
      renderLabelPills();
      renderQuestionsList();
    }

    // 渲染二级分类
    function renderSubCategories() {
      const container = document.getElementById('subCatBar');
      if (!container) return;

      const subList = SUB_CATEGORIES[currentPrimaryCat] || [];
      container.innerHTML = subList.map(sub => `
        <div class="sub-cat-item ${sub.id === currentSubCat ? 'active' : ''}" onclick="selectSubCategory('${sub.id}')">
          <span>${sub.name}</span>
          <span class="cat-count">(${sub.count})</span>
        </div>
      `).join('');
    }

    // 切换二级分类
    function selectSubCategory(subId) {
      currentSubCat = subId;
      currentSelectedLabel = null;
      renderSubCategories();
      renderLabelPills();
      renderQuestionsList();
    }

    // 渲染三级细分技术标签 (Label Filter Pills)
    function renderLabelPills() {
      const container = document.getElementById('labelPillsContainer');
      const clearBtn = document.getElementById('labelClearBtn');
      if (!container) return;

      // 获取当前二级分类下的标签列表
      const subList = SUB_CATEGORIES[currentPrimaryCat] || [];
      const currentSubObj = subList.find(s => s.id === currentSubCat) || subList[0];
      const labels = currentSubObj ? currentSubObj.labels : [];

      container.innerHTML = labels.map(lbl => `
        <span class="label-pill ${currentSelectedLabel === lbl ? 'active' : ''}" onclick="toggleSelectLabel('${lbl}')">
          ${lbl}
        </span>
      `).join('');

      if (clearBtn) {
        clearBtn.style.display = currentSelectedLabel ? 'inline-flex' : 'none';
      }
    }

    // 切换/激活标签筛选
    function toggleSelectLabel(labelName) {
      if (currentSelectedLabel === labelName) {
        currentSelectedLabel = null; // 取消筛选
      } else {
        currentSelectedLabel = labelName; // 选中筛选
      }
      renderLabelPills();
      renderQuestionsList();
      showToast(currentSelectedLabel ? `已按标签【${currentSelectedLabel}】筛选` : '已清除标签筛选');
    }

    function clearSelectedLabel() {
      currentSelectedLabel = null;
      renderLabelPills();
      renderQuestionsList();
      showToast('已清空标签过滤');
    }

    // 快捷从首页直达具体分类
    function selectCategoryDirect(primaryId, subId) {
      currentPrimaryCat = primaryId;
      currentSubCat = subId;
      currentSelectedLabel = null;
      switchView('subject');
    }

    // 多维度过滤与排序变更
    function applyFilters() {
      currentCompany = document.getElementById('companySelect').value;
      currentDifficulty = document.getElementById('difficultySelect').value;
      currentType = document.getElementById('typeSelect').value;
      renderQuestionsList();
    }

    function setSort(sortType, element) {
      currentSort = sortType;
      document.querySelectorAll('.sort-tab').forEach(el => el.classList.remove('active'));
      element.classList.add('active');
      renderQuestionsList();
    }

    function toggleReciteMode(checked) {
      isReciteMode = checked;
      renderQuestionsList();
      showToast(checked ? '背题模式已开启：直接展开 30 秒速记要点' : '刷题自测模式：已折叠解析');
    }

    // 筛选题目算法
    function getFilteredQuestions() {
      return QUESTIONS_DATA.filter(q => {
        // 一级分类匹配
        if (currentPrimaryCat !== 'all' && q.primaryCat !== currentPrimaryCat) {
          return false;
        }
        // 二级分类匹配
        if (currentSubCat !== 'all' && q.subCat !== currentSubCat) {
          return false;
        }
        // 三级标签匹配 (核心逻辑：若选中标签，则必须包含该标签)
        if (currentSelectedLabel && q.label !== currentSelectedLabel && !q.tags.includes(currentSelectedLabel)) {
          return false;
        }
        // 大厂匹配
        if (currentCompany !== 'all' && q.company !== currentCompany) {
          return false;
        }
        // 难度匹配
        if (currentDifficulty !== 'all' && q.difficulty !== currentDifficulty) {
          return false;
        }
        // 题型匹配
        if (currentType !== 'all' && q.type !== currentType) {
          return false;
        }
        return true;
      });
    }

    // 渲染题目列表卡片
    function renderQuestionsList() {
      const container = document.getElementById('questionItems');
      const totalCountEl = document.getElementById('totalCount');
      const activeFilterBadge = document.getElementById('activeFilterBadge');
      if (!container) return;

      const questions = getFilteredQuestions();
      if (totalCountEl) totalCountEl.textContent = questions.length;

      if (activeFilterBadge) {
        if (currentSelectedLabel) {
          activeFilterBadge.textContent = `· 标签：${currentSelectedLabel}`;
        } else {
          activeFilterBadge.textContent = '';
        }
      }

      if (questions.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:48px 20px;color:var(--text-muted);background:var(--bg-subtle);border-radius:var(--radius-md);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 10px;display:block;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <div style="font-size:14px;font-weight:600;">暂无匹配题目</div>
            <div style="font-size:12px;margin-top:4px;">尝试切换分类或清空标签筛选</div>
            <button class="btn btn-secondary" style="margin-top:12px;padding:4px 14px;" onclick="resetAllFilters()">重置全部筛选</button>
          </div>
        `;
        return;
      }

      container.innerHTML = questions.map(q => {
        const diffClass = q.difficulty === '简单' ? 'easy' : (q.difficulty === '中等' ? 'medium' : 'hard');
        return `
          <div class="q-card" onclick="openDrawerById(${q.id})">
            <div class="q-card-top">
              <div class="q-card-title-wrap">
                <span class="q-num-badge">#${q.id < 10 ? '0' + q.id : q.id}</span>
                <h3 class="q-card-title">${q.title}</h3>
              </div>
              <div class="q-card-badges">
                <span class="badge-company">${q.company} · ${q.companyRate}</span>
                <span class="badge-diff ${diffClass}">${q.difficulty}</span>
              </div>
            </div>

            ${isReciteMode ? `
              <div class="q-summary-box">
                <strong>【30秒速记核心要点】</strong>${q.summary}
              </div>
            ` : ''}

            <div class="q-card-bottom">
              <div class="q-tags">
                <span class="q-tag" style="background:var(--primary-light);color:var(--primary);border-color:var(--primary-border);font-weight:600;">${q.label}</span>
                ${q.tags.map(t => `<span class="q-tag">${t}</span>`).join('')}
              </div>
              <div class="q-card-actions">
                <span>浏览 ${q.views}</span>
                <span>点赞 ${q.likes}</span>
                <button class="q-status-btn" onclick="event.stopPropagation();toggleQuestionMastered(${q.id}, this)">
                  未掌握
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      renderHotQuestionsLeaderboard();
    }

    function resetAllFilters() {
      currentPrimaryCat = 'backend';
      currentSubCat = 'all';
      currentSelectedLabel = null;
      currentCompany = 'all';
      currentDifficulty = 'all';
      currentType = 'all';
      if (document.getElementById('companySelect')) document.getElementById('companySelect').value = 'all';
      if (document.getElementById('difficultySelect')) document.getElementById('difficultySelect').value = 'all';
      if (document.getElementById('typeSelect')) document.getElementById('typeSelect').value = 'all';
      renderSubjectModule();
      showToast('已重置全部筛选');
    }

    // 渲染右侧热榜题目
    function renderHotQuestionsLeaderboard() {
      const container = document.getElementById('hotQuestionsList');
      if (!container) return;

      const topQuestions = QUESTIONS_DATA.slice(0, 7);
      container.innerHTML = topQuestions.map((q, idx) => `
        <div class="rank-item" onclick="openDrawerById(${q.id})">
          <div class="rank-left">
            <span class="rank-num ${idx === 0 ? 'top-1' : (idx === 1 ? 'top-2' : (idx === 2 ? 'top-3' : ''))}">${idx + 1}</span>
            <span class="rank-title">${q.title}</span>
          </div>
          <span class="rank-score">${q.views}</span>
        </div>
      `).join('');
    }

    // ==========================================================================
    // 8. 沉浸式题解抽屉 (Drawer) 逻辑
    // ==========================================================================
    function openDrawerById(qId) {
      activeQuestionId = qId;
      const q = QUESTIONS_DATA.find(item => item.id === qId);
      if (!q) return;

      const drawer = document.getElementById('drawerOverlay');
      const titleEl = document.getElementById('drawerTitle');
      const badgesEl = document.getElementById('drawerBadges');
      const bodyEl = document.getElementById('drawerBody');
      const likeCountEl = document.getElementById('drawerLikeCount');

      titleEl.textContent = q.title;
      likeCountEl.textContent = q.likes;

      const diffClass = q.difficulty === '简单' ? 'easy' : (q.difficulty === '中等' ? 'medium' : 'hard');
      badgesEl.innerHTML = `
        <span class="q-num-badge">#${q.id}</span>
        <span class="badge-company">${q.company} · ${q.companyRate}</span>
        <span class="badge-diff ${diffClass}">${q.difficulty}</span>
        <span class="q-tag" style="background:var(--primary-light);color:var(--primary);border-color:var(--primary-border);">${q.label}</span>
      `;

      switchDrawerTab(0);
      drawer.classList.add('active');
    }

    function closeDrawer(event) {
      if (event && event.target !== document.getElementById('drawerOverlay')) return;
      document.getElementById('drawerOverlay').classList.remove('active');
    }

    function switchDrawerTab(tabIndex, el) {
      if (el) {
        document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
      }

      const q = QUESTIONS_DATA.find(item => item.id === activeQuestionId);
      if (!q) return;
      const bodyEl = document.getElementById('drawerBody');

      if (tabIndex === 0) {
        // 官方深度解析
        bodyEl.innerHTML = `
          <div class="duck-tip-box">${q.duckTip}</div>
          ${q.solutionHtml}
        `;
      } else if (tabIndex === 1) {
        // 考官常考要点 & 追问
        bodyEl.innerHTML = `
          <div class="solution-h3">大厂面试官高频连环追问陷阱</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
            ${(q.followUps || []).map(f => `
              <div style="background:var(--bg-subtle);border-left:3px solid var(--duck-yellow);padding:12px 16px;border-radius:4px;font-size:13px;line-height:1.6;">
                ${f}
              </div>
            `).join('')}
          </div>
        `;
      } else if (tabIndex === 2) {
        // 微服务底层接口数据 (JSON)
        bodyEl.innerHTML = `
          <div class="solution-h3">sf-club-subject 微服务原始接口报文</div>
          <p style="font-size:12px;color:var(--text-muted);">网关调用路径：<code>POST http://127.0.0.1:5000/subject/querySubjectInfo</code></p>
          <div class="code-block-wrap">
            <pre><code>${JSON.stringify(q.rawJson || {}, null, 2)}</code></pre>
          </div>
        `;
      }
    }

    function navigateDrawerQuestion(delta) {
      const currentIndex = QUESTIONS_DATA.findIndex(item => item.id === activeQuestionId);
      const nextIndex = currentIndex + delta;
      if (nextIndex >= 0 && nextIndex < QUESTIONS_DATA.length) {
        openDrawerById(QUESTIONS_DATA[nextIndex].id);
      } else {
        showToast(delta > 0 ? '已是最后一题' : '已是第一题');
      }
    }

    function toggleMasterCurrentDrawer() {
      const btn = document.getElementById('drawerMasteredBtn');
      if (btn.classList.contains('mastered')) {
        btn.classList.remove('mastered');
        btn.textContent = '标记为已掌握';
        showToast('已取消掌握标记');
      } else {
        btn.classList.add('mastered');
        btn.textContent = '✓ 已掌握';
        showToast('太棒了！已标记为熟练掌握');
      }
    }

    function toggleLikeCurrentDrawer() {
      const countEl = document.getElementById('drawerLikeCount');
      let val = parseInt(countEl.textContent, 10);
      val += 1;
      countEl.textContent = val;
      showToast('点赞成功！感谢贡献热度');
    }

    function copyCode(btn) {
      const codeBlock = btn.closest('.code-block-wrap').querySelector('pre code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
          btn.textContent = '已复制！';
          setTimeout(() => btn.textContent = '复制代码', 1500);
          showToast('代码已复制到剪贴板');
        });
      }
    }

    function toggleQuestionMastered(qId, btn) {
      if (btn.classList.contains('mastered')) {
        btn.classList.remove('mastered');
        btn.textContent = '未掌握';
      } else {
        btn.classList.add('mastered');
        btn.textContent = '✓ 已掌握';
        showToast('已加入熟练掌握清单');
      }
    }

    // ==========================================================================
    // 9. 在线考场机考交互状态机 (Practice Exam Engine)
    // ==========================================================================
    function startOfficialExam(examName) {
      document.getElementById('practiceSetupView').style.display = 'none';
      document.getElementById('practiceExamView').style.display = 'flex';
      document.getElementById('examTitle').textContent = examName;
      examCurrentIndex = 0;
      examUserAnswers = {};
      examFlagged = {};
      renderExamQuestion();
      renderExamSheet();
      showToast('考试开始！倒计时开始');
    }

    function startCustomPractice() {
      startOfficialExam('专项自适应组卷模拟考场 (10题)');
    }

    function renderExamQuestion() {
      const q = PRACTICE_EXAM_DATA[examCurrentIndex];
      if (!q) return;

      document.getElementById('examQType').textContent = q.type;
      document.getElementById('examQProgress').textContent = `第 ${examCurrentIndex + 1} / ${PRACTICE_EXAM_DATA.length} 题`;
      document.getElementById('examQTitle').textContent = `${examCurrentIndex + 1}. ${q.title}`;

      const optionsList = document.getElementById('examOptionsList');
      optionsList.innerHTML = q.options.map((opt, idx) => {
        const isSelected = examUserAnswers[examCurrentIndex] === idx;
        const letter = String.fromCharCode(65 + idx);
        return `
          <div class="exam-option-item ${isSelected ? 'selected' : ''}" onclick="selectExamOption(${idx})">
            <span class="option-letter">${letter}</span>
            <span>${opt}</span>
          </div>
        `;
      }).join('');
    }

    function selectExamOption(optionIndex) {
      examUserAnswers[examCurrentIndex] = optionIndex;
      renderExamQuestion();
      renderExamSheet();
    }

    function examNextQuestion() {
      if (examCurrentIndex < PRACTICE_EXAM_DATA.length - 1) {
        examCurrentIndex += 1;
        renderExamQuestion();
        renderExamSheet();
      } else {
        showToast('已到达最后一题，确认无误可点击右上角交卷！');
      }
    }

    function examPrevQuestion() {
      if (examCurrentIndex > 0) {
        examCurrentIndex -= 1;
        renderExamQuestion();
        renderExamSheet();
      }
    }

    function examFlagQuestion() {
      examFlagged[examCurrentIndex] = !examFlagged[examCurrentIndex];
      renderExamSheet();
      showToast(examFlagged[examCurrentIndex] ? '已标记此题待复查' : '已取消标记');
    }

    function jumpToExamQuestion(index) {
      examCurrentIndex = index;
      renderExamQuestion();
      renderExamSheet();
    }

    function renderExamSheet() {
      const grid = document.getElementById('examSheetGrid');
      if (!grid) return;

      grid.innerHTML = PRACTICE_EXAM_DATA.map((_, idx) => {
        let statusClass = '';
        if (idx === examCurrentIndex) {
          statusClass = 'current';
        } else if (examFlagged[idx]) {
          statusClass = 'flagged';
        } else if (examUserAnswers[idx] !== undefined) {
          statusClass = 'done';
        }
        return `
          <button class="sheet-btn ${statusClass}" onclick="jumpToExamQuestion(${idx})">
            ${idx + 1}
          </button>
        `;
      }).join('');
    }

    function submitExam() {
      let score = 0;
      PRACTICE_EXAM_DATA.forEach((q, idx) => {
        if (examUserAnswers[idx] === q.correct) {
          score += 10;
        }
      });

      document.getElementById('reportScore').textContent = `${score} 分`;
      renderRadarChart();
      openModal('reportModalOverlay');
    }

    // 纯原生 SVG 六维技能雷达图渲染 (无任何外部图表库依赖)
    function renderRadarChart() {
      const container = document.getElementById('radarChartContainer');
      if (!container) return;

      // 6 个维度指标
      const dimensions = [
        { label: 'Java/JVM', val: 0.94 },
        { label: 'JUC并发', val: 0.92 },
        { label: 'Redis', val: 0.95 },
        { label: 'MySQL', val: 0.88 },
        { label: '微服务', val: 0.93 },
        { label: '算法', val: 0.85 }
      ];

      const cx = 160, cy = 120, r = 85;
      const angleStep = (Math.PI * 2) / 6;

      // 生成多边形网格线
      let gridLines = '';
      [0.25, 0.5, 0.75, 1].forEach(scale => {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = i * angleStep - Math.PI / 2;
          pts.push(`${cx + Math.cos(a) * r * scale},${cy + Math.sin(a) * r * scale}`);
        }
        gridLines += `<polygon points="${pts.join(' ')}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`;
      });

      // 生成数据多边形
      const dataPts = [];
      let labelsSvg = '';
      for (let i = 0; i < 6; i++) {
        const a = i * angleStep - Math.PI / 2;
        const valR = r * dimensions[i].val;
        dataPts.push(`${cx + Math.cos(a) * valR},${cy + Math.sin(a) * valR}`);

        // 文字位置
        const textR = r + 16;
        const tx = cx + Math.cos(a) * textR;
        const ty = cy + Math.sin(a) * textR;
        labelsSvg += `<text x="${tx}" y="${ty + 4}" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">${dimensions[i].label}</text>`;
      }

      container.innerHTML = `
        <svg width="320" height="240" viewBox="0 0 320 240">
          ${gridLines}
          <polygon points="${dataPts.join(' ')}" fill="rgba(22, 119, 255, 0.2)" stroke="#1677ff" stroke-width="2"/>
          ${labelsSvg}
        </svg>
      `;
    }

    // ==========================================================================
    // 10. AI 模拟面试与简历分析引擎
    // ==========================================================================
    function simulateResumeUpload() {
      showToast('正在解析《随风_Java高级架构师.pdf》...');
      setTimeout(() => {
        document.getElementById('extractedSkillTags').innerHTML = `
          <span class="q-tag" style="background:var(--success-light);color:var(--success);border-color:var(--success-border);font-weight:600;">✓ Spring Cloud Alibaba</span>
          <span class="q-tag" style="background:var(--success-light);color:var(--success);border-color:var(--success-border);font-weight:600;">✓ Redis 7.0 深度</span>
          <span class="q-tag" style="background:var(--success-light);color:var(--success);border-color:var(--success-border);font-weight:600;">✓ JUC 锁与线程池</span>
          <span class="q-tag" style="background:var(--success-light);color:var(--success);border-color:var(--success-border);font-weight:600;">✓ MySQL 性能调优</span>
          <span class="q-tag" style="background:var(--success-light);color:var(--success);border-color:var(--success-border);font-weight:600;">✓ Seata 事务实践</span>
        `;
        showToast('简历技能画像提取完成！AI 考官已就位');
      }, 800);
    }

    function fillSampleAnswer() {
      const input = document.getElementById('candidateAnswerInput');
      input.value = `缓存穿透是指查询一个完全不存在的数据，导致直接打到底层数据库。解决办法是在网关层使用布隆过滤器（BloomFilter）进行快速拦截，同时针对查询为空的数据设置短时 TTL 空缓存。
缓存击穿是指单一超高并发的热点 Key 在过期瞬间海量请求压垮 DB。解决办法是利用 Redisson 互斥分布式锁，仅允许 1 个线程回源查库回填缓存，其余自旋等待；同时配合后台异步延期任务保证逻辑永不过期。`;
      showToast('已填入满分规范回答');
    }

    function sendInterviewAnswer() {
      const input = document.getElementById('candidateAnswerInput');
      const text = input.value.trim();
      if (!text) {
        showToast('作答内容不能为空');
        return;
      }

      const chatBox = document.getElementById('interviewChatMessages');

      // 追加候选人回答
      const candMsg = document.createElement('div');
      candMsg.className = 'chat-msg candidate';
      const formattedText = text.split('\n').join('<br>');
      candMsg.innerHTML = `
        <div class="avatar" style="background:var(--primary);color:#fff;">我</div>
        <div class="chat-bubble">${formattedText}</div>
      `;
      chatBox.appendChild(candMsg);
      input.value = '';
      chatBox.scrollTop = chatBox.scrollHeight;

      // 模拟 AI 考官回复
      setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-msg interviewer';
        aiMsg.innerHTML = `
          <div class="avatar" style="background:#0f172a;color:#fff;">AI</div>
          <div class="chat-bubble">
            <strong>【考官点评与连环追问】</strong><br>
            回答非常清晰，抓住了布隆过滤器与互斥分布式锁的核心机制！<br>
            <strong>深度追问：</strong>既然您提到用 Redisson 互斥锁，请问在 Redis 主从复制场景下，若 Master 节点刚加锁完毕未来得及同步给 Slave 就宕机了，发生主从切换后如何避免锁丢失（多客户端同时获取到锁）的问题？
          </div>
        `;
        chatBox.appendChild(aiMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        showToast('AI 考官已给出专业评价与连环追问！');
      }, 1000);
    }

    function resetInterviewChat() {
      document.getElementById('interviewChatMessages').innerHTML = `
        <div class="chat-msg interviewer">
          <div class="avatar" style="background:#0f172a;color:#fff;">AI</div>
          <div class="chat-bubble">
            您好随风同学！我是今天的第一轮技术考官。我详细阅读了您的简历，看到您在项目中重度使用了 Redis 并且设计了分布式锁。请结合具体的并发业务场景，详细谈谈 <strong>Redis 缓存穿透与缓存击穿的区别</strong>，以及您在工程中是如何落地多级防线设计的？
          </div>
        </div>
      `;
      showToast('面试对话已重置');
    }

    // ==========================================================================
    // 11. 技术圈子动态发布与敏感词过滤拦截 (sf-club-circle 接口规范)
    // ==========================================================================
    function renderCircleMoments() {
      const container = document.getElementById('circleMomentsList');
      if (!container) return;

      container.innerHTML = CIRCLE_MOMENTS_DATA.map(m => `
        <div class="moment-card">
          <div class="moment-header">
            <div class="moment-user-info">
              <div class="avatar">${m.avatar}</div>
              <div>
                <div style="font-weight:700;font-size:14px;color:var(--text-main);display:flex;align-items:center;gap:6px;">
                  ${m.author}
                  <span class="q-tag" style="background:var(--primary-light);color:var(--primary);">${m.badge}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);">${m.time} · 频道：${m.channel}</div>
              </div>
            </div>
            <button class="btn btn-secondary" style="font-size:11px;padding:2px 8px;">关注</button>
          </div>

          <div class="moment-body">${m.content}</div>

          <div class="moment-footer">
            <div class="moment-action" onclick="toggleLikeMoment(${m.id})">
              <span>点赞 (${m.likes})</span>
            </div>
            <div class="moment-action">
              <span>评论 (${m.comments.length})</span>
            </div>
          </div>

          ${m.comments.length > 0 ? `
            <div style="background:var(--bg-subtle);padding:10px 14px;border-radius:var(--radius-md);font-size:12px;display:flex;flex-direction:column;gap:6px;">
              ${m.comments.map(c => `
                <div><strong style="color:var(--primary);">${c.user}：</strong>${c.text}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    function toggleLikeMoment(id) {
      const m = CIRCLE_MOMENTS_DATA.find(item => item.id === id);
      if (m) {
        m.isLiked = !m.isLiked;
        m.likes += m.isLiked ? 1 : -1;
        renderCircleMoments();
        showToast(m.isLiked ? '已点赞动态' : '已取消点赞');
      }
    }

    function switchCircleChannel(channel, el) {
      document.querySelectorAll('.circle-channel-item').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      showToast(`已切换至【${el.textContent}】频道`);
    }

    function openCreateMomentModal() {
      openModal('momentModalOverlay');
    }

    // DFA 敏感词实时过滤算法 (防止违规发帖)
    const SENSITIVE_WORDS = ['代考', '作弊', '泄题', '兼职代写', '刷单'];
    function checkMomentSensitiveWords(text) {
      const warnEl = document.getElementById('sensitiveWarningText');
      const btn = document.getElementById('publishMomentBtn');
      const hasSensitive = SENSITIVE_WORDS.some(w => text.includes(w));
      if (hasSensitive) {
        warnEl.style.display = 'block';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      } else {
        warnEl.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }

    function doPublishMoment() {
      const channel = document.getElementById('momentChannelSelect').value;
      const content = document.getElementById('momentContentInput').value.trim();
      if (!content) {
        showToast('动态内容不能为空');
        return;
      }

      CIRCLE_MOMENTS_DATA.unshift({
        id: Date.now(),
        author: "随风",
        avatar: "风",
        badge: "SVIP",
        channel: channel,
        time: "刚刚",
        content: content,
        likes: 0,
        isLiked: false,
        comments: []
      });

      closeModal('momentModalOverlay');
      document.getElementById('momentContentInput').value = '';
      renderCircleMoments();
      showToast('动态发布成功！');
    }

    // ==========================================================================
    // 12. 个人中心各 Tab 渲染 (Profile Tabs)
    // ==========================================================================
    function switchProfileTab(tabName, el) {
      document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');
      renderProfileTabContent(tabName);
    }

    function renderProfileTabContent(tabName) {
      const container = document.getElementById('profileTabContent');
      if (!container) return;

      if (tabName === 'favorites') {
        container.innerHTML = `
          <div class="rank-list">
            <div class="rank-item" onclick="openDrawerById(1)">
              <span class="rank-title">#01 Java 中 HashMap 底层实现、扩容机制与 2 的幂次方</span>
              <span class="q-tag" style="color:var(--primary);">已掌握</span>
            </div>
            <div class="rank-item" onclick="openDrawerById(5)">
              <span class="rank-title">#05 MySQL InnoDB 为什么选用 B+ 树作为索引结构</span>
              <span class="q-tag" style="color:var(--primary);">已掌握</span>
            </div>
            <div class="rank-item" onclick="openDrawerById(7)">
              <span class="rank-title">#07 Redis 缓存穿透、击穿、雪崩区别与防线方案</span>
              <span class="q-tag" style="color:var(--warning);">复习中</span>
            </div>
          </div>
        `;
      } else if (tabName === 'mistakes') {
        container.innerHTML = `
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">以下题目在专项自测中曾作答错误，系统已智能纳入复习队列：</div>
          <div class="rank-list">
            <div class="rank-item" onclick="openDrawerById(3)">
              <span class="rank-title">#03 ThreadLocal 弱引用引用链与内存泄漏</span>
              <span style="color:var(--danger);font-size:12px;font-weight:600;">错误 2 次</span>
            </div>
            <div class="rank-item" onclick="openDrawerById(6)">
              <span class="rank-title">#06 MySQL MVCC 与 Next-Key Lock 解决幻读</span>
              <span style="color:var(--danger);font-size:12px;font-weight:600;">错误 1 次</span>
            </div>
          </div>
        `;
      } else if (tabName === 'interviews') {
        container.innerHTML = `
          <div class="rank-list">
            <div class="rank-item">
              <div>
                <div style="font-weight:600;">2025 字节跳动电商后端技术一轮 (AI 模拟)</div>
                <div style="font-size:11px;color:var(--text-muted);">2025-02-14 · 考查 Redis、JUC 锁与分库分表</div>
              </div>
              <span style="color:var(--success);font-weight:700;">92 分 · 优秀</span>
            </div>
            <div class="rank-item">
              <div>
                <div style="font-weight:600;">2025 阿里巴巴云原生分布式系统二轮 (AI 模拟)</div>
                <div style="font-size:11px;color:var(--text-muted);">2025-02-10 · 考查 Seata AT 事务与 Gateway 网关</div>
              </div>
              <span style="color:var(--primary);font-weight:700;">88 分 · 良好</span>
            </div>
          </div>
        `;
      } else if (tabName === 'auth') {
        container.innerHTML = `
          <div style="font-size:13px;line-height:1.7;">
            <div><strong>Sa-Token 鉴权状态：</strong><span style="color:var(--success);font-weight:700;">已登录 (认证通过)</span></div>
            <div><strong>Token 凭证 (Header: satoken)：</strong><code>satoken_uuid_sf_club_98a72b0c4d1e89f</code></div>
            <div><strong>当前分配角色 (Roles)：</strong><code>["SUPER_ADMIN", "SVIP_DEVELOPER"]</code></div>
            <div><strong>接口权限列表 (Permissions)：</strong><code>["subject:query", "subject:add", "practice:exam", "circle:post"]</code></div>
          </div>
        `;
      }
    }

    function openProfileEditModal() {
      showToast('资料编辑抽屉已就绪，当前各项权限正常生效');
    }

    // ==========================================================================
    // 13. 全局辅助方法 (打卡、搜索、Modal 控制、热力图)
    // ==========================================================================
    function toggleCheckIn() {
      const btn = document.getElementById('streakBtn');
      const text = document.getElementById('streakText');
      const side = document.getElementById('sideStreakDays');
      if (!isCheckedIn) {
        isCheckedIn = true;
        streakDays += 1;
        btn.classList.add('signed');
        text.textContent = `已打卡 ${streakDays} 天`;
        if (side) side.textContent = streakDays;
        showToast(`打卡成功！连续签到 ${streakDays} 天，继续保持！`);
      } else {
        showToast(`今日已完成打卡 (第 ${streakDays} 天)`);
      }
    }

    function openNoticeDrawer() {
      showToast('未读通知：收到 2 篇点赞提醒，微服务接口正常通畅！');
    }

    function openModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.add('active');
    }

    function closeModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.remove('active');
    }

    function openLoginModal() {
      openModal('loginModalOverlay');
    }

    function fillTestLoginCode() {
      document.getElementById('loginCodeInput').value = '888666';
      showToast('已自动填入微服务测试验证码');
    }

    function doWechatLogin() {
      const code = document.getElementById('loginCodeInput').value.trim();
      if (code === '888666' || code.length === 6) {
        closeModal('loginModalOverlay');
        document.getElementById('headerUserName').textContent = '随风 (SVIP)';
        showToast('微信快捷登录成功！Sa-Token 凭证已就绪');
      } else {
        showToast('请输入有效的 6 位验证码');
      }
    }

    function openSearchModal() {
      openModal('searchModalOverlay');
      setTimeout(() => {
        const input = document.getElementById('modalSearchInput');
        if (input) input.focus();
      }, 100);
    }

    function handleModalSearch(kw) {
      const resultsContainer = document.getElementById('modalSearchResults');
      if (!resultsContainer) return;
      const k = kw.trim().toLowerCase();
      if (!k) {
        resultsContainer.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">输入关键词检索 4500+ 真题...</div>';
        return;
      }

      const matches = QUESTIONS_DATA.filter(q => q.title.toLowerCase().includes(k) || q.tags.some(t => t.toLowerCase().includes(k)));
      if (matches.length === 0) {
        resultsContainer.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">未检索到相关题目</div>';
        return;
      }

      resultsContainer.innerHTML = matches.map(q => `
        <div class="rank-item" style="padding:8px 10px;" onclick="closeModal('searchModalOverlay');switchView('subject');openDrawerById(${q.id})">
          <span class="q-num-badge">#${q.id}</span>
          <span class="rank-title">${q.title}</span>
          <span class="badge-company">${q.company}</span>
        </div>
      `).join('');
    }

    function quickFilterByCompany(companyName) {
      switchView('subject');
      const select = document.getElementById('companySelect');
      if (select) {
        select.value = companyName;
        applyFilters();
      }
    }

    function renderHomeHeatmap() {
      const container = document.getElementById('homeHeatmap');
      if (!container) return;

      const levels = ['lvl-1', 'lvl-2', 'lvl-3', 'lvl-4'];
      let html = '';
      for (let i = 0; i < 30; i++) {
        const rnd = levels[Math.floor(Math.random() * levels.length)];
        html += `<div class="heat-box ${rnd}" title="刷题打卡"></div>`;
      }
      container.innerHTML = html;
    }

    function showToast(msg) {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = msg;
      container.appendChild(item);
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transition = 'opacity 0.2s';
        setTimeout(() => item.remove(), 200);
      }, 2000);
    }

    // 键盘全局快捷键支持 (⌘K / Ctrl+K 搜索，Esc 关闭抽屉弹窗)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === 'Escape') {
        closeDrawer();
        closeModal('searchModalOverlay');
        closeModal('loginModalOverlay');
        closeModal('momentModalOverlay');
        closeModal('reportModalOverlay');
      }
    });

    // 页面初始化加载
    window.addEventListener('DOMContentLoaded', () => {
      renderHomeHeatmap();
      renderSubjectModule();
    });