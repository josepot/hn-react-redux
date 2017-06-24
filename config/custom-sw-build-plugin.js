const fs = require('fs');

const swFile = fs
  .readFileSync('src/client/sw.js', 'utf8')
  .split('\n')
  .slice(1)
  .join('\n');

function SwPlugin(options) {
  this.browser = options.browser;
}

SwPlugin.prototype.apply = function(compiler) {
  const browser = this.browser;
  compiler.plugin('emit', (compilation, callback) => {
    const assets = Object.keys(compilation.assets)
      .filter(asset => asset.endsWith('.js'))
      .map(asset => `'/dist/${browser}/${asset}'`)
      .concat(`'/dist/${browser}/manifest.json'`);
    const assetsEntry = `const assets = [${assets.join(', ')}];`;
    const output = [assetsEntry, swFile].join('\n');

    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['sw.js'] = {
      source: () => output,
      size: () => output.length,
    };

    callback();
  });
};

module.exports = SwPlugin;
