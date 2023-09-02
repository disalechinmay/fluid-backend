const { exec } = require('child_process');

exec('tsc', (error, stdout, stderr) => {
  if (error) {
    console.error(`TypeScript compilation failed: ${error}`);
    return;
  }

  console.log('TypeScript compilation successful');
});
