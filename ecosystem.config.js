module.exports = {
    apps: [
        {
            name: "herdiantrys",
            script: "server.js",
            cwd: "./.next/standalone",
            env_file: "../../.env",
            max_memory_restart: "600M",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                HOSTNAME: "0.0.0.0",
            },
        },
    ],
};
