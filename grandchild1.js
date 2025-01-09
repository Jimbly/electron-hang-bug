console.log(process.pid, 'grandchild1 started');
// also triggers it: process.stdin.resume();
process.stdin.on('data', console.log);
