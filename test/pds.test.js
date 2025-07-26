const request = require('supertest');
const SolidPDSServer = require('../src/index');
const { generateMockToken } = require('../src/middleware/auth');
const fs = require('fs-extra');
const path = require('path');

describe('Solid PDS API', () => {
    let app;
    let server;
    let testWebId;
    let testToken;

    beforeAll(async () => {
        // Set test environment
        process.env.NODE_ENV = 'test';
        process.env.MOCK_MODE = 'true';
        process.env.DATA_ROOT = './test/data';

        // Initialize server
        server = new SolidPDSServer();
        app = server.app;

        // Generate test credentials
        testWebId = 'https://user.example.org/profile/card#me';
        testToken = generateMockToken(testWebId);

        // Clean test data directory
        await fs.remove('./test/data');
        await fs.ensureDir('./test/data');
    });

    afterAll(async () => {
        // Clean up test data
        await fs.remove('./test/data');
    });

    beforeEach(async () => {
        // Reset test data for each test
        await fs.remove('./test/data');
        await fs.ensureDir('./test/data');
    });

    describe('Health Endpoints', () => {
        test('GET /health should return service health', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('service', 'Solid Personal Data Store');
            expect(response.body).toHaveProperty('version');
        });

        test('GET /health/ready should return readiness status', async () => {
            const response = await request(app)
                .get('/health/ready')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ready');
        });

        test('GET /health/live should return liveness status', async () => {
            const response = await request(app)
                .get('/health/live')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'alive');
        });
    });

    describe('Authentication', () => {
        test('should reject requests without authorization header', async () => {
            await request(app)
                .get('/profile/card')
                .expect(401);
        });

        test('should reject requests with invalid token', async () => {
            await request(app)
                .get('/profile/card')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });

        test('should accept requests with valid token', async () => {
            const response = await request(app)
                .get('/profile/card')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
        });
    });

    describe('Profile Management', () => {
        test('GET /profile/card should return WebID profile', async () => {
            const response = await request(app)
                .get('/profile/card')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
            expect(response.text).toContain('<#me>');
            expect(response.text).toContain('foaf:Person');
        });

        test('PUT /profile/card should update profile', async () => {
            const profileData = `@prefix foaf: <http://xmlns.com/foaf/0.1/> .
<#me> a foaf:Person ;
  foaf:name "Updated Test User" .`;

            const response = await request(app)
                .put('/profile/card')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(profileData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Profile updated successfully');
            expect(response.body).toHaveProperty('webid', testWebId);
        });

        test('PUT /profile/card should reject non-turtle content', async () => {
            await request(app)
                .put('/profile/card')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send('{"invalid": "data"}')
                .expect(400);
        });
    });

    describe('Credentials Management', () => {
        const mockCredentialTurtle = `@prefix cred: <https://www.w3.org/2018/credentials#> .
@prefix schema: <http://schema.org/> .

<urn:uuid:test-vc-123>
    a cred:VerifiableCredential ;
    cred:issuer <https://pip.gov.uk/did.json> ;
    cred:credentialSubject <${testWebId}> ;
    schema:benefitType "PIP" ;
    schema:amount "£90.10/week" .`;

        const mockCredentialJsonLd = {
            "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org/"],
            "id": "urn:uuid:test-vc-123",
            "type": ["VerifiableCredential", "BenefitCredential"],
            "issuer": "https://pip.gov.uk/did.json",
            "credentialSubject": {
                "id": testWebId,
                "benefitType": "PIP",
                "amount": "£90.10/week"
            }
        };

        test('PUT /credentials/{vcId} should store Turtle credential', async () => {
            const response = await request(app)
                .put('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockCredentialTurtle)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Credential stored successfully');
            expect(response.body).toHaveProperty('id', 'test-vc-123');
            expect(response.body).toHaveProperty('location', '/credentials/test-vc-123');
        });

        test('PUT /credentials/{vcId} should store JSON-LD credential', async () => {
            const response = await request(app)
                .put('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/ld+json')
                .send(mockCredentialJsonLd)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Credential stored successfully');
            expect(response.body).toHaveProperty('id', 'test-vc-123');
        });

        test('GET /credentials/{vcId} should retrieve stored credential', async () => {
            // First store a credential
            await request(app)
                .put('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockCredentialTurtle);

            // Then retrieve it
            const response = await request(app)
                .get('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
            expect(response.text).toContain('cred:VerifiableCredential');
        });

        test('GET /credentials/{vcId} should return 404 for non-existent credential', async () => {
            await request(app)
                .get('/credentials/non-existent')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(404);
        });

        test('DELETE /credentials/{vcId} should delete credential', async () => {
            // First store a credential
            await request(app)
                .put('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockCredentialTurtle);

            // Then delete it
            await request(app)
                .delete('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(204);

            // Verify it's gone
            await request(app)
                .get('/credentials/test-vc-123')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(404);
        });

        test('GET /credentials/index.ttl should return credentials index', async () => {
            // Store some credentials first
            await request(app)
                .put('/credentials/test-vc-1')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockCredentialTurtle);

            await request(app)
                .put('/credentials/test-vc-2')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/ld+json')
                .send(mockCredentialJsonLd);

            // Get the index
            const response = await request(app)
                .get('/credentials/index.ttl')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
            expect(response.text).toContain('ldp:Container');
            expect(response.text).toContain('ldp:contains');
        });

        test('should reject invalid credential IDs', async () => {
            await request(app)
                .get('/credentials/invalid..path')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(400);

            await request(app)
                .get('/credentials/invalid/path')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(404); // This will hit the 404 handler since it doesn't match the route
        });
    });

    describe('Access Control', () => {
        const mockAcl = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#owner>
    a acl:Authorization ;
    acl:agent <${testWebId}> ;
    acl:accessTo <./> ;
    acl:mode acl:Read, acl:Write, acl:Control .`;

        test('GET /.acl should return access control rules', async () => {
            const response = await request(app)
                .get('/.acl')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
            expect(response.text).toContain('acl:Authorization');
        });

        test('PUT /.acl should update access control rules', async () => {
            const response = await request(app)
                .put('/.acl')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockAcl)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Access rules updated successfully');
        });

        test('PUT /credentials/{vcId}/.acl should set credential-specific ACL', async () => {
            const credentialAcl = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .

<#owner>
    a acl:Authorization ;
    acl:agent <${testWebId}> ;
    acl:accessTo <test-vc-123.ttl> ;
    acl:mode acl:Read, acl:Write .`;

            const response = await request(app)
                .put('/credentials/test-vc-123/.acl')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(credentialAcl)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Credential access rules updated successfully');
            expect(response.body).toHaveProperty('vcId', 'test-vc-123');
        });

        test('GET /credentials/{vcId}/.acl should return credential ACL', async () => {
            const response = await request(app)
                .get('/credentials/test-vc-123/.acl')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
            expect(response.text).toContain('acl:Authorization');
        });
    });

    describe('Content Negotiation', () => {
        const mockCredentialTurtle = `@prefix cred: <https://www.w3.org/2018/credentials#> .
<urn:uuid:test-vc> a cred:VerifiableCredential .`;

        test('should serve Turtle by default', async () => {
            await request(app)
                .put('/credentials/test-vc')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send(mockCredentialTurtle);

            const response = await request(app)
                .get('/credentials/test-vc')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/turtle');
        });

        test('should serve JSON-LD when requested', async () => {
            const mockJsonLd = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "id": "urn:uuid:test-vc",
                "type": ["VerifiableCredential"]
            };

            await request(app)
                .put('/credentials/test-vc')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/ld+json')
                .send(mockJsonLd);

            const response = await request(app)
                .get('/credentials/test-vc')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Accept', 'application/ld+json')
                .expect(200);

            expect(response.headers['content-type']).toContain('application/ld+json');
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed requests gracefully', async () => {
            await request(app)
                .put('/credentials/test-vc')
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'text/turtle')
                .send('')
                .expect(400);
        });

        test('should return proper error structure', async () => {
            const response = await request(app)
                .get('/credentials/non-existent')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('path');
        });
    });
});

module.exports = {};
