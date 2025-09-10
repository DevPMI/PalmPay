module.exports = {
  apps: [{
    name: 'PalmPayMiddleware',    // A name for your application
    script: 'app.js',             // The entry point of your app
    instances: 'max',             // Run on all available CPU cores
    exec_mode: 'cluster',         // Enable cluster mode
    watch: false,                 // Disable watching files (for production)
    env_production: {             // Environment variables for production
      "NODE_ENV": "development",
    }
  }]
};
