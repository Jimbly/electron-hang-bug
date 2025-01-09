// Simulate a build tool / dev environment
//   First launches something like electon-forge
//   Later launches another Node.js child process

const { spawn } = require('child_process');

console.log(process.pid, 'Starting grandchild1 process');
spawn('node', ['grandchild1.js'], { stdio: 'inherit' });
// Note: this also works:
// spawn('cmd', ['/c', 'pause'], { stdio: 'inherit' });

setTimeout(function () {
  console.log(process.pid, 'Starting grandchild2 process');
  spawn('node', ['grandchild2.js'], { stdio: 'inherit' });
}, 1000);
