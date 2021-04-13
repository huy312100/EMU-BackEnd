module.exports= {
    server: 'hcmus-emu-rdbms.database.windows.net',  //update me
    authentication: {
      type: 'default',
      options: {
        userName: 'rdbms', //update me
        password: 'appEMU11'  //update me
      }
    },
    options: {
      // If you are on Microsoft Azure, you need encryption:
      encrypt: true,
      database: 'ApplicationEMU'  //update me
    }
  };

