module.exports = {
  apps: [
    {
      name: 'chatbox-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',     // 使用所有可用的 CPU 核心
      exec_mode: 'cluster', // 使用集群模式
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/ubuntu/logs/chatbox-error.log',
      out_file: '/home/ubuntu/logs/chatbox-out.log',
      merge_logs: true,
      min_uptime: '60s',
      max_restarts: 3
    }
  ]
};
