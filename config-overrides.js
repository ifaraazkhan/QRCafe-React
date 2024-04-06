module.exports = function override(config) {
    let fallback = config.resolve.fallback || {};
    fallback = {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            // "crypto": require.resolve('crypto-browserify'),
            "stream": require.resolve('stream-browserify'),
        }, 
    config.resolve.fallback = fallback;
    return config;
  };