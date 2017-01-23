var shell = require('shelljs');
var chalk = require('chalk');

module.exports = {
  help  : help,
  init  : init
}


function init(projectName) {
  if(!projectName) return console.error('Plugin name is mandatory');

  var clone = 'git clone https://github.com/KingofApp/com.kingofapp.visualizer';
  var cordova = 'cordova create ' + projectName + ' --link-to=com.kingofapp.visualizer/www';

  shell.mkdir(projectName);
  shell.cd(projectName);
  shell.exec(clone, function(err, data) {
    shell.exec(cordova, function(err, data) {
      console.log('Cordova project has been created')
    });
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  console.info(command);
  console.info();
  console.info('  Create a new Cordova Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.');
  console.info();
}
