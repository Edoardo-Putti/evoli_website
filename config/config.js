module.exports = {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    //password: process.env.DB_PASSWORD,
    password: null,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};