module.exports = {
  apps: [{
    name: "henry-api",
    script: "server.mjs",
    interpreter: "node",
    env: {
      OPENAI_API_KEY: 
      // OPENAI_ORG_ID: "org_...",             // optional
      // OPENAI_PROJECT_ID: "proj_..."         // optional
    }
  }]
};
