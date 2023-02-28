const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/api_documentation.json');

module.exports = (router) => {
    router.use('/api-docs', swaggerUi.serve , swaggerUi.setup(swaggerDocument));
}