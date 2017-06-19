const denodeify = require('denodeify');
const path = require('path');
const fs = require('fs');
const {BROWSERS} = require('../config');

const stat = denodeify(fs.stat);
const isFile = filePath =>
  stat(filePath).then(stats => stats.isFile()).catch(() => false);

function getFileToSend(file, classification, acceptEncoding) {
  if (Object.values(BROWSERS).indexOf(classification) === -1)
    return Promise.resolve(null);

  const filePath = path.resolve('dist', classification, file);

  const acceptedEncodingsSet = acceptEncoding
    .split(', ')
    .reduce((res, encoding) => {
      res.add(encoding);
      return res;
    }, new Set());

  const priorityCandidates = ['br', 'gzip']
    .filter(encoding => acceptedEncodingsSet.has(encoding))
    .map(encoding => ({
      encoding,
      filePath: `${filePath}.${encoding}`,
    }));

  const getFinalCandidate = () =>
    Promise.all(
      priorityCandidates.map(x => isFile(x.filePath))
    ).then(existingOnes => {
      const idx = existingOnes.indexOf(true);
      return idx === -1 ? {filePath} : priorityCandidates[idx];
    });

  return isFile(filePath).then(
    filesExists => (filesExists ? getFinalCandidate() : null)
  );
}

function staticRoute(req, res, next) {
  const {classification, file} = req.params;
  const acceptEncoding = req.headers['accept-encoding'] || '';

  getFileToSend(file, classification, acceptEncoding).then(result => {
    if (result === null) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('file not found');
      next();
    } else {
      const {filePath, encoding} = result;
      const stream = fs.createReadStream(filePath);

      const headers = {
        'Content-Type': 'text/javascript',
        'Cache-Control': 'public,max-age=31536000,immutable',
        'Timing-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
      };
      if (encoding) headers['Content-Encoding'] = encoding;

      stream.on('error', err => {
        throw err;
      });
      stream.on('open', () => {
        res.writeHead(200, headers);
        stream.pipe(res);
      });
      stream.on('end', () => next());
    }
  });
}

module.exports = staticRoute;
