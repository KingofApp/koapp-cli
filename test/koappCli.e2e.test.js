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
    this.timeout(600000);

    describe('init', function() {
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

    describe('add', function() {
      describe('on a standard koapp project', function() {
        describe('on success', function() {
          beforeEach(function(done) {
            shell.cd(__dirname);
            done();
          });

          it('should add a service to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'service',
              pluginName: 'test',
              action: 'add',
              done: done
            });
          });

          it('should add a theme to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'theme',
              pluginName: 'candy',
              action: 'add',
              done: done
            });
          });

          it('should add a spinner to a standard koapp project', function(done) {
            changeFolderToTest({
              env: 'standard',
              pluginType: 'spinner',
              pluginName: 'fitness',
              action: 'add',
              done: done
            });
          });
        });
      });

      describe('on a dev koapp project', function() {
        describe('on success', function() {
          beforeEach(function(done) {
            shell.cd(__dirname);
            done();
          });

          it('should add a service to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'service',
              pluginName: 'test',
              action: 'add',
              done: done
            });
          });

          it('should add a theme to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'theme',
              pluginName: 'candy',
              action: 'add',
              done: done
            });
          });

          it('should add a spinner to a dev koapp project', function(done) {
            changeFolderToTest({
              env: 'dev',
              pluginType: 'spinner',
              pluginName: 'fitness',
              action: 'add',
              done: done
            });
          });
        });
      });
    });

    describe('remove', function() {
      describe('on a standard koapp project', function() {
        describe('on success', function() {
          beforeEach(function(done) {
            shell.cd(__dirname);
            done();
          });

          // xit('should remove a module from a standard koapp project', function(done) {
          //   changeFolderToTest({
          //     pluginType: 'module',
          //     pluginName: '/menu-abcd/elements-abcd',
          //     command: command,
          //     action: 'remove',
          //     env: 'standard',
          //     done: done
          //   });
          // });

          it('should remove a service from a standard koapp project', function(done) {
            changeFolderToTest({
              pluginType: 'service',
              pluginName: 'test',
              action: 'remove',
              env: 'standard',
              done: done
            });
          });

          it('should remove a service from a development koapp project', function(done) {
            changeFolderToTest({
              pluginType: 'service',
              pluginName: 'test',
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
    var command = options.env === 'standard' ?
                                  'koapp ' + options.action + ' ' + options.pluginType + ' "' + options.pluginName + '"':
                                  'koapp ' + options.action + ' ' + options.pluginType + ' "' + options.pluginName + '" dev';
    var visualizerFolder = options.env === 'standard' ?
                                           './../' + projectNameMock :
                                           './../' + projectNameDevMock;
    shell.cd(visualizerFolder);

    options.command = command;
    testPlugin(options);
  }

  function testPlugin(options) {
    shell.exec(options.command, function(err) {
      expect(err).to.be.equal(0);

      var visualizerFolder = options.env === 'standard' ? 'com.kingofapp.visualizer' : 'com.kingofapp.visualizer.dev';

      shell.cd('./' + visualizerFolder + '/www/' + options.pluginType + 's');
      var files = shell.ls().stdout.split('\n');

      if (options.action === 'remove') {
        if (options.pluginType === 'service') expect(files.indexOf(options.pluginName)).to.be.equal(-1);
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
                               addServiceExpects(options, jsonData) :
                               addThemeExpects(options, jsonData);
      }
    });
  }

  function addServiceExpects(options, jsonData) {
    expect(jsonData).to.have.property('services');
    expect(jsonData.services).to.have.property('test');
    expect(jsonData.services.test.name).to.be.equal('test');
    checkPluginFolder(options);
  }

  function addThemeExpects(options, jsonData) {
    expect(jsonData).to.have.property('config');
    expect(jsonData.config).to.have.property(options.pluginType);
    expect(jsonData.config[options.pluginType]).to.have.property('identifier');
    expect(jsonData.config[options.pluginType].identifier).to.be.equal(options.pluginName);
    options.done();
  }

  function removeServiceStructureExpects(options, jsonData) {
    expect(jsonData).to.have.property('services');
    expect(jsonData.services).to.not.have.property('test');
    removePluginFolder(options);
  }

  function removeModuleStructureExpects(options, jsonData) {
    expect(jsonData).to.have.property('modules');
    expect(jsonData.modules).to.have.property('/menu-abcd');
    expect(jsonData.modules['/menu-abcd']).to.not.have.property('/demo-abcd');
  }

  function checkPluginFolder(options) {
    shell.cd('..');
    shell.cd('./' + options.pluginType + 's');
    var files = ls().stdout.split('\n');

    expect(files.indexOf(options.pluginName)).to.be.not.equal(-1);
    options.done();
  }

  function removePluginFolder(options) {
    shell.cd('..');
    shell.cd('./' + options.pluginType + 's');

    var files = ls().stdout.split('\n');

    expect(files.indexOf(options.pluginName)).to.be.equal(-1);
    options.done();
  }
})();
