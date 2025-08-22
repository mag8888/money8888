
module.exports = {
  apps: [{
    name: 'cashflow-server',
    script: './server/index.js'
  }, {
    name: 'cashflow-client',
    script: 'npm',
    args: 'run start'
  }]
};


