var shell     = require('shelljs');
var chalk     = require('chalk');
var jsonfile  = require('jsonfile');
var tools     = require('koapp');

module.exports = {
  help  : help,
  init  : init
}

var debugMode = false;
var visualizer = "com.kingofapp.visualizer";

function init(debug, projectName, options) {
  debugMode = debug;
  if(!projectName) return tools.debugLog('Project name is mandatory', debugMode)
  var options = options || [];
  var dev = (options.indexOf('--dev') !== -1);
  if(dev) visualizer += ".dev";
  var branch = ((dev) ? 'dev' : 'master');
  var clone = `git clone -b ${branch} https://github.com/KingofApp/com.kingofapp.visualizer ${visualizer}`;
  tools.debugLog(chalk.red('Creating project'), debugMode)
  shell.mkdir('-p', projectName);
  shell.cd(projectName);
  tools.debugLog(chalk.red('  - Cloning King of App visualizer'), debugMode)
  shell.exec(clone, function(err, data) {
    if(err) return tools.debugLog(chalk.red('[ERROR] Cloning com.kingofapp.visualizer'), debugMode);
    shell.cd(visualizer + '/www');
    shell.mkdir('-p', 'services');
    shell.cd('..');
    if(options.indexOf("--no-deps") !== -1) tools.debugLog(chalk.green('Koapp project has been created'), debugMode)
    else{
      tools.debugLog(chalk.red('  - Installing npm and bower dependencies.'), debugMode);
      shell.exec('npm install && bower install', function(err) {
        if(err) return tools.debugLog(chalk.red('[ERROR] Installing node dependencies'), debugMode)
        tools.debugLog(chalk.green('Koapp project has been created'), debugMode);
      });
    }
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  tools.debugLog(command, debugMode)
  tools.debugLog('', debugMode)
  tools.debugLog('  Create a new Koapp Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.', debugMode)
  tools.debugLog('', debugMode)
}
