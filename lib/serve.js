require('console.mute');
var shell = require('shelljs');
var chalk = require('chalk');

module.exports = {
  help  : help,
  serve : serve
};


function serve(debug) {
  if(!debug) console.resume();
  shell.exec('npm start');
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('serve');
  console.info(command);
  console.info();
  console.info('Create a new module, spinner or theme.');
  console.info();
}
