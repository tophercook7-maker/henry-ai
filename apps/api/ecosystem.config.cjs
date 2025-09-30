module.exports = {
  apps: [{
    name: "henry-api",
    script: "server.mjs",
    interpreter: "node",
    cwd: "/Users/christophercook/henry/apps/api",
    env: {
      PORT: "3000",
      NODE_ENV: "production",
      OPENAI_API_KEY: "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",
      OPENAI_PROJECT: "proj_pwA0qPFwFBrqKCuxIZWLTssa",
      HENRY_MODEL: "gpt-4o-mini",
      HENRY_TONE: "You are Henry. Speak like a clear, calm human—friendly, concise, modern. No accents or gimmicks."
    }
  }]
}
