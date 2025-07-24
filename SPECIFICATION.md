# Solid Personal Data Store (PDS) Specification

## Common Considerations:
- All services MUST support interoperability using Solid OIDC and WebID for user identification.
- Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
- All APIs MUST use HTTPS and standard REST semantics.
- UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
- All services MUST support containerized deployment.

## Key Features:
- RDF-native storage (Turtle preferred)
- Solid-compliant Pod and WebID per user
- Credential storage under /credentials/
- Access control via WAC/ACP

## OpenAPI YAML:
```yaml
openapi: 3.0.3
info:
  title: Solid PDS
  version: 1.0.0
paths:
  /profile/card:
    get:
      summary: Get WebID Profile
      responses:
        '200':
          description: WebID profile in Turtle
    put:
      summary: Update WebID Profile
      requestBody:
        content:
          text/turtle:
            schema:
              type: string
      responses:
        '200':
          description: Updated
  /credentials/{vcId}:
    get:
      summary: Read credential
      parameters:
        - name: vcId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: VC as Turtle or JSON-LD
    put:
      summary: Write credential
      parameters:
        - name: vcId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          text/turtle:
            schema:
              type: string
          application/ld+json:
            schema:
              type: object
      responses:
        '201':
          description: Stored
    delete:
      summary: Delete credential
      parameters:
        - name: vcId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Deleted
  /.acl:
    put:
      summary: Set access permissions
      requestBody:
        content:
          text/turtle:
            schema:
              type: string
      responses:
        '200':
          description: Access rules updated
```

## Token Format (example):
```json
{
  "webid": "https://user.example.org/profile/card#me",
  "iss": "https://solid-oidc.gov.uk",
  "aud": "https://pds.example.org"
}
```

## Backlog:

### Authentication & Identity:
- Implement Solid OIDC token validation for all user actions
- Support user profile discovery via WebID document

### Credential Operations:
- Store credentials under /credentials/{vcId} path
- Support GET/PUT/DELETE VC operations in both Turtle and JSON-LD
- Generate metadata for discoverability (e.g. via ldp:contains, RDF type triples)
- Allow user to label VCs and attach tags

### Access Control & Consent:
- Implement WAC and ACP-based access rules per VC
- Allow user to grant/revoke access to third parties with expiration
- Log all access events to support auditing

### User Interface:
- View and edit WebID profile
- List VCs with filter/search/sort
- View VC in raw (Turtle, JSON-LD) and friendly format
- Consent screen: approve/reject third-party VC access requests
- View access history and revoke permissions

### Testing & Deployment:
- Docker container with volume-backed storage
- Enable reset user data mode for testing
- Environment config: domain, port, data root

### Non-Functional:
- Conform to GOV.UK design system for UI
- Fast response < 500ms for GET profile/VC
- Load test with 1000 concurrent VC reads

## Enhancements:
- Include ldp:contains triples in the pod to support credential discovery.
- Suggest supporting index document under /credentials/index.ttl listing all VC resources.
- Clarify .acl inheritance: ACLs apply per-resource; use container ACLs to apply to all contents.

## Added Requirement:
VC files must include standard RDF metadata including:
- rdf:type
- dc:created
- dc:modified
- dc:title
- dc:creator
