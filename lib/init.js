var shell = require('shelljs');
var chalk = require('chalk');
var fs    = require('fs');

module.exports = {
  help  : help,
  init  : init
}


function init(projectName) {
  if(!projectName) return console.error('Project name is mandatory');

  var clone = 'git clone https://github.com/KingofApp/com.kingofapp.visualizer';
  var cordova = 'cordova create ' + projectName + ' --link-to=com.kingofapp.visualizer/www';

  shell.mkdir(projectName);
  shell.cd(projectName);
  shell.exec(clone, function(err, data) {
    shell.exec(cordova, function(err, data) {
      if(err) return console.error(new Error('Creating cordova project'));
      shell.cd('com.kingofapp.visualizer');
      shell.exec('npm install', function(err) {
        if(err) return console.error(new Error('Installing node dependencies'));
        shell.cd('../' + projectName);
        addCordobaPreferences(function (err) {
          if(err) return console.error(new Error('[Error reading file]'));
          console.log('Cordova project has been created and dependencies has been installed')
        });
      });
    });
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  console.info(command);
  console.info();
  console.info('  Create a new Cordova Project on the given path and download our Visualizer (http://docs.kingofapp.com/visualizer) to preview your app.');
  console.info();
}

//Add cordova preferences
function addCordobaPreferences(callback){
  console.log("---Adding cordova Dependencies...");
   fs.readFile('config.xml', function(err, fileData) {
     if(fileData){
       var output = cleanBody(fileData.toString());
       fs.writeFile('config.xml', output, function(err) {
         callback(null);
       });
     }else{
       callback(err);
     }
   });
};

function cleanBody(body){
  var preferences = '  <access origin="*" />\n' +
                    '  <allow-navigation href="*" /> \n' +
                    '  <preference name="AutoHideSplashScreen" value="false" />\n' +
                    '  <preference name="SplashScreenDelay" value="10000" />\n' +
                    '  <preference name="ShowSplashScreenSpinner" value="false" />\n' +
                    '  <preference name="FadeSplashScreen" value="true" />\n' +
                    '  <preference name="FadeSplashScreenDuration" value="1" />\n' +
                    '  <preference name="target-device" value="handset" />';
   var line = 3;
   var localServer = '<content src="http://localhost:56969" />';

   var result = body;
   result = result.replace('<platform name="ios">', '<platform name="ios">\n      ' + localServer);

   result = result.split('\n');
   result.splice(line,0,preferences);
   result = result.filter(function(str){ return str; });
   return result.join('\n');
}
