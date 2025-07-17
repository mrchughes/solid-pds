# PDS 2.0 Specifications

This repository contains the core specifications, architecture, data models, and protocols for the PDS 2.0 system.

## Directory Structure

- **architecture/** - System architecture, component relationships, and design principles
- **apis/** - OpenAPI specifications for all services
- **data-models/** - Shared data models and schemas
- **protocols/** - Authentication, error handling, and communication protocols

## Key Documents

- [PDS 2.0 Architecture](./architecture/PDS2.0.md) - Core system architecture and flows
- [PDS 2.0 Strategy](./architecture/PDS2.0-STRATEGY.md) - Development strategy for distributed teams
- [PDS 2.0 Implementation Steps](./architecture/PDS2.0-IMPLEMENTATION-STEPS.md) - Phased implementation plan
- [Microservices Best Practices](./architecture/MICROSERVICES_BEST_PRACTICES.md) - Guidelines for service development
- [Error Handling Standards](./protocols/ERROR_HANDLING_STANDARDS.md) - Standardized error formats and codes
- [GOV.UK Design System Guide](./protocols/GOVUK_DESIGN_SYSTEM_GUIDE.md) - UI standards and patterns

## Usage

This repository should be included as a Git submodule in each service repository:

```bash
git submodule add https://github.com/your-org/pds-specifications.git specs
```
