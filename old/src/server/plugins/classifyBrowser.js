const useragent = require('useragent');
const {BROWSERS} = require('../../config.js');

function classifyBrowser() {
  function userAgentType(req, res, next) {
    const {family, major} = useragent.lookup(req.headers['user-agent']);
    const lowerCaseFamily = family.toLowerCase();

    if (lowerCaseFamily.startsWith('chrome') && major >= 52) {
      req.userAgentType = BROWSERS.CHROME;
    } else if (lowerCaseFamily.startsWith('safari') && major >= 10) {
      req.userAgentType = BROWSERS.SAFARI;
    } else if (lowerCaseFamily === 'firefox' && major >= 51) {
      req.userAgentType = BROWSERS.FIREFOX;
    } else if (lowerCaseFamily === 'edge' && major >= 14) {
      req.userAgentType = BROWSERS.EDGE;
    } else {
      req.userAgentType = BROWSERS.FALLBACK;
    }

    next();
  }

  return userAgentType;
}

module.exports = classifyBrowser;
