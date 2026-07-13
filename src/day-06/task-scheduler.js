// **要求**：
// - 支持设置最大并发数
// - 返回所有任务的结果（类似 `Promise.allSettled`）
// - 提供进度事件（继承 EventEmitter）
// - 支持任务优先级
const { EventEmitter } = require("node:events");

class TaskScheduler extends EventEmitter {
  constructor(maxConcurrency) {
    super();
    this.maxConcurrency = maxConcurrency;
    this.queue = [];
  }

  addTask(task) {
    // priority 优先级, // fn 任务函数
    this.queue.push({ priority: task.priority, fn: task.fn });
  }

  async run() {
    const tasks = [...this.queue].sort((a, b) => a.priority - b.priority);
    const results = new Array(tasks.length);
    const running = new Set();

    for (let i = 0; i < tasks.length; i++) {
      this.emit("progress", i + 1, tasks.length);
      const promise = tasks[i]
        .fn()
        .then((value) => {
          results[i] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[i] = { status: "rejected", reason };
        })
        .finally(() => {
          running.delete(promise);
          this.emit("task-done", i + 1, tasks.length);
        });

      running.add(promise);

      if (running.size >= this.maxConcurrency) {
        await Promise.race(running);
      }
    }

    await Promise.allSettled(running);
    return results;
  }
}

const asyncTask = async (taskId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`任务 ${taskId} 执行完成`);
    }, 1000);
  });
};

async function main() {
  const scheduler = new TaskScheduler(3); // 最大并发数 3

  scheduler.on("progress", (current, total) => {
    console.log(`进度: ${current}/${total}`);
  });
  scheduler.on("task-done", (current, total) => {
    console.log(`任务 ${current}/${total} 已完成`);
  });

  scheduler.addTask({
    priority: 1,
    fn: () => asyncTask(1),
  });
  scheduler.addTask({
    priority: 2,
    fn: () => asyncTask(2),
  });
  scheduler.addTask({
    priority: 2,
    fn: () => asyncTask(3),
  });
  scheduler.addTask({
    priority: 2,
    fn: () => asyncTask(4),
  });
  scheduler.addTask({
    priority: 2,
    fn: () => asyncTask(5),
  });
  scheduler.addTask({
    priority: 2,
    fn: () => asyncTask(6),
  });
  scheduler.addTask({
    priority: 3,
    fn: () => asyncTask(7),
  });
  // ... 添加 10 个任务

  const results = await scheduler.run();
  // 同一时刻最多只有 3 个任务在执行
  console.log(results);
}

main();
