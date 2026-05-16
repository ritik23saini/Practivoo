module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/Practivoo",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "1G",
      kill_timeout: 5000,
      listen_timeout: 3000,
    }
  ]
};
  