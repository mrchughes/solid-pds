# PDS 2.0: Programmatic Organization Registration and DID-Based Auth

## 1. Organization Generates DID and Key Pair Locally

1. **Key Generation**  
   - Organization generates a cryptographic key pair (private/public) locally and securely.

2. **DID Document Creation**  
   - Organization creates a did:web DID (e.g., `did:web:agency.gov.uk`) and a DID document containing their public key.

3. **DID Document Hosting**  
   - Organization publishes the DID document at `https://agency.gov.uk/.well-known/did.json` on their domain.

---

## 2. Programmatic Registration with PDS

1. **API Registration Request**  
   - Organization sends a registration request to the PDS API, including:
     - Their did:web identifier (e.g., `did:web:agency.gov.uk`)
     - Any required metadata (org name, contact, etc.)

---

## 3. Domain Ownership Verification (Challenge-Response)

1. **PDS Issues Challenge**  
   - PDS receives the registration request and generates a cryptographic challenge (nonce).

2. **Challenge Delivery**  
   - PDS sends the challenge to the organization via the API response.

3. **Organization Signs Challenge**  
   - Organization signs the challenge with their DID’s private key.

4. **Challenge Response Submission**  
   - Organization sends the signed challenge back to the PDS via API.

5. **PDS Verifies Signature**  
   - PDS fetches the organization’s public key from their did:web endpoint (`.well-known/did.json`).
   - PDS verifies the signature using the public key.
   - If valid, this proves the org controls both the private key and the domain.

---

## 4. Registration Completion

1. **PDS Confirms Registration**  
   - Upon successful verification, PDS marks the organization as registered and trusted.
   - PDS may return a confirmation and any additional onboarding info.

---

## 5. Permission Granting and Token Flow

1. **User Grants Permissions**  
   - User (via their own PDS dashboard or API) grants the organization permission to access or write to their PDS.

2. **OAuth-Style Token Flow**  
   - Organization uses their DID as the client ID/secret in an OAuth client credentials flow.
   - PDS may require a new challenge-response for each token request, or rely on the initial registration.
   - Upon successful DID-based auth, PDS issues access and refresh tokens scoped to the user’s granted permissions.

---

## 6. Ongoing Access

1. **Organization Uses Tokens**  
   - Organization uses access tokens to interact with the PDS API as permitted.
   - Can refresh tokens as needed, subject to permission validity.

2. **User Manages Permissions**  
   - User can view, modify, or revoke org permissions at any time.

---


## 7. Asynchronous User Authorization for VC Operations

1. **User Provides WebID**  
   - The user gives their WebID (DID URL) to the VC issuer or consumer.

2. **Issuer/Consumer Initiates Authorization**  
   - The issuer/consumer calls the PDS API with the user’s WebID, requesting permission to perform an action (e.g., issue or verify a VC).
   - The PDS checks if the user has already granted permission for this action.

3. **User Not Logged In (Async Flow)**  
   - If the user is not currently logged in or has not pre-approved the action:
     - The PDS records the pending request.
     - The issuer/consumer is informed that authorization is pending.

4. **User Authorizes Out-of-Band**  
   - The user is notified (e.g., via email, notification, or out-of-band message) that an action is pending their approval.
   - The user logs into their PDS at their convenience.
   - The PDS dashboard shows pending requests (e.g., “Issuer X wants to issue you a VC” or “Verifier Y wants to verify your credential”).
   - The user reviews and approves or denies each request.

5. **Completion**  
   - Once approved, the PDS updates the status.
   - The issuer/consumer can poll the PDS or receive a webhook/callback when the user has authorized.
   - The issuer/consumer can then proceed with the challenge-response or VC operation.

---

- The entire org registration is programmatic—no portal or manual steps.
- The org generates keys and DID locally, hosts the DID document, and registers via API.
- PDS verifies domain control using a cryptographic challenge-response, leveraging the did:web public key.
- All subsequent access is via OAuth-style tokens, with DID-based authentication.
- Users can approve VC operations asynchronously, without redirects, by authorizing pending requests in their PDS dashboard.
- This is secure, decentralized, user-centric, and fully automatable.

---

## 8. User WebID and PDS Endpoint Resolution

1. **User Provides WebID URL**
   - When interacting with a VC issuer or consumer, the user provides their full WebID URL (e.g., `https://alice.pds.example.org/profile/card#me`).

2. **PDS Endpoint Extraction**
   - The VC issuer or consumer uses the WebID URL to extract the base PDS endpoint (e.g., `https://alice.pds.example.org`).
   - This endpoint is used for registration, permission requests, and other API calls to the user's PDS.

3. **Human-Friendly Input**
   - The system may also support simpler forms (e.g., just the domain or `username@pds.example.org`) and auto-complete to the full WebID URL.

4. **Best Practice**
   - Users should be encouraged to provide their full WebID URL for maximum compatibility and resolvability.
- The entire org registration is programmatic—no portal or manual steps.
- The org generates keys and DID locally, hosts the DID document, and registers via API.
- PDS verifies domain control using a cryptographic challenge-response, leveraging the did:web public key.
- All subsequent access is via OAuth-style tokens, with DID-based authentication.
- Users can approve VC operations asynchronously, without redirects, by authorizing pending requests in their PDS dashboard.
- This is secure, decentralized, user-centric, and fully automatable.
