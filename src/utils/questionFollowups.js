/**
 * 智能生成与题目强相关的“考官常考要点 & 常见连环追问”及“避坑提示”
 * 杜绝无脑静态硬编码，根据题目题干、标签与解析内容智能分类匹配
 */

export function getFollowupInfo(question) {
  if (!question) {
    return getDefaultFollowup('技术通用')
  }

  const title = (question.title || question.subjectName || '').toLowerCase()
  const labels = Array.isArray(question.labels)
    ? question.labels.join(' ').toLowerCase()
    : (question.labels || '').toLowerCase()
  const content = (question.summary || question.answer || question.subjectParse || '').toLowerCase()
  const fullText = `${title} ${labels} ${content}`

  // 1. JVM / 指令重排 / volatile / 内存屏障 / 类加载 / GC
  if (
    fullText.includes('重排序') ||
    fullText.includes('volatile') ||
    fullText.includes('内存屏障') ||
    fullText.includes('happens-before') ||
    fullText.includes('jvm') ||
    fullText.includes('类加载') ||
    fullText.includes('双亲委派') ||
    fullText.includes('垃圾回收') ||
    fullText.includes('gc') ||
    fullText.includes('oom') ||
    fullText.includes('元空间')
  ) {
    if (fullText.includes('重排序') || fullText.includes('volatile') || fullText.includes('内存屏障')) {
      return {
        pitfalls:
          '很多求职者只背诵 volatile 保证可见性和禁止重排序，却无法解释为什么不能保证原子性（如 count++ 不是原子操作），或者无法说出底层通过 StoreLoad 内存屏障和 lock 前缀指令防止指令重排的具体时机。面试时务必结合单例模式 DCL 或 Unsafe 源码展开。',
        followupList: [
          {
            question: 'volatile 除了防止重排序，如何保证变量在多核 CPU 下的可见性？底层汇编指令（如 lock 前缀指令）做了什么？',
            strategy: '结合 CPU 缓存一致性协议（MESI 状态转移）与 Lock 前缀指令引发的写缓冲区立即刷新主存、总线嗅探广播机制展开。'
          },
          {
            question: '在 DCL 单例中如果不加 volatile，具体会在什么汇编指令执行乱序下出现空指针或拿到半初始化对象？',
            strategy: '详述 JVM 字节码中的 new、invokespecial（构造函数）、astore（引用赋值）乱序场景，导致其他线程在第一次 null 判断时直接返回未初始化对象。'
          },
          {
            question: 'JMM 定义的 4 类内存屏障（LoadLoad, StoreStore, LoadStore, StoreLoad）各自的作用是什么？为什么 StoreLoad 开销最大？',
            strategy: '阐述读写屏障的阻止重排规则，说明 StoreLoad 必须清空写缓冲区（Store Buffer）并强制等待所有处理器核心流水线同步，因此成本最高。'
          }
        ]
      }
    }

    if (fullText.includes('gc') || fullText.includes('垃圾回收') || fullText.includes('oom')) {
      return {
        pitfalls:
          '谈及 GC 调优时切忌直接报参数（如 -Xmx、-XX:NewRatio），考官核心考查的是排查思维：从线上告警、jstat 监控频率、jstack 线程堆栈到 jmap / MAT 内存分块分析的系统化链路。',
        followupList: [
          {
            question: 'CMS 收集器与 G1 收集器在处理并发标记时的三色标记算法有什么差异？如何分别解决漏标（错删活跃对象）问题？',
            strategy: '对比 CMS 的增量更新（Incremental Update）与 G1 的原始快照（SATB - Snapshot At The Beginning）机制与写屏障应用。'
          },
          {
            question: '线上服务频繁触发 Full GC 但 Old 区内存占用并不高，可能的原因有哪些？如何排查定位？',
            strategy: '分析元空间 Metaspace 溢出、显式调用 System.gc()、DirectByteBuffer 堆外直接内存不足或大对象分配等深层原因。'
          },
          {
            question: 'ZGC 是如何实现无论堆多大都能将 STW 停顿控制在毫秒级以内的？读屏障与着色指针起到了什么作用？',
            strategy: '阐述着色指针（Colored Pointers）标记对象代龄/存活状态，读屏障在引用访问时原地修复指针（Self-Healing），实现并发标记与并发转移。'
          }
        ]
      }
    }

    return {
      pitfalls:
        '类加载机制要讲清双亲委派机制的真正动机（保障核心 JDK 类的安全性与唯一性），以及在 Tomcat、SPI、OSGi 等场景下为什么要打破双亲委派。',
      followupList: [
        {
          question: 'Tomcat 作为一个 Web 容器，为什么要打破 JVM 默认的双亲委派机制？它的类加载器拓扑是怎样的？',
          strategy: '从多个 WebApp 应用间隔离、同一类库不同版本共存、Tomcat 自身类库与应用类库隔离三重诉求论述 CommonClassLoader 与 WebAppClassLoader。'
        },
        {
          question: 'JDBC DriverClass 是如何利用线程上下文类加载器（Thread Context ClassLoader）打破双亲委派的？',
          strategy: '说明 rt.jar 中的 DriverManager 位于 BootstrapClassLoader，无法直接加载第三方厂商在 ClassPath 下的实现类，因此借助上下文加载器委托加载。'
        },
        {
          question: 'Java 9 模块化（JPMS）对类加载器机制带来了哪些重构？',
          strategy: '阐述 Platform ClassLoader 替代 Extension ClassLoader，以及类加载委派从单一线性链式向模块图路径映射的转变。'
        }
      ]
    }
  }

  // 2. MySQL / 数据库 / 事务 / 索引 / MVCC
  if (
    fullText.includes('mysql') ||
    fullText.includes('innodb') ||
    fullText.includes('索引') ||
    fullText.includes('b+树') ||
    fullText.includes('事务') ||
    fullText.includes('mvcc') ||
    fullText.includes('隔离级别') ||
    fullText.includes('幻读') ||
    fullText.includes('慢查询') ||
    fullText.includes('explain') ||
    fullText.includes('redo') ||
    fullText.includes('undo') ||
    fullText.includes('binlog')
  ) {
    return {
      pitfalls:
        '谈及 MySQL 事务隔离时，切记不可笼统说“RR 级别彻底消除了幻读”。必须精准区分快照读（MVCC ReadView 控制）与当前读（通过 Next-Key Lock 临键锁控制），以及唯一索引等值查询下的锁退化边界。',
      followupList: [
        {
          question: 'MySQL InnoDB 在 RR 隔离级别下，什么具体场景下仍然会出现幻读现象？',
          strategy: '举例说明：事务 A 第一次快照读未见新记录，事务 B 插入并提交，事务 A 紧接着执行当前读或 UPDATE 更新该行，更新后将其纳入自己的 ReadView 产生幻读。'
        },
        {
          question: '一条 UPDATE 语句执行时，Redo Log、Undo Log 与 Binlog 的两阶段提交（2PC）时序是怎样的？若此时机器断电如何恢复？',
          strategy: '详述 prepare 阶段写 Redo Log、Server 层写 Binlog、最终 commit 阶段。崩溃恢复时依据 Binlog 是否完整决定提交或回滚。'
        },
        {
          question: '联合索引 (a, b, c) 在遇到 `where a = 1 and b > 2 order by c` 时，能否利用索引消除 filesort？为什么？',
          strategy: '结合 B+ 树多列索引物理存储规则，说明 b > 2 属于范围查询，会打断后序字段 c 的全局有序性，因此无法避免 Using filesort。'
        }
      ]
    }
  }

  // 3. Redis / 缓存 / 分布式锁
  if (
    fullText.includes('redis') ||
    fullText.includes('缓存') ||
    fullText.includes('redisson') ||
    fullText.includes('redlock') ||
    fullText.includes('雪崩') ||
    fullText.includes('击穿') ||
    fullText.includes('穿透') ||
    fullText.includes('跳表') ||
    fullText.includes('aof') ||
    fullText.includes('rdb')
  ) {
    return {
      pitfalls:
        '分布式锁回答切忌只背诵“SET key value NX PX”。必须提到释放锁时校验 UUID 的原子 Lua 脚本、Redisson 看门狗定时续期机制，以及主从异步复制下 Master 宕机导致锁丢失的应对策略。',
      followupList: [
        {
          question: '使用 Redis 实现分布式锁时，如果业务处理时间超过了锁的超时时间导致锁失效，Redisson 底层 Watchdog 是如何实现自动续期的？',
          strategy: '详述 Watchdog 默认 30s/3 = 10s 发起一次后台定时任务，通过 Lua 脚本检查线程持有者并刷新 TTL，以及在 unlock 时 cancel 调度。'
        },
        {
          question: 'Redis 缓存与数据库双写一致性中，“先更数据库再删缓存”在极端高并发下有什么漏洞？工业级最终一致性如何落地？',
          strategy: '分析读写并发穿插下的微小脏数据窗口，提出 Canal 监听 Binlog 增量订阅 + MQ 异步可靠重试投递的生产解耦标准方案。'
        },
        {
          question: 'Redis 6.0 引入多线程网络模型后，具体哪些操作交给了多线程？命令执行本身是否依然是单线程？',
          strategy: '强调核心指令执行依然在主线程单线程严格串行保障原子性，多线程仅负责网络 Socket 的多路复用读写数据包与协议解析。'
        }
      ]
    }
  }

  // 4. 并发编程 / JUC / 锁 / 线程池
  if (
    fullText.includes('并发') ||
    fullText.includes('线程') ||
    fullText.includes('lock') ||
    fullText.includes('aqs') ||
    fullText.includes('synchronized') ||
    fullText.includes('reentrantlock') ||
    fullText.includes('threadlocal') ||
    fullText.includes('cas') ||
    fullText.includes('atomic') ||
    fullText.includes('死锁')
  ) {
    return {
      pitfalls:
        '很多求职者设定线程池参数只会套用 CPU 密集型 N+1、IO 密集型 2N 的死板公式。考官更看重的是对无界队列引发 OOM 风险的警惕，以及动态线程池调节、拒绝策略降级落库的线上实战方案。',
      followupList: [
        {
          question: 'synchronized 在 JDK 1.6 之后的锁膨胀（升级）完整链路是怎样的？重量级锁在释放后可以降级吗？',
          strategy: '剖析 Mark Word 状态：无锁 -> 偏向锁（已废弃/逐渐淘汰） -> 轻量级锁（CAS） -> 重量级锁（Monitor），说明锁降级仅在全局安全点发生且条件极其严苛。'
        },
        {
          question: 'AQS 的 CLH 变体队列是如何通过 CAS 实现无锁入队与竞争唤醒的？条件队列（Condition）如何与同步队列交互？',
          strategy: '说明 tail 节点的 CAS 自旋入队，head 节点释放锁时 unparkSuccessor 唤醒后继，以及 signal() 将 Node 从 ConditionObject 队列迁移至同步队列尾部。'
        },
        {
          question: 'ThreadLocal 底层 ThreadLocalMap 的弱引用 Key 在垃圾回收后，为什么依然可能引发内存泄漏？线上如何防护？',
          strategy: '强调 Key 为弱引用被 GC 后变为 null，但 Value 仍被强引用链路（Thread -> ThreadLocalMap -> Entry -> Value）持有，必须在 finally 中显式 remove()。'
        }
      ]
    }
  }

  // 5. 集合框架 (HashMap, ConcurrentHashMap, ArrayList, etc.)
  if (
    fullText.includes('hashmap') ||
    fullText.includes('concurrenthashmap') ||
    fullText.includes('arraylist') ||
    fullText.includes('linkedlist') ||
    fullText.includes('集合') ||
    fullText.includes('数组') ||
    fullText.includes('list') ||
    fullText.includes('map')
  ) {
    if (fullText.includes('arraylist') || fullText.includes('array')) {
      return {
        pitfalls:
          '比较 ArrayList 和 Array 时，不可只说“一个定长一个变长”。务必结合底层连续物理内存分配带来的 CPU 缓存行（Cache Line）局部性优势、泛型擦除机制以及扩容时 1.5 倍的 Arrays.copyOf 内存复制开销作答。',
        followupList: [
          {
            question: 'ArrayList 的扩容因子为什么选择 1.5 倍而不是 2 倍？扩容过程中内存重分配与数组拷贝的开销如何规避？',
            strategy: '从内存碎片复用角度论述：1.5 倍扩容能在后续释放后复用前面回收的内存块（k 倍求和），建议在预知数据量时初始化容量（initialCapacity）。'
          },
          {
            question: '在多线程环境下使用 ArrayList 会引发什么具体异常或数据问题？CopyOnWriteArrayList 是如何保证读写安全的？',
            strategy: '分析 elementData[size++] 复合操作导致的数组越界或元素覆盖，详解 CopyOnWriteArrayList 的写时复制（ReentrantLock + volatile 数组）与最终一致性。'
          },
          {
            question: 'ArrayList 在遍历删除元素时，使用增强 for 循环为什么会抛出 ConcurrentModificationException？正确的删除方式是什么？',
            strategy: '剖析 modCount != expectedModCount 快速失败（fail-fast）校验，给出 Iterator.remove()、倒序遍历或 removeIf() 的标准解法。'
          }
        ]
      }
    }

    return {
      pitfalls:
        '回答 HashMap 时切忌死记硬背阈值 8 和 64，应结合源码注释中泊松分布概率（链表长度达到 8 的概率不足千万分之一）以及红黑树占用内存空间为链表两倍的权衡展开。',
      followupList: [
        {
          question: '如果对象 hashCode() 相同但 equals() 不同，HashMap 底层具体如何处理冲突？红黑树节点比较的 tieBreakOrder 规则是什么？',
          strategy: '结合红黑树节点的 TreeNode 比较逻辑、Comparable 接口实现、以及 tieBreakOrder（比较 System.identityHashCode）遍历展开。'
        },
        {
          question: '在极端并发扩容场景下，JDK 1.7 的头插法导致死循环（环形链表）的根本原因是什么？JDK 1.8 是如何通过高低位指针解决的？',
          strategy: '对比 Transfer 函数遍历指针反转导致的 Node.next 循环引用，强调 1.8 尾插法计算 (e.hash & oldCap) 严格保持原有顺序并拆分为高低链。'
        },
        {
          question: 'ConcurrentHashMap 在 JDK 1.8 中为何彻底弃用 Segment 分段锁，转而采用 CAS + synchronized？',
          strategy: '从锁粒度从 Segment 级细化到 Node 头结点、内存空间消耗以及 JVM 对内置锁 synchronized 底层自适应自旋与偏向优化的角度深入剖析。'
        }
      ]
    }
  }

  // 6. 网络与 HTTP / TCP / 客户端 IP / 安全
  if (
    fullText.includes('http') ||
    fullText.includes('tcp') ||
    fullText.includes('ip') ||
    fullText.includes('https') ||
    fullText.includes('握手') ||
    fullText.includes('挥手') ||
    fullText.includes('xss') ||
    fullText.includes('csrf') ||
    fullText.includes('跨域') ||
    fullText.includes('dns') ||
    fullText.includes('网络')
  ) {
    if (fullText.includes('真实 ip') || fullText.includes('ip') || fullText.includes('x-forwarded-for')) {
      return {
        pitfalls:
          '很多初学者以为从请求头中取 X-Forwarded-For 的第一个值就是客户端真实 IP，实际上该 Header 极易被伪造。必须结合反向代理（Nginx / CDN）受信任跳数或从右往左排除内网 IP 的防护逻辑作答。',
        followupList: [
          {
            question: '客户端请求如果经过了 CDN -> Nginx 代理集群，黑客在请求头伪造 `X-Forwarded-For: 8.8.8.8`，服务器如何获取到真正物理客户端 IP？',
            strategy: '结合 Nginx set_real_ip_from 白名单和 real_ip_header 配置，通过底层 TCP 连接的 remote_addr 逐级校验并剥离不可信头部。'
          },
          {
            question: '若全链路采用 TCP 四层负载均衡（如 LVS / F5），无法在应用层插入 HTTP Header，如何向后端应用传递客户端真实 IP？',
            strategy: '阐述 TOA（TCP Option Address）内核模块方案，或利用 HAProxy Proxy Protocol 协议头传递客户端套接字信息。'
          },
          {
            question: '在分布式日志风控系统中，通过真实 IP 进行高频恶意调用限流时，如何应对 NAT 局域网下数百人共享同一外网公网 IP 的误杀问题？',
            strategy: '结合 IP + 设备指纹（Device Fingerprint）+ 用户登录 Token 多维综合限流，并引入验证码二次人机校验。'
          }
        ]
      }
    }

    return {
      pitfalls:
        '谈及 TCP 三次握手和四次挥手时，不要只画状态转移图，一定要深刻理解为什么最后必须有 2MSL 的 TIME_WAIT 状态，以及线上大量连接处于 TIME_WAIT / CLOSE_WAIT 时的实战调优手段。',
      followupList: [
        {
          question: 'TCP 四次挥手中为什么主动断开方必须经历 2MSL 的 TIME_WAIT 状态？线上若出现数万个 TIME_WAIT 连接该如何排查治理？',
          strategy: '阐述保证最后一个 ACK 能够顺利送达以及让网络中残留旧报文彻底消亡两重保障，给出开启 tcp_tw_reuse 及应用层长连接连接池复用方案。'
        },
        {
          question: 'HTTPS 握手流程中，非对称加密和对称加密是如何配合的？ECDHE 密钥协商算法是如何实现“前向保密”（Forward Secrecy）的？',
          strategy: '区分证书验签与公钥加密生成 Premaster Secret，说明 ECDHE 每次通信生成临时公私钥对，即使服务器私钥泄露历史报文也无法破解。'
        },
        {
          question: 'XSS（跨站脚本攻击）与 CSRF（跨站请求伪造）在攻击原理上有何本质区别？现代 Web 应用的综合防御矩阵是怎样的？',
          strategy: '从执行恶意代码窃取凭据与借用已有凭据发起未授权操作对比，阐述 CSP、HttpOnly Cookie、SameSite 属性以及 CSRF Token 的联合防护。'
        }
      ]
    }
  }

  // 7. Spring 生态 / 微服务 / 分布式架构
  if (
    fullText.includes('spring') ||
    fullText.includes('bean') ||
    fullText.includes('ioc') ||
    fullText.includes('aop') ||
    fullText.includes('循环依赖') ||
    fullText.includes('微服务') ||
    fullText.includes('transactional')
  ) {
    return {
      pitfalls:
        '回答 Spring 生命周期时，务必精确梳理 Aware 接口、BeanPostProcessor 前置、InitializingBean.afterPropertiesSet、自定义 init-method 及 BeanPostProcessor 后置的执行时序，切忌颠倒顺序。',
      followupList: [
        {
          question: 'Spring 的三级缓存中，如果二级缓存也能解决循环依赖，为什么必须引入第三级工厂缓存（ObjectFactory）？',
          strategy: '强调 AOP 代理对象的延迟生成原则——只有在真正出现循环依赖时才提前调用 SmartInstantiationAwareBeanPostProcessor 生成代理对象，正常情况下统一在初始化后置中创建。'
        },
        {
          question: '@Transactional 事务失效的经典场景有哪些？同类中非事务方法调用事务方法为什么会失效？如何优雅解决？',
          strategy: '剖析 Spring AOP 基于动态代理调用的本质：内部 this.method() 绕过了代理对象，提供 AopContext.currentProxy() 或注入自身 Bean 的解法。'
        },
        {
          question: 'Spring Boot 自动装配原理中，@EnableAutoConfiguration 是如何通过 SPI 加载并生效目标配置类的？',
          strategy: '深入 AutoConfigurationImportSelector、SpringFactoriesLoader 读取配置文件，结合 @ConditionalOnClass / @ConditionalOnMissingBean 条件注解的工作机理展开。'
        }
      ]
    }
  }

  // 8. 消息队列 / 中间件
  if (
    fullText.includes('kafka') ||
    fullText.includes('rocketmq') ||
    fullText.includes('rabbitmq') ||
    fullText.includes('mq') ||
    fullText.includes('消息队列')
  ) {
    return {
      pitfalls:
        '谈及消息幂等性时，切忌只回答“加分布式锁”，考官更希望听到基于业务唯一单据号（如支付流水号、订单号）的数据库唯一索引约束或 Redis 防重 Token 兜底设计。',
      followupList: [
        {
          question: '消息队列如何做到 100% 消息不丢失？请从 Producer 发送、Broker 持久化、Consumer 消费三端分别给出保障方案。',
          strategy: '生产端同步确认或事务消息，Broker 端同步双写 + ISR 副本机制，消费端关闭 auto-commit 手动业务处理成功后再提交 ACK。'
        },
        {
          question: '线上消费者因下游接口超时导致积压了数百万条待处理消息，如何进行紧急扩容与排障处理？',
          strategy: '阐述紧急排查修复下游接口性能，临时将老 Topic 分区分流投递至包含多倍分区的新 Topic，并临时开启多倍 Consumer 实例并发加速消费。'
        },
        {
          question: 'Kafka 吞吐量极其惊人的根本原因是什么？零拷贝（Sendfile / mmap）与 OS PageCache 是如何发挥作用的？',
          strategy: '对比传统 4 次上下文切换与数据拷贝，详述顺序写磁盘（Sequential I/O）、OS PageCache 内存缓冲以及 DMA 直接网络发送。'
        }
      ]
    }
  }

  // 9. 云原生 / Docker / Kubernetes
  if (
    fullText.includes('docker') ||
    fullText.includes('kubernetes') ||
    fullText.includes('k8s') ||
    fullText.includes('容器') ||
    fullText.includes('pod')
  ) {
    return {
      pitfalls:
        '回答 Docker 原理时一定要点明“容器本质上是宿主机上的一个普通进程”，通过 Namespace 实现视图隔离，通过 Cgroups 实现资源限额，而不是传统虚拟机的硬件虚拟化。',
      followupList: [
        {
          question: 'Kubernetes 中 Pod 处于 CrashLoopBackOff 或 OOMKilled 状态，排查定位与根因分析的标准 SOP 是什么？',
          strategy: '使用 kubectl describe pod 检视终止原因（ExitCode 137 等），查看 kubectl logs --previous 排查致命异常，核验 resource limits 配额。'
        },
        {
          question: 'Docker 镜像的分层存储（UnionFS）机制是怎样的？Dockerfile 编写时有哪些减小镜像体积的最佳实践？',
          strategy: '阐述写时复制（CoW），多阶段构建（Multi-stage builds）、合并 RUN 指令、清理 apt/yum 缓存并使用 distroless/alpine 基础镜像。'
        },
        {
          question: '在容器中运行 Java 应用时，为什么常发生实际内存未超 -Xmx 却被宿主机 OOM Killer 强杀的情况？',
          strategy: '详述 JVM 进程除堆内存外还有元空间、线程栈（Xss*线程数）、直接内存及 JVM 运行时开销，并结合 JDK 8u191 容器感知支持阐述。'
        }
      ]
    }
  }

  // 10. 算法 / 智力题 / 数据结构
  if (
    fullText.includes('算法') ||
    fullText.includes('数据结构') ||
    fullText.includes('智力题') ||
    fullText.includes('瓶水') ||
    fullText.includes('小白鼠') ||
    fullText.includes('排序') ||
    fullText.includes('动态规划')
  ) {
    return {
      pitfalls:
        '面试考察算法与逻辑智力题时，面试官往往不仅看重最终结果，更关注思考建模过程（如二进制状态空间划分、边界条件处理及复杂度推导）。切忌直接背答案，一定要向考官口述推导逻辑。',
      followupList: [
        {
          question: '若题目约束发生变化：毒性发作周期变为 24 小时，但允许在 48 小时内出结果，此时最少需要多少只小白鼠？',
          strategy: '说明此时可在 24 小时和 48 小时分两轮测试，每只小白鼠的状态由 2 种（生/死）扩展为 3 种（第1轮死/第2轮死/存活），即采用 3 进制编码：3^n >= 1000，解得仅需 7 只！'
        },
        {
          question: '该解题思想在分布式系统设计中有哪些经典应用场景？',
          strategy: '类比分布式 ID 生成器中的二进制位划分（如 Snowflake 算法），以及布隆过滤器多 Hash 位图映射思想。'
        },
        {
          question: '海量数据（如 100 亿个数字中找到出现频率最高的 Top 100）在单机内存受限时如何设计分布式处理架构？',
          strategy: '详述哈希分流分治落盘至小文件，小文件内通过 HashMap 统计词频并借助最小堆（Min-Heap）维护局部 TopK，最终在 Master 节点汇总归并。'
        }
      ]
    }
  }

  // 默认根据题目名动态提取关键词组装个性化要点
  return getDefaultFollowup(question.title || '核心技术点')
}

function getDefaultFollowup(title) {
  const shortTitle = (title || '该核心考点').replace(/^[0-9\.\s、]+/, '').slice(0, 20)
  return {
    pitfalls: `在回答关于“${shortTitle}”时，切忌只罗列概念定义。大厂考官更看重底层架构设计初衷、在高并发生产场景下的边界异常处理（如空值、溢出、并发争用）以及与相关替代技术选型的权衡对比。`,
    followupList: [
      {
        question: `针对“${shortTitle}”，在极端高并发或海量数据场景下，最容易成为性能瓶颈的环节是什么？`,
        strategy: '从时间复杂度、I/O 开销、CPU 上下文切换及内存竞争等多维度剖析瓶颈根因，并给出针对性的分片、异步化或缓存优化策略。'
      },
      {
        question: `在生产环境实际落地“${shortTitle}”相关业务时，线上如何进行可观测性监控与容灾降级？`,
        strategy: '阐述核心业务埋点指标、慢请求耗时分布统计，并结合熔断（Circuit Breaker）、快速失败与兜底降级方案论述。'
      },
      {
        question: `如果由你主导系统重构，有哪些主流替代方案能进一步提升“${shortTitle}”的可靠性或维护性？`,
        strategy: '横向对比 2~3 种行业主流选型（如性能对比、运维成本、成熟度与生态），阐明选型推演的决策矩阵。'
      }
    ]
  }
}
