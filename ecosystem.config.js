module.exports = {
    apps: [
        {
            name: "herdiantrys",
            script: "server.js",
            env_file: ".env",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                HOSTNAME: "0.0.0.0",
            },
        },
    ],
};
