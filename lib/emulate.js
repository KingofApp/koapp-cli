var shell = require('shelljs');
var chalk = require('chalk');
var tools = require('koapp');

module.exports = {
  help  : help,
  emulate : emulate
};

var debugMode = false;

function emulate(debug, platform) {
  debugMode = debug;
  if (['android', 'ios'].indexOf(platform) === -1 || !platform)
    return tools.debugLog(chalk.red('[ERROR] Invalid platform'), debugMode)
  shell.exec('cordova emulate ' + platform);
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('emulate') + chalk.blue('<platform>');
  tools.debugLog(command, debugMode)
  tools.debugLog('', debugMode)
  tools.debugLog('Emulate your app.', debugMode)
  tools.debugLog('', debugMode)
}
