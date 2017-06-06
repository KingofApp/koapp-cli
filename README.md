# koapp-cli

![Koa-logo](https://s3-eu-west-1.amazonaws.com/images.kingofapp.com/logo/logo%2Bking%403x.png)

### Installation

```bash
$ npm install -g koapp-cli
```
### Requirements
- ImageMagick installed (*Mac*: `brew install imagemagick`, *Debian/Ubuntu*: `sudo apt-get install imagemagick`, *Windows*: [See here, install "Legacy tools"](http://www.imagemagick.org/script/binary-releases.php#windows))

- [npm](https://www.npmjs.com/). Once you have installed it run the following commands:
```bash
$ npm install -g cordova
$ npm install -g yo
$ npm install -g generator-koapp-module
$ npm install -g generator-koapp-theme
$ npm install -g generator-koapp-spinner
$ npm install -g generator-koapp-service
$ npm install -g cordova-icon
$ npm install -g cordova-splash
```

If you have issues with ``EACCESS`` you should check [npm guide to fix permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions).


### Usage

King of App Command-Line Interface provides developers some helpful commands that can assist you while you build your app.

You have the following command tools which you can use:

*Note: all commands should be executed from the base folder that will contain all your project files.*

* ``koapp init <projectName>``

  Create a new King of App Project on the given path and download our [Visualizer]('http://docs.kingofapp.com/visualizer') to preview your app.

  Example:
  ~~~
  koapp init
  ~~~

* ``koapp create <module|spinner|theme|service>``

  Create a new module, spinner, theme or service. An assistant will ask you for some parameters.

  Example:
  ~~~
  koapp create module
  
  koapp create service
  ~~~

* ``koapp serve``

  This command will launch King of App Visualizer at ```http://localhost:9001```. You need to be inside the King of App Visualizer folder of your project.

  Example:
  ~~~
  koapp serve
  ~~~

* ``koapp add <module|spinner|theme|service> <pluginName>``

  Use this command to download and install modules, themes, spinners or services in your application. After you download a module, an assistant will guide you with the routes.

  Example:
  ~~~
  koapp add module test

  koapp add service test
  ~~~

* ``koapp remove <service|module> <serviceIdentifier|moduleMenuPath>``

  Use this command to remove a service or a module to your application. To remove a service you need to pass its indentifier. To remove a module you need to pass its menu path inside your application.

  Example:
  ~~~
  koapp remove service test

  koapp remove module "/menu-abcd/test-abcd/"
  ~~~

* ``koapp build <cordovaProjectName> <platform>``

  Create and build your Cordova project with all its dependencies for the selected platform. You need [Android SDK](https://developer.android.com/studio/index.html?hl=es-419) or [XCode](https://developer.apple.com/xcode/) to build your project.

  If you want your own icon and splash, you can replace them on 'com.kingofapp.visualizer/www/images' yourself. The splash screen image should be 2208x2208 px with a square center of around 1200x1200 px

  Example:
  ~~~
  koapp build ProjectName android

  koapp build ProjectName ios
  ~~~

* ``koapp emulate <platform>``

  Emulate your app using native Android or IOs emulator.

  Example:
  ~~~
  koapp emulate
  ~~~

* ``koapp <help | -h | --help>``

  Display the list of avaliable commands and some help.

  Example:
  ~~~
  koapp help

  koapp -h

  koapp --help
  ~~~

### Frequent errors

  - Invalid command.
  ~~~
  Error. Command "command" not found!
  ~~~

  - Invalid plugin type.
  ~~~
  Plugin type should be "module", "spinner", "theme" or "service".
  ~~~

  - Service already exists on add or create.
  ~~~
  Service already exists. Please select another name.

  Service already exists. You can't have duplicated services in your application.
  ~~~

  - Not executing the commands from the right folder.
  ~~~
  Error reading file structure.json. Please make sure the folder "com.kingofapp.visualizer" exists in your project folder.

  Error, you are not in the right folder. Call "koapp serve" from the folder initialized by "koapp init" that contains "com.kingofapp.visualizer".

  Error writing into config.xml file. Please make sure you initialized a project and you are in the right folder.
  ~~~
  
  - Invalid platform on serve or build.
  ~~~
  Invalid platform. Please choose between "ios" or "android".
  ~~~

  - Invalid cordova plugin.
  ~~~
  Error executing cordova add plugin pluginName
  ~~~

  - ImageMagick not installed or wrong version.
  ~~~
  Error: spawn identify ENOENT
  ~~~

  To fix this error, you have to install ImageMagick. If you already have it installed, you have to uninstall it and install the correct version.

  #### On Windows
    - Uninstall all previosly installed versions of ImageMagick.
    - Download the latest version of ImageMagick that constains HDRI on its name. I.e: ImageMagick-7.0.5-10-Q16-HDRI-x64-dll.exe.
    - Check the "Install legacy utilities"
    - Install.

  #### On Mac
    - Delete all previosly installed versions of ImageMagick.
    - Run the command "brew install imagemagick" on the terminal.

### License
MIT © [King of App](https://github.com/KingofApp)
