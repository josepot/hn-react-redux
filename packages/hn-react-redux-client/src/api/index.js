module.exports =
  process.env.NODE_ENV !== 'production'
    ? require('./mocked')
    : require('./real');
