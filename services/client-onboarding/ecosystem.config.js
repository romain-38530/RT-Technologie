/**
 * Configuration PM2 - Service Client Onboarding
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [{
    name: 'client-onboarding',
    script: './src/server.js',
    cwd: __dirname,

    // Instances
    instances: 1,
    exec_mode: 'fork',

    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3020
    },

    // Logs
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Restart behavior
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',

    // Restart delays
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,

    // Advanced features
    kill_timeout: 5000,
    listen_timeout: 3000,

    // Source map support
    source_map_support: true,

    // Environment variables file
    env_file: '.env',

    // Graceful shutdown
    shutdown_with_message: false
  }]
};
