module.exports = {
    apps: [
        {
            name: "pastemd",
            script: "node_modules/.bin/next",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 9912,
            },
            instances: 1,
            exec_mode: "fork",
            watch: false,
            max_memory_restart: "512M",
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_file: "./logs/combined.log",
            time: true,
        },
    ],
};
