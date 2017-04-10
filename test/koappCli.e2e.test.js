(function() {
  'use strict';
  var expect     = require('chai').expect;
  var shell      = require('shelljs');
  var fs         = require('fs');
  var ls         = shell.ls;

  var projectNameMock            = 'testProject';
  var projectNameWithoutDepsMock = 'testProjectNoDeps';
  var projectNameDevMock         = 'testProjectDev';

  describe('[e2e] koappCli', function() {
    this.timeout(180000);

    describe('init test', function() {
      describe('on success', function () {
        it('should create a standard koapp project', function(done) {
          var command = 'koapp init ' + projectNameMock;
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer';
            var projectFiles = ls(projectNameMock).stdout.replace(/\n/g, '');
            expect(err).to.be.equal(0);
            expect(files.indexOf('testProject')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });

        it('should create a no deps koapp project', function(done) {
          var command = 'koapp init ' + projectNameWithoutDepsMock + ' --no-deps';
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer';
            var projectFiles = ls(projectNameWithoutDepsMock).stdout.replace(/\n/g, '');

            expect(err).to.be.equal(0);
            expect(files.indexOf('testProject')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });

        it('should create a dev koapp project', function(done) {
          var command = 'koapp init ' + projectNameDevMock + ' --dev';
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer.dev';
            var projectFiles = ls(projectNameDevMock).stdout.replace(/\n/g, '');
            expect(err).to.be.equal(0);
            expect(files.indexOf('testProjectDev')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });
      });
    });

    describe('add test', function() {
      beforeEach(function(done) {
        shell.cd(__dirname);
        done();
      });

      describe('on a standard koapp project', function() {
        describe('on success', function() {
          xit('should add a module to a standard koapp project', function(done) {
            var command = 'koapp add module demo';
            shell.cd('../testProject/com.kingofapp.visualizer/www/modules');

            process.stdin.on('readable', function(data) {
              stdout.write('');
            });

            shell.exec(command, function(err) {
              done();
            });
          });

          it('should add a service to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'service',
              pluginName: 'test',
              done: done
            });
          });

          it('should add a theme to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'theme',
              pluginName: 'candy',
              done: done
            });
          });

          it('should add a spinner to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'spinner',
              pluginName: 'fitness',
              done: done
            });
          });
        });
      });

      describe('on a dev koapp project', function() {
        describe('on success', function() {
          it('should add a service to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'service',
              pluginName: 'test',
              done: done
            });
          });

          it('should add a theme to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'theme',
              pluginName: 'candy',
              done: done
            });
          });

          it('should add a spinner to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'spinner',
              pluginName: 'fitness',
              done: done
            });
          });
        });
      });
    });

    describe('remove test', function() {
      beforeEach(function(done) {
        shell.cd(__dirname);
        done();
      });

      describe('on a standard koapp project', function() {
        describe('on success', function() {
          it('should remove a module from a standard koapp project', function(done) {
            var command = 'koapp remove module "/menu-abcd/elements-abcd"';
            shell.cd('../testProject/com.kingofapp.visualizer/www/modules');

            testPlugin({
              pluginType: 'module',
              pluginName: 'demo',
              command: command,
              action: 'remove',
              done: done
            });
          });

          it('should remove a service from a standard koapp project', function(done) {
            var command = 'koapp remove service test';
            shell.cd('../testProject/com.kingofapp.visualizer/www/modules');

            testPlugin({
              pluginType: 'service',
              pluginName: 'test',
              command: command,
              action: 'remove',
              done: done
            });
          });
        });
      });
    });

    after(function(done) {
      shell.cd('../../../..');
      shell.rm('-rf', ['./testProject', './testProjectNoDeps', './testProjectDev']);

      var files = shell.ls().stdout;
      expect(files.indexOf(projectNameMock)).to.be.equal(-1);
      expect(files.indexOf(projectNameWithoutDepsMock)).to.be.equal(-1);
      expect(files.indexOf(projectNameDevMock)).to.be.equal(-1);
      done();
    });
  });

  // Helper functions

  function changeFolderToTest(options) {
    var command = 'koapp add ' + options.pluginType + ' ' + options.pluginName;
    var visualizerFolder = options.env === 'standard' ?
                                           './../' + projectNameMock + '/com.kingofapp.visualizer/www/' + options.pluginType + 's' :
                                           './../' + projectNameDevMock + '/com.kingofapp.visualizer.dev/www/' + options.pluginType + 's';
    shell.cd(visualizerFolder);

    options.command = command;
    testPlugin(options);
  }

  function testPlugin(options) {
    shell.exec(options.command, function(err) {
      expect(err).to.be.equal(0);

      var files = shell.ls().stdout.split('\n');
      
      if (options.action === 'remove') {
        checkStructureFile(options);
      } else {
        expect(files.indexOf(options.pluginName)).to.be.not.equal(-1);
        checkStructureFile(options);
      }                 
    });
  }

  function checkStructureFile(options) {
    shell.cd('./../core');
    var files = shell.ls().stdout.split('\n');
    
    expect(files.indexOf('structure.json')).to.be.not.equal(-1);

    fs.readFile('structure.json', 'utf-8', function(err, data) {
      expect(err).to.be.a('null');
      
      var jsonData = JSON.parse(data);

      if (options.action && options.action === 'remove') {
        options.pluginType === 'service' ?
                       removeServiceStructureExpects(options, jsonData) :
                       removeModuleStructureExpects(options, jsonData) ;
      } else {
        options.pluginType === 'service' ?
                       performAddServiceExpects(options, jsonData) :
                       performAddThemeExpects(options, jsonData);
      }
    });
  }

  function performAddServiceExpects(options, jsonData) {
    expect(jsonData).to.have.property('services');
    expect(jsonData.services).to.have.property('test');
    expect(jsonData.services.test.name).to.be.equal('test');
    checkFolder(options);
  }

  function performAddThemeExpects(options, jsonData) {
    console.log(options);
    expect(jsonData).to.have.property('config');
    expect(jsonData.config).to.have.property(options.pluginType);
    expect(jsonData.config[options.pluginType]).to.have.property('identifier');
    expect(jsonData.config[options.pluginType].identifier).to.be.equal(options.pluginName);
    options.done();
  }

  function removeServiceStructureExpects(options, jsonData) {
    expect(jsonData).to.have.property('services');
    expect(jsonData.services).to.not.have.property('');
    removeFolder(options);
  }

  function removeModuleStructureExpects(options, jsonData) {
    expect(jsonData).to.have.property('modules');
    expect(jsonData.modules).to.have.property('/menu-abcd');
    expect(jsonData.modules['/menu-abcd']).to.not.have.property('/elements-abcd');
    removeFolder(options);
  }

  function checkFolder(options) {
    shell.cd('..');
    shell.cd('./' + options.pluginType + 's');
    var files = ls().stdout.split('\n');

    expect(files.indexOf(options.pluginName)).to.be.not.equal(-1);
    options.done();
  }

  function removeFolder(options) {
    shell.cd('..');
    shell.cd('./' + options.pluginType + 's');
    shell.rm('-rf', './' + options.pluginName);

    var files = ls().stdout.split('\n');
    
    expect(files.indexOf(options.pluginName)).to.be.equal(-1);
    options.done();
  }
})();