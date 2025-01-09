// only happens if this is imported in a ESM module style
import('process').then(function (mod) {
  console.log('import(node:process) completed'); // this line is never executed
});

console.log(process.pid, `grandchild2 started - if you don't see "not stuck" below, it's stuck`);
setInterval(function () {
  console.log(process.pid, 'not stuck');
}, 1000);
