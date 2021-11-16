module.exports = {
    apps: [{
        name: "evoli",
        script: "../bin/www",
        merge_logs: true,
        max_restarts: 20,
        instances: 1,
        max_memory_restart: "200M",
        env_production: {
            NODE_ENV: "production"
        },
        env_development: {
            NODE_ENV: "development"
        }
    }]
}