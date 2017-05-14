module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'RTW',
      script    : 'app.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    },

    // Second application
    {
      name      : 'WEB',
      script    : 'web.js'
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'deploy',
      host : '192.168.0.7',
      key  : '/var/root/.ssh/id_rsa.pub',
      ref  : 'origin/master',
      repo : 'https://github.com/royvanderzon/minor-realtimeweb.git',
      path : '/home/deploy/rtw',
      // 'post-deploy' : 'npm install ; pm2 startOrRestart ecosystem.json --env production'
      'post-deploy':'npm install || pm2 reload ecosystem.config.js --env production'
    },
    dev : {
      user : 'deploy',
      host : '192.168.0.7',
      key  : '/var/root/.ssh/id_rsa.pub',
      ref  : 'origin/master',
      repo : 'https://github.com/royvanderzon/minor-realtimeweb.git',
      path : '/home/deploy/rtw',
      // 'post-deploy' : 'npm install ; pm2 startOrRestart ecosystem.json --env dev',
      'post-deploy':'npm install || pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
