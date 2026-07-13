// const result = await withTimeout(fetchData(), 5000);
// // 如果 fetchData 在 5 秒内完成，返回结果
// // 否则抛出 TimeoutError

// const result = await withTimeout(fetchData(), 5000, '默认值');
// // 超时时返回默认值而非抛错

function withTimeout(fn, timeout, defaultValue) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      // defaultValue 为 undefined 时（未提供默认值），抛错；否则返回默认值
      if (defaultValue === undefined) {
        reject(new Error(`操作超时 (${timeout}ms)`));
      } else {
        resolve(defaultValue);
      }
    }, timeout);

    Promise.resolve(fn())
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("数据");
    }, 1000);
  });
}

async function main() {
  const result = await withTimeout(fetchData, 500);
  //   const result = await withTimeout(fetchData, 500, "默认值");
  console.log(result);
}

main();
