var shell = require('shelljs');

module.exports = function (vorpal) {
  vorpal
    .command('init <template>', 'initialize a template')
    .action(initialize);

    function initialize(args, callback) {
      var templateName = args.template;
      var dir = shell.pwd().stdout + '/' + templateName;
      shell.mkdir(templateName);
      vorpal.localStorage('koapp-cli');
      vorpal.localStorage.setItem('folder', templateName);
      shell.cd(templateName);
      shell.exec('git clone https://github.com/KingofApp/com.kingofapp.visualizer', function(err, data) {
        shell.exec('cordova create ' + templateName + ' --link-to=com.kingofapp.visualizer/www', function(err, data) {
          callback(err, templateName);
        });
      });
    }
}
