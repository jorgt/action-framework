module.exports = {
  apps: [
    {
      name: 'api',
      script: './index.js', // Path to your API server script
      instances: 1, // Number of API instances
      exec_mode: 'fork', // Use 'fork' for a single instance
      env: {
        NODE_ENV: 'production',
      },
      output: './logs/api_out.log', // Specify log files
      error: './logs/api_error.log',
    },
    {
      name: 'event-listener',
      script: './src/queue-processor/index.js', // Path to your event listener script
      instances: 4, // Number of instances to scale your listener
      exec_mode: 'cluster', // Use 'cluster' mode to scale instances
      env: {
        NODE_ENV: 'production',
      },
      output: './logs/event_listener_out.log', // Specify log files
      error: './logs/event_listener_error.log',
    },
  ],
};
