// swagger.js or part of app.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// const { SavingSchema } = require("./models/saving.model");

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Muta App API",
      version: "1.0.0",
      description: "API documentation for your Muta App",
    },
    // components: {
    //   schemas: {
    //     Saving: SavingSchema,
    //   },
    // },
    servers: [
      {
        url: "https://muta-app-backend.onrender.com/api",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
