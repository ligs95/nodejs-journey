// 实现一个 `retry` 函数：

// ```javascript
// const data = await retry(
//   () => fetchUnstableAPI(),
//   {
//     maxRetries: 3,
//     delay: 1000,         // 初始延迟 1 秒
//     backoff: 'exponential', // 指数退避：1s, 2s, 4s
//     onRetry: (error, attempt) => {
//       console.log(`第 ${attempt} 次重试，错误: ${error.message}`);
//     },
//   }
// );
// ```
function delayFn(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function retry(fn, config) {
  const maxRetries = config.maxRetries;

  async function attempt(currentRetry = 0) {
    try {
      // 首次调用不延迟，仅在重试前延迟
      return await fn();
    } catch (error) {
      if (currentRetry < maxRetries) {
        const nextRetry = currentRetry + 1;

        // 计算延迟时间
        let delay = config.delay;
        if (config.backoff === "exponential") {
          // 指数退避：1s, 2s, 4s, ...
          delay = config.delay * Math.pow(2, currentRetry);
        }

        await delayFn(delay);

        if (config.onRetry) {
          config.onRetry(error, nextRetry);
        }

        return await attempt(nextRetry);
      } else {
        throw error;
      }
    }
  }

  return await attempt(0);
}

let count = 0;
function errorFn() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      count++;
      if (count < 3) {
        reject(new Error(`错误 ${count}`));
      } else {
        resolve("成功");
      }
    }, 1000);
  });
}

async function main() {
  const data = await retry(() => errorFn(), {
    maxRetries: 3,
    delay: 1000, // 初始延迟 1 秒
    backoff: "exponential", // 指数退避：1s, 2s, 4s
    onRetry: (error, attempt) => {
      console.log(`第 ${attempt} 次重试，错误: ${error.message}`);
    },
  });
  console.log(data);
}

main();
