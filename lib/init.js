var shell     = require('shelljs');
var chalk     = require('chalk');
var jsonfile  = require('jsonfile');
var tools     = require('koapp');

module.exports = {
  help  : help,
  init  : init
};

var debugMode = false;
var visualizer;

function init(debug, projectName, options, env) {
  var dev = (env && (env === 'dev' || env === '--dev'));

  debugMode = debug;
  visualizer = dev ? 'com.kingofapp.visualizer.dev' : 'com.kingofapp.visualizer';

  if (projectName.indexOf('-') >= 0) return tools.debugLog(chalk.red('Project name is mandatory.'));

  var options = options || [];
  var branch = ((dev) ? 'dev' : 'master');
  var clone = `git clone -b ${branch} https://github.com/KingofApp/com.kingofapp.visualizer ${visualizer}`;
  
  tools.debugLog(chalk.green('Creating project'), debugMode);

  shell.mkdir('-p', projectName);
  shell.cd(projectName);

  tools.debugLog(chalk.green('Cloning King of App visualizer'), debugMode);

  shell.exec(clone, function(err, data) {
    if(err) return tools.debugLog(chalk.red('Error cloning com.kingofapp.visualizer'), debugMode);
    shell.cd(`${visualizer}/www`);
    shell.mkdir('-p', 'services');
    shell.cd('..');
    if(options.indexOf("--skip-deps") !== -1) tools.debugLog(chalk.green('Koapp project has been created.'), debugMode);
    else{
      tools.debugLog(chalk.red('Installing npm and bower dependencies.'), debugMode);
      shell.exec('npm install && bower install', function(err) {
        if(err) return tools.debugLog(chalk.red('Error installing node dependencies'), debugMode);

        tools.debugLog(chalk.green('Koapp project has been created'), debugMode);
      });
    }
  });
}

function help() {
  var command = chalk.yellow('koapp init <projectName>');
  tools.debugLog(command, debugMode);
  tools.debugLog('', debugMode);
  tools.debugLog('\nCreate a new Koapp Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.\n', debugMode);
  tools.debugLog('', debugMode);
}
