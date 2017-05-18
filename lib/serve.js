require('console.mute');
var shell = require('shelljs');
var chalk = require('chalk');

module.exports = {
  help  : help,
  serve : serve
};

function serve(debug, env) {
  var visualizerFolder = (env && env === 'dev') ? './com.kingofapp.visualizer.dev' : './com.kingofapp.visualizer';

  if(!debug) console.resume();

  shell.cd(visualizerFolder);
  shell.exec('npm start', function(err) {
    if(err) return tools.debugLog(chalk.red(`\nError reading file package.json. Please make sure the folder "${visualizerFolder}" exists in your project folder.\n`), debugMode);
  });
}

function help() {
  var command = chalk.yellow('koapp serve');
  console.info(command);
  console.info();
  console.info('Serves your application on http://localhost:9001');
  console.info();
}
