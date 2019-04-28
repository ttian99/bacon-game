'use strict';
var task = require('./lib/task');

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
      Editor.Panel.open('bacon-game');
    },
    'fb-copy-debug' () {
      task.fbCopyDebug();
    },
    'fb-import-level' () {
      task.fbImportLevel();
    },
    'tt-copy-build' () {
      task.ttCopyBuild();
    },
    'install' () {
      task.install();
    },
    'editor:build-finished'(event, arg) {
      Editor.Ipc.sendToMain('bacon-game:tt-copy-build');
    }
  },
};