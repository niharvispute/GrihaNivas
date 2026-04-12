module.exports = {
  apps: [
    {
      name: 'bricks-backend',
      script: 'server.js',
      instances: 'max',        // use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      kill_timeout: 10000,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        TRUST_PROXY: 'true',
        FORCE_HTTPS: 'true',
        JWT_BLACKLIST_STORE: 'redis',
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
