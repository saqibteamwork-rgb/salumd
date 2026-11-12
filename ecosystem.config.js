module.exports = {
  apps : [{
    name: "mr-saqib-md",
    script: "./index.js",
    node_args: "--experimental-require-module --expose-gc --max-old-space-size=460",
    watch: false,
    autorestart: true,
    max_memory_restart: '450M',
    env: {
      NODE_ENV: "production",
    }
  }]
};
