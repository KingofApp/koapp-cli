var command     = process.argv[2],
    pluginType  = process.argv[3],
    pluginName  = process.argv[4];

exports.koappCli = koappCli;

function koappCli() {
  if(command === 'help' || !command) return help();
  try{
    var action = require(`./${command}`);
    if(pluginType === 'help') action[command].help();
    action[command](pluginType, pluginName);
  }catch(err){
    console.error('Command not found');
  }
}

function help() {
  console.log('This is the help')
}
