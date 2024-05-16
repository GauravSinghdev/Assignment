const express = require("express");
const cors = require("cors");
const mainRouter  = require("./routes/user");
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const app = express();

app.use(cors()); // Cross-Origin Resource Sharing
app.use(express.json()); //let you pass the json objects in post 

const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1", mainRouter);

app.listen(3000);
