# Standard Error Handling in PDS Microservices

This document outlines the standard error handling approach for all services in the PDS microservices ecosystem. Following these guidelines ensures consistent error reporting and handling across all services.

## Error Response Format

All API endpoints should return errors in the following JSON format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional context-specific error details
    }
  }
}
```

## Standard Error Codes

### Authentication and Authorization

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | No authentication credentials provided |
| `INVALID_CREDENTIALS` | 401 | Invalid or expired authentication credentials |
| `INSUFFICIENT_PERMISSIONS` | 403 | Valid authentication but insufficient permissions |
| `API_KEY_EXPIRED` | 401 | The API key has expired and needs rotation |
| `API_KEY_INVALID` | 401 | The API key is not valid or recognized |

### Input Validation

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | General validation error for request parameters |
| `MISSING_REQUIRED_FIELD` | 400 | A required field is missing in the request |
| `INVALID_FIELD_FORMAT` | 400 | A field has an invalid format or type |
| `INVALID_JSON` | 400 | Request body contains invalid JSON |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Content type is not supported |

### Resource Management

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | The requested resource does not exist |
| `RESOURCE_ALREADY_EXISTS` | 409 | Attempting to create a resource that already exists |
| `RESOURCE_CONFLICT` | 409 | The operation conflicts with the current state of the resource |
| `RESOURCE_GONE` | 410 | The resource existed previously but is no longer available |

### Service Integration

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SERVICE_UNAVAILABLE` | 503 | A dependent service is currently unavailable |
| `SERVICE_TIMEOUT` | 504 | A request to a dependent service timed out |
| `API_REGISTRY_ERROR` | 502 | Error communicating with the API Registry |
| `PDS_CONNECTION_ERROR` | 502 | Error communicating with the Solid PDS |
| `VC_VERIFICATION_ERROR` | 502 | Error verifying credentials |

### Verifiable Credentials

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIAL` | 400 | The credential format is invalid |
| `EXPIRED_CREDENTIAL` | 400 | The credential has expired |
| `REVOKED_CREDENTIAL` | 400 | The credential has been revoked |
| `UNTRUSTED_ISSUER` | 400 | The credential issuer is not trusted |
| `SIGNATURE_VERIFICATION_FAILED` | 400 | The credential signature verification failed |

### System Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | An unexpected error occurred on the server |
| `NOT_IMPLEMENTED` | 501 | The requested functionality is not implemented |
| `DATABASE_ERROR` | 500 | Error accessing the database |
| `STORAGE_ERROR` | 500 | Error accessing the storage system |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests, rate limit exceeded |

## Error Handling Best Practices

1. **Security First**: Never expose sensitive information in error messages
2. **Idempotency**: Ensure idempotent operations remain idempotent even during errors
3. **Graceful Degradation**: Services should degrade gracefully when dependencies fail
4. **Logging**: Log all errors with appropriate context and severity
5. **Monitoring**: Implement monitoring and alerting for critical errors

## Implementing Error Handlers

Each service should implement middleware for handling errors consistently:

```javascript
// Example Express error handler
app.use((err, req, res, next) => {
  // Default to internal server error
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  
  // Log the error (consider different log levels based on status code)
  logger.error(`Error: ${errorCode} - ${message}`, {
    error: err,
    requestId: req.id,
    path: req.path,
    method: req.method
  });
  
  // Send standardized response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      // Include details if available and safe to expose
      details: err.details || undefined
    }
  });
});
```

## Testing Error Responses

All services should include tests to verify proper error handling:

1. Test all error conditions with appropriate inputs
2. Verify correct status codes, error codes, and message formats
3. Test error handling during service integration failures
4. Verify security by ensuring sensitive information is not leaked

## Service-Specific Error Extensions

Services may define additional error codes specific to their domain, but should follow the same format and patterns established in this document.
