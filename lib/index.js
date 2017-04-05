var chalk = require('chalk');

var command     = process.argv[2],
    pluginType  = process.argv[3],
    pluginName  = process.argv[4],
    directory   = process.argv.slice(5);

exports.koappCli = koappCli;

function koappCli() {
  if(command === 'help' || !command) return help();
  try{
    var action = require(`./${command}`);
    if(pluginType === 'help') return action.help();
    action[command](pluginType, pluginName, directory);
  }catch(err){
    console.log(err);
    console.error('Command not found');
  }
}

function help() {
  console.info();
  console.info('King of App Command-Line Interface provides developers some helpful commands that can assist you while you build your app.')
  console.info();
  console.info('List of avaliable commands:');
  console.info('  - init <projectName>');
  console.info('  - create <module|spinner|theme>');
  console.info('  - add <pluginType> <pluginName>');
  console.info('  - build <cordovaProjectName> <platform>');
  console.info('  - serve');
  console.info('  - help');
  console.info();
}
