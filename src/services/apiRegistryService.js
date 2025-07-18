/**
 * API Registry Service Integration
 * 
 * Handles publishing the service's API specification to the API Registry
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Publishes the service's OpenAPI specification to the API Registry
 */
async function publishApiSpec() {
    try {
        // Get API specification
        let apiSpec;
        const specPath = path.join(__dirname, '../../openapi.yaml');

        if (fs.existsSync(specPath)) {
            // If using YAML specification
            const yaml = require('js-yaml');
            const specFile = fs.readFileSync(specPath, 'utf8');
            apiSpec = yaml.load(specFile);
        } else {
            // Fallback to JSON specification
            const jsonPath = path.join(__dirname, '../../openapi.json');
            if (fs.existsSync(jsonPath)) {
                apiSpec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            } else {
                console.error('API specification file not found');
                return;
            }
        }

        // Get environment variables
        const apiRegistryUrl = process.env.API_REGISTRY_URL || 'http://api-registry:3005';
        const serviceName = process.env.SERVICE_NAME || 'solid-pds';
        const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
        const apiRegistryKey = process.env.API_REGISTRY_KEY;

        if (!apiRegistryKey) {
            console.warn('API_REGISTRY_KEY not set. API specification will not be published.');
            return;
        }

        // Publish to API Registry
        const response = await axios.post(`${apiRegistryUrl}/specs`, {
            serviceName,
            version: serviceVersion,
            specification: apiSpec,
            description: `API specification for ${serviceName}`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiRegistryKey
            }
        });

        console.log(`API specification published for ${serviceName} v${serviceVersion}`);
        console.log(`Documentation available at: ${response.data.docsUrl}`);
    } catch (error) {
        console.error('Failed to publish API specification:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

module.exports = {
    publishApiSpec
};
