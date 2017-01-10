var shell = require('shelljs');

module.exports = function (vorpal) {
  vorpal
  .command('serve', 'serve your application')
  .action(function(args, callback) {
    shell.exec('npm start');
  });
}
