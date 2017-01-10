var shell = require('shelljs');

module.exports = function (vorpal) {
  vorpal
  .command('build', 'build your application for preview')
  .action(function(args, callback) {
    shell.exec('');
  });
}
