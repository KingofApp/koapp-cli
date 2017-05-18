require('console.mute');
var shell = require('shelljs');
var chalk = require('chalk');
var tools = require('koapp');

module.exports = {
  help  : help,
  serve : serve
};

function serve(debug, env) {
  var visualizerFolder = (env && env === 'dev') ? 'com.kingofapp.visualizer.dev' : 'com.kingofapp.visualizer';

  if(!debug) console.resume();

  shell.cd(`./${visualizerFolder}`);
  var workingDirectory = shell.pwd().stdout;
  if (workingDirectory.indexOf(visualizerFolder) === -1) {
    return tools.debugLog(chalk.red(`\nError, you are not in the right folder. Call "koapp serve" from the folder initialized by "koapp init" that contains "./${visualizerFolder}"\n`), true);
  }
  shell.exec('npm start', function(err) {
    if (err) return tools.debugLog(chalk.red(`\nError reading file package.json. Please make sure the folder "./${visualizerFolder}" exists in your project folder.\n`), false);
  });
}

function help() {
  var command = chalk.yellow('koapp serve');
  console.info(command);
  console.info();
  console.info('Serves your application on http://localhost:9001');
  console.info();
}
