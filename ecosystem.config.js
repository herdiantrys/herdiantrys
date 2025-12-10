module.exports = {
    apps: [
        {
            name: "next16",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
