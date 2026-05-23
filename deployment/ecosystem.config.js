module.exports = {
  apps: [
    {
      name: 'learnflow',
      script: './dist/server.js',
      cwd: '/var/www/learnflow/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
}
