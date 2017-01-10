var vorpal  = require('vorpal')();
var chalk   = vorpal.chalk
// var create  = require('./create-plugin');


vorpal
  .delimiter('koapp$')
  .use(require('./lib/create-plugin.js'))
  .use(require('./lib/serve.js'))
  .use(require('./lib/build.js'))
  .log('Welcome to ' + chalk.red('King of App CLI') + '!')
  .history('koapp-cli')
  .show();
