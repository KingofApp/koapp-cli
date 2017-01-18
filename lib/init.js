var shell = require('shelljs');

module.exports = function (vorpal) {
  var localStorage = vorpal.localStorage;
  vorpal
    .command('init <template>', 'initialize a template')
    .action(initialize);

    function initialize(args, callback) {
      var templateName = args.template;
      var dir = __dirname;
      shell.mkdir(templateName);
      localStorage('koapp-cli');
      localStorage.setItem('folder', templateName);
      callback(null, templateName);
    }
}
