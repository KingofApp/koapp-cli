var shell = require('shelljs');
var chalk = require('chalk');

module.exports = {
  help  : help,
  emulate : emulate
};


function emulate(platform) {
  if (['android', 'ios'].indexOf(platform) === -1 || !platform) return console.error(new Error('Invalid platform')); 
  shell.exec('cordova emulate ' + platform);
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('emulate') + chalk.blue('<platform>');
  console.info(command);
  console.info();
  console.info('Emulate your app.');
  console.info();
}
