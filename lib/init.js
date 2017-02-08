var shell     = require('shelljs');
var chalk     = require('chalk');
var jsonfile  = require('jsonfile')

module.exports = {
  help  : help,
  init  : init
}


function init(projectName) {
  if(!projectName) return console.error('Project name is mandatory');

  var clone = 'git clone https://github.com/KingofApp/com.kingofapp.visualizer';
  var cordova = 'cordova create ' + projectName + ' --link-to=com.kingofapp.visualizer/www';

  shell.mkdir(projectName);
  shell.cd(projectName);
  shell.exec(clone, function(err, data) {
    shell.cd('com.kingofapp.visualizer');
    shell.exec('npm install && bower install', function(err) {
      if(err) return console.error(new Error('Installing node dependencies'));
      console.log('Koapp project has been created')
    });
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  console.info(command);
  console.info();
  console.info('  Create a new Koapp Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.');
  console.info();
}
