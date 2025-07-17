# GOV.UK Design System Implementation Guide

This document provides guidance on implementing the GOV.UK Design System across all user-facing services in the PDS microservices ecosystem.

## Overview

The GOV.UK Design System is a set of standards, patterns, and components designed to ensure all government services are consistent, accessible, and easy to use. All PDS services with user interfaces must comply with these standards.

## Implementation Requirements

### Core Requirements

1. **Typography**
   - Use the GDS Transport font
   - Follow GOV.UK typography scale and styling
   - Default text should be 19px for body copy

2. **Color Palette**
   - Use only the official GOV.UK color palette
   - Ensure proper contrast ratios for accessibility
   - Primary brand color: #00703c (green)

3. **Layout**
   - Use the GOV.UK grid system
   - Maximum page width of 1020px
   - Standard margins and gutters as defined in the design system

4. **Responsive Design**
   - Support all screen sizes from mobile to desktop
   - Implement proper breakpoints as defined in the design system
   - Test on a range of devices

5. **Accessibility**
   - Meet WCAG 2.1 AA standards at minimum
   - Support keyboard navigation
   - Ensure screen reader compatibility
   - Provide proper focus states and skip links

## Component Usage

### Required Components

All services must use these standard GOV.UK Design System components:

1. **Header and Footer**
   - Standard GOV.UK header with service name
   - Standard GOV.UK footer with required links

2. **Typography Components**
   - Headings (h1-h6)
   - Body text
   - Lists (bulleted, numbered)
   - Section break
   - Links

3. **Form Components**
   - Text input
   - Textarea
   - Radios
   - Checkboxes
   - Select
   - File upload
   - Date input
   - Error summary and validation

4. **Navigation**
   - Breadcrumbs
   - Back link
   - Pagination

5. **Content Presentation**
   - Warning text
   - Inset text
   - Details
   - Panels
   - Tables
   - Tabs (when appropriate)

### Pattern Implementation

Implement these standard patterns correctly:

1. **Task Lists**
   - For multi-step processes
   - Show completion status

2. **Question Pages**
   - One thing per page approach
   - Clear error validation
   - "Back" functionality

3. **Confirmation Pages**
   - Clear success message
   - Reference numbers when appropriate
   - Next steps guidance

4. **Error Pages**
   - 404 Not Found
   - 500 Internal Server Error
   - Service unavailable
   - Follow GOV.UK error page patterns

## Implementation Strategy

### Frontend Technology

For the FEP service:

1. **Recommended Tech Stack**
   - React.js with GOV.UK Frontend React components
   - SCSS for styling following GOV.UK conventions
   - Ensure proper bundling and optimization

2. **Package Dependencies**
   ```json
   {
     "dependencies": {
       "govuk-frontend": "^4.7.0",
       "govuk-react": "^0.10.5",
       "react": "^18.2.0",
       "react-dom": "^18.2.0"
     }
   }
   ```

3. **Required Structure**
   - Implement proper folder structure for components, templates, and pages
   - Use atomic design principles (atoms, molecules, organisms, templates, pages)
   - Maintain component modularity

### Implementation Steps

1. **Setup**
   - Install GOV.UK Frontend package
   - Import base SCSS files
   - Configure build system

2. **Component Library**
   - Create shared component library based on GOV.UK components
   - Document usage guidelines
   - Implement automated accessibility testing

3. **Page Templates**
   - Create standard page templates
   - Implement layouts according to GOV.UK grid system
   - Include proper meta tags and document structure

4. **Form Implementation**
   - Use GOV.UK form validation patterns
   - Implement proper error summarization
   - Support progressive enhancement

## Testing Requirements

1. **Accessibility Testing**
   - Automated testing with axe or similar tools
   - Manual testing with screen readers
   - Keyboard navigation testing
   - Color contrast verification

2. **Cross-browser Testing**
   - Test on all major browsers (Chrome, Firefox, Safari, Edge)
   - Test on IE11 if required by your service standard
   - Ensure consistent rendering and behavior

3. **Responsive Testing**
   - Test on multiple device sizes
   - Verify breakpoint behavior
   - Ensure touch-friendly interfaces on mobile

## Resources

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/)
- [GOV.UK React Components](https://github.com/govuk-react/govuk-react)
- [Accessibility Guidelines](https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible-an-introduction)

## Compliance Checklist

Each service with a UI must complete this checklist before deployment:

- [ ] All pages use GOV.UK Design System components
- [ ] Typography follows GOV.UK standards
- [ ] Color palette adheres to GOV.UK guidelines
- [ ] Layout uses GOV.UK grid system
- [ ] Responsive design works on all target devices
- [ ] WCAG 2.1 AA compliance verified
- [ ] Form validation follows GOV.UK patterns
- [ ] Error handling follows GOV.UK standards
- [ ] Automated accessibility tests pass
- [ ] Manual accessibility testing completed
- [ ] Cross-browser testing completed
