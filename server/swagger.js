import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My nummerical API",
      version: "1.0.0",
      description: "Numerical-swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./appRoutes.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
