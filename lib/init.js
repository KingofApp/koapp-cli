var shell     = require('shelljs');
var chalk     = require('chalk');
var jsonfile  = require('jsonfile')

module.exports = {
  help  : help,
  init  : init
}

function init(projectName, options) {
  if(!projectName) return console.error('Project name is mandatory');
  var visualizer = "com.kingofapp.visualizer";
  var options = options || [];
  var dev = (options.indexOf('--dev') !== -1);
  if(dev) visualizer += ".dev";
  var branch = ((dev) ? 'dev' : 'master');
  var clone = `git clone -b ${branch} https://github.com/KingofApp/com.kingofapp.visualizer ${visualizer}`;

  shell.mkdir('-p', projectName);
  shell.cd(projectName);
  shell.exec(clone, function(err, data) {
    shell.cd(visualizer);
    if(options.indexOf("--no-deps") !== -1) console.log('Koapp project has been created');
    else{
      shell.exec('npm install && bower install', function(err) {
        if(err) return console.error(new Error('Installing node dependencies'));
        console.log(chalk.green('Koapp project has been created'));
      });
    }
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  console.info(command);
  console.info();
  console.info('  Create a new Koapp Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.');
  console.info();
}
