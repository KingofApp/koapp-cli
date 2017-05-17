require('console.mute');
var package     = require('../package.json');
var version     = package.version;
var chalk       = require('chalk');
var command     = process.argv[2],
    pluginType  = process.argv[3],
    pluginName  = process.argv[4],
    directory   = process.argv.slice(5),
    debug       = (process.argv.indexOf('--debug') !== -1 || process.argv.indexOf('-d') !== -1);

exports.koappCli = koappCli;

function koappCli() {

  if (command === 'help' || command === '--help' || command === '-h' || !command) {
    console.info();
    console.info('King of App Command-Line Interface provides developers some helpful commands that can assist you while you build your app.');

    return help();
  }
  if (command === '--version' || command === '-v') return console.info(version);
  try {
    var action = require(`./${command}`);
    if(pluginType === 'help' || pluginType === '--help' || pluginType === '-h') return action.help();
    if(debug === false) console.mute();
    action[command](debug, pluginType, pluginName, directory);
  } catch(err) {
    console.error(chalk.red('[ERROR] Command not found!'));
    help();
  }
}

function help() {
  console.info();
  console.info(chalk.underline('List of avaliable commands:'));
  console.info(chalk.yellow('  - koapp init <projectName>'));
  console.info(chalk.yellow('  - koapp create <module|service|spinner|theme>'));
  console.info(chalk.yellow('  - koapp add <pluginType> <pluginName>'));
  console.info(chalk.yellow('  - koapp remove <module|service> <module id|service name>'));
  console.info(chalk.yellow('  - koapp build <cordovaProjectName> <platform>'));
  console.info(chalk.yellow('  - koapp serve [env]'));
  console.info(chalk.yellow('  - koapp --help | koapp -h'));
  console.info(chalk.yellow('  - koapp --version | koapp -v'));
  console.info();
}
