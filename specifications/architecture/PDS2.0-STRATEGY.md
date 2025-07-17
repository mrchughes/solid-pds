# PDS 2.0 Draft Strategy: Distributed, Loosely Coupled Service Development

## 0. Standardization Principles

Building on the existing PDS approach, PDS 2.0 maintains these core standardization principles:

### UI Standards: GOV.UK Design System
- All user-facing components must implement the GOV.UK Design System
- Typography, color palette, components, and patterns must be consistent
- All interfaces must meet WCAG 2.1 AA accessibility standards
- Implementation should follow atomic design principles

### Error Handling Standards
- All services must implement the standard error response format:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable error message",
      "details": { /* Additional error details */ }
    }
  }
  ```
- Use standardized error codes and HTTP status codes across all services
- Validation, authentication, and system errors must follow the defined patterns

### Microservices Best Practices
- **Service Independence**: Each service must be independently deployable
- **API Contracts**: Services interact only through well-defined API contracts
- **No Shared Databases**: Each service owns and manages its own data
- **Service Discovery**: Services locate each other through the API Registry
- **API-First Design**: Design the API contract before implementing the service
- **Single Responsibility**: Each service has a clear, focused purpose
- **Business Domain Alignment**: Services organized around business capabilities

## 1. Specification Distribution Approach

### Core Specifications
- Create a `pds-specifications` repository containing:
  - Master PDS 2.0 architecture
  - Common interfaces, data models, and protocols
  - Authoritative reference for all teams
- **Access via Git Submodules:**
  - Each service repository adds the `pds-specifications` repo as a git submodule (e.g., in a `/specs` or `/docs` folder)
  - This ensures all teams have local, up-to-date access to shared architecture and documentation
  - Example: `git submodule add https://github.com/your-org/pds-specifications.git specs`

### Module-Specific Specifications
- Each service repository contains a `SPECIFICATION.md`:
  - Service-specific implementation requirements
  - API contracts and data models
  - References to shared standards and integration points

## 2. Shared Libraries Strategy

### Library Development
- Create a `pds-common` library repository:
  - DID operations, authentication, challenge-response
  - Utility functions for all services
  - Published as an npm package (or equivalent)
- **Access via Git Submodules:**
  - Each service repository adds the `pds-common` repo as a git submodule (e.g., in a `/lib` or `/common` folder)
  - Alternatively, consume as a published package if preferred
  - Example: `git submodule add https://github.com/your-org/pds-common.git lib/pds-common`

### Versioning
- Use semantic versioning
- Maintain backward compatibility between major versions
- Provide clear deprecation and upgrade guidance

### Integration
- Services declare dependency in their package.json
- Teams upgrade at their own pace
- Library includes comprehensive tests and examples

## 3. API Contracts & Integration

- Define all service APIs using OpenAPI 3.0
- Include OpenAPI specs in each service repo
- Document authentication, endpoints, and schemas
- Provide mock services and shared test fixtures for integration testing

## 4. Implementation Plan

### Phase 1: Specification Development
- Enhance PDS2.0.md with interface definitions
- Create service-specific SPECIFICATION.md files
- Define OpenAPI contracts for all services
- Design shared library interfaces

### Phase 2: Library Development
- Create pds-common repository and package
- Implement DID, auth, and other shared utilities
- Publish first version with documentation
- Provide example implementations

### Phase 3: Reference Implementations
- Build minimal reference implementations for key components
- Create mock services for testing
- Demonstrate end-to-end flows with mock services

### Phase 4: Team Onboarding
- Documentation for each team on implementation approaches
- Integration workshops and guides
- CI/CD templates for consistent deployment

## 5. Repository Structure Example

```
pds-specifications/         # Core specifications repo
├── architecture/           # Overall architecture
├── apis/                   # OpenAPI specifications
├── data-models/            # Shared data models
└── protocols/              # Auth and messaging protocols

pds-common/                 # Shared library repo
├── src/                    # Source code
│   ├── did/                # DID operations
│   ├── auth/               # Authentication utilities
│   └── utils/              # Shared utilities
├── examples/               # Example implementations
└── tests/                  # Test suites

api-registry/               # Service repo
├── SPECIFICATION.md        # Service-specific spec
├── openapi.yaml            # API contract
└── src/                    # Implementation

solid-pds/                  # Service repo
├── SPECIFICATION.md        # Service-specific spec
├── openapi.yaml            # API contract
└── src/                    # Implementation

# Similar structure for other services
```

## 6. Maintenance and Governance

- RFC process for specification changes
- API versioning and deprecation strategy
- Central documentation hub and auto-generated API docs
- Automated compliance and integration tests

## Summary

This strategy enables independent, loosely coupled service development with strong cohesion through shared standards and libraries. Each team can build to spec, integrate via well-defined APIs, and use Copilot or other tools for rapid, reliable implementation.
