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
        // JWT_SECRET, DB_DIALECT, DATABASE_URL must be set in .env file
        // or in the server environment. See backend/.env.example
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
}
