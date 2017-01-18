var vorpal  = require('vorpal')();
var chalk   = vorpal.chalk
// var create  = require('./create-plugin');

exports.koappCli = koappCli;

function koappCli() {
  return vorpal
          .delimiter('koapp$')
          .use(require('./init.js'))
          .use(require('./create-plugin.js'))
          .use(require('./serve.js'))
          .use(require('./build.js'))
          .log('Welcome to ' + chalk.red('King of App CLI') + '!')
          .history('koapp-cli')
          .show();
}
