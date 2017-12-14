module.exports = {
  apps: [{
    name: 'backend',
    script: './server/index.js',
    watch: true,
    ignore_watch: ['.git', 'node_modules', 'mdb', 'assets'],
    env: {
      COMMON_VARIABLE: 'true',
    },
  }],
};
