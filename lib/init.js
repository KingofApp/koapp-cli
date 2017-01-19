var shell = require('shelljs');

module.exports = {
  help  : help,
  init  : init
}


function init(pluginName) {
  if(!pluginName) return console.error('Plugin name is mandatory');

  var clone = 'git clone https://github.com/KingofApp/com.kingofapp.visualizer';
  var cordova = 'cordova create ' + pluginName + ' --link-to=com.kingofapp.visualizer/www';

  shell.mkdir(pluginName);
  shell.cd(pluginName);
  shell.exec(clone, function(err, data) {
    shell.exec(cordova, function(err, data) {
      console.log('Cordova project has been created')
    });
  });
}

function help() {

}
