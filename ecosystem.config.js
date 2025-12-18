module.exports = {
    apps: [
      {
        name: "Datacanvas-FrontEnd",
        script: "npx",
        args: "serve -s build",
        env: {
          NODE_ENV: "development",
          REACT_APP_API_URL: "https://datacanvas.hypercube.lk/api",
          REACT_APP_OPENAPI_KEY: "OPENAI KEY HERE",
          REACT_APP_ANALYTICS_API_URL: "https://datacanvas-analytics.vercel.app",
        },
        env_production: {
          NODE_ENV: "production",
          REACT_APP_API_URL: "https://datacanvas.hypercube.lk/api",
          REACT_APP_OPENAPI_KEY: "OPENAI KEY HERE",
          REACT_APP_ANALYTICS_API_URL: "https://datacanvas-analytics.vercel.app",
        },
      },
    ],
  };