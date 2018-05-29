cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
    "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
    "pluginId": "phonegap-plugin-barcodescanner",
    "clobbers": [
      "cordova.plugins.barcodeScanner"
    ]
  },
  {
    "id": "cordova-sqlite-storage.SQLitePlugin",
    "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
    "pluginId": "cordova-sqlite-storage",
    "clobbers": [
      "SQLitePlugin"
    ]
  },
  {
    "id": "cordova-plugin-network-information.network",
    "file": "plugins/cordova-plugin-network-information/www/network.js",
    "pluginId": "cordova-plugin-network-information",
    "clobbers": [
      "navigator.connection",
      "navigator.network.connection"
    ]
  },
  {
    "id": "cordova-plugin-network-information.Connection",
    "file": "plugins/cordova-plugin-network-information/www/Connection.js",
    "pluginId": "cordova-plugin-network-information",
    "clobbers": [
      "Connection"
    ]
  },
  {
    "id": "cordova-plugin-cache-clear.CacheClear",
    "file": "plugins/cordova-plugin-cache-clear/www/CacheClear.js",
    "pluginId": "cordova-plugin-cache-clear",
    "clobbers": [
      "CacheClear"
    ]
  },
  {
    "id": "com.filfatstudios.spinnerdialog.SpinnerDialog",
    "file": "plugins/com.filfatstudios.spinnerdialog/www/SpinnerDialog.js",
    "pluginId": "com.filfatstudios.spinnerdialog",
    "clobbers": [
      "SpinnerDialog"
    ]
  },
  {
    "id": "com.bez4pieci.cookies.cookies",
    "file": "plugins/com.bez4pieci.cookies/www/cookies.js",
    "pluginId": "com.bez4pieci.cookies",
    "clobbers": [
      "cookies"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "phonegap-plugin-barcodescanner": "7.1.2",
  "cordova-sqlite-storage": "2.3.1",
  "cordova-plugin-network-information": "2.0.1",
  "cordova-plugin-cache-clear": "1.3.7",
  "com.filfatstudios.spinnerdialog": "1.0.2",
  "com.bez4pieci.cookies": "0.0.1"
};
// BOTTOM OF METADATA
});