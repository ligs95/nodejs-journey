function createBlockDetector(thresholdMs = 100) {
    let lastTime = new Date().getTime()
    const timer = setInterval(() => {
        const now = new Date().getTime()
        const ms = now - lastTime
        if (ms > thresholdMs) {
            console.log(`事件堵塞了：${ms}ms`)
        }
        lastTime = now
    }, 10)
    timer.unref();
    return {
        close: () => {
            clearInterval(timer)
        }
    }
}

const detector = createBlockDetector(100)

console.log('start')
// 正常异步任务 — 不会触发阻塞警告
setTimeout(() => {
  console.log('[500ms] 正常异步任务，不会阻塞');
}, 500);

// 模拟阻塞 — 200ms 的同步死循环
setTimeout(() => {
  console.log('\n[1000ms] 开始模拟 200ms 同步阻塞...');
  const start = Date.now();
  while (Date.now() - start < 200) {} // CPU 密集型操作
  console.log('[1000ms] 同步阻塞结束');
}, 1000);

// 模拟阻塞 — 350ms
setTimeout(() => {
  console.log('\n[2000ms] 开始模拟 350ms 同步阻塞...');
  const start = Date.now();
  while (Date.now() - start < 350) {}
  console.log('[2000ms] 同步阻塞结束');
}, 2000);

// 3.5 秒后停止检测并打印报告
setTimeout(() => {
  detector.close();
}, 3500);