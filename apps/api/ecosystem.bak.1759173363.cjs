module.exports = {
  apps: [{
    name: "henry-api",
    script: "server.mjs",
    interpreter: "node",
    cwd: process.env.HOME + "/henry/apps/api",
    env: {
      // Paste your REAL key between the quotes:
      OPENAI_API_KEY: "sk-proj-PASTE-YOUR-REAL-KEY"
      // Optionally:
      // , OPENAI_ORG_ID: "org_..."
      // , OPENAI_PROJECT_ID: "proj_..."
    },
    time: true,
    watch: false
  }]
};
