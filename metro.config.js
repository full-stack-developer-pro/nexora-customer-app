const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent EMFILE crashes on Windows by blocking non-project folders from file watchers
config.resolver.blockList = [
  /.*[/\\]\.git[/\\].*/,
  /.*[/\\]\.expo[/\\].*/,
  /.*[/\\]node_modules[/\\]\.cache[/\\].*/
];

module.exports = config;

