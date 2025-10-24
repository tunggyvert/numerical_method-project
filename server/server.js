const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectWithRetry = require("./db");
const problemsRoutes = require("./appRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

connectWithRetry().then((db) => {
  app.use("/problems", problemsRoutes(db));

  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
}).catch(err => {
  console.error("Failed to connect DB:", err);
});
