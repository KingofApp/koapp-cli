require('console.mute');
var shell     = require('shelljs');
var inquirer  = require('inquirer');
var chalk     = require('chalk');

var prompt = [{
  type: 'input',
  name: 'pluginName',
  message: 'Plugin name',
  required: true
}, {
  type: 'input',
  name: 'userName',
  message: 'Author\'s name'
}, {
  type: 'input',
  name: 'homepage',
  message: 'Author\'s homepage'
}, {
  type: 'input',
  name: 'spanishDescription',
  message: 'Spanish description'
}, {
  type: 'input',
  name: 'englishDescription',
  message: 'English description'
}, {
  type: 'input',
  name: 'license',
  message: 'License',
  default: 'MIT'
}, {
  type: 'input',
  name: 'categories',
  message: 'Categories (comma to split)'
}, {
  type: 'input',
  name: 'price',
  message: 'Price',
  default: 0
}];

var createPluginOptions = [
  ['userName'           , '-u'],
  ['homepage'           , '-w'],
  ['spanishDescription' , '-s'],
  ['englishDescription' , '-e'],
  ['price'              , '-p'],
  ['license'            , '-l'],
  ['categories'         , '-c']
];

var createOptions = ['module, theme, spinner, service'];

module.exports = {
  help    : help,
  create  : create
};

var debugMode = false;

function create(debug, pluginType) {
  if(!debug) console.resume();
  var validType = /^(module|theme|spinner|service)/.test(pluginType);
  if(!pluginType || !validType)
    return console.error(chalk.red('[ERROR]Plugin type should be "module", "spinner", "theme" or "service"'));
  inquirer.prompt(prompt).then(function(answers) {
    var generate = 'yo koapp-' + pluginType + ' ' + answers.pluginName;
    createPluginOptions.forEach(function(keyAndAlias) {
      var answer = answers[keyAndAlias[0]];
      if(answer) generate += ' ' + keyAndAlias[1] + ' ' + answer;
    });
    shell.exec(generate, function(err, data) {
      console.log(chalk.green(pluginType + ' has been created'));
    });
  });
}

function help() {
  console.resume();
  var command = chalk.red('koapp ') + chalk.green('create ') + chalk.blue('<module | spinner | theme | service>');
  console.info(command);
  console.info();
  console.info('Create a new module, spinner, theme or service.');
  console.info();
}
