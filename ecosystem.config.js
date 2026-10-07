module.exports = {
  apps: [
    {
      name: "seraphe",
      script: "dist/main.js",
      cwd: "/var/www/seraphe",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
