module.exports={
    server: "hcmus-emu-rdbms.database.windows.net", // Use your SQL server name
    database: "ApplicationEMU", // Database to connect to
    user: "rdbms", // Use your username
    password: "appEMU11", // Use your password
    port: 1433,
    // Since we're on Windows Azure, we need to set the following options
    options: {
          encrypt: true
      }
};