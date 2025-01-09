// simulate launching as nodemon does (piped stdin)

require('child_process').spawn('node', ['middle.js'], {
	stdio: ['pipe', 'inherit', 'inherit'],
});
