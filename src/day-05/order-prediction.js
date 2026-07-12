// start
// end
// nextTick1
// nextTick2
// nextTick3
// promise1
// promise2
// nextTick inside promise
// timeout1
// timeout2
// immediate1
// immediate2
// nextTick inside immediate
// promise inside immediate

console.log('start');

setTimeout(() => console.log('timeout1'), 0);
setTimeout(() => console.log('timeout2'), 0);

Promise.resolve()
  .then(() => {
    console.log('promise1');
    process.nextTick(() => console.log('nextTick inside promise'));
  })
  .then(() => console.log('promise2'));

process.nextTick(() => console.log('nextTick1'));
process.nextTick(() => {
  console.log('nextTick2');
  process.nextTick(() => console.log('nextTick3'));
});

setImmediate(() => console.log('immediate1'));
setImmediate(() => {
  console.log('immediate2');
  process.nextTick(() => console.log('nextTick inside immediate'));
  Promise.resolve().then(() => console.log('promise inside immediate'));
});

console.log('end');
