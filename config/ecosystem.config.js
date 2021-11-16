module.exports = {
    apps: [{
        name: "evoli",
        script: "./../bin/www",
        merge_logs: true,
        max_restarts: 10,
        instances: 1,
        max_memory_restart: "200M",
    }]
}