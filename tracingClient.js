const { Appsignal } = require("@appsignal/nodejs");

export const appsignal = new Appsignal({
    active: true,
    name: process.env.APPSIGNAL_APP_NAME,
    pushApiKey: process.APPSIGNAL_PUSH_API_KEY
  });

  
