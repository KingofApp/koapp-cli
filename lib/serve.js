require('console.mute');
var shell = require('shelljs');
var chalk = require('chalk');

module.exports = {
  help  : help,
  serve : serve
};


function serve(debug, env) {
  if(!debug) console.resume();

  if (env && env === 'dev') {
    shell.cd('./com.kingofapp.visualizer.dev');
  } else {
    shell.cd('./com.kingofapp.visualizer');
  }

  shell.exec('npm start');
}

function help() {
  var command = chalk.yellow('koapp serve');
  console.info(command);
  console.info();
  console.info('Serves your application on http://localhost:9001');
  console.info();
}
