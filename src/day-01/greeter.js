const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('请输入你的名字: ', (name) => {
  rl.question('请输入你的年龄: ', (age) => {
    console.log(`你好, ${name.trim()}！你今年 ${age.trim()} 岁。`);
    rl.close();
  });
});
