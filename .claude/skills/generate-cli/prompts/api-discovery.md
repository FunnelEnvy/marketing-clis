# API Discovery Prompt

When researching a marketing tool's API:

## Steps

1. **Search for official API docs** — Look for `{tool} API documentation`, `{tool} REST API`, `{tool} developer docs`
2. **Check for OpenAPI/Swagger spec** — Try fetching common paths:
   - `{api_base}/openapi.json`
   - `{api_base}/swagger.json`
   - `{docs_site}/api-spec.yaml`
3. **Identify auth method**:
   - API key (header or query param?)
   - OAuth2 (authorization code, client credentials?)
   - Both?
4. **Document each endpoint**:
   - HTTP method + path
   - Required vs optional parameters
   - Request body shape (for POST/PUT)
   - Response body shape (with field types)
   - Pagination pattern (offset, cursor, page?)
5. **Note rate limits**:
   - Requests per second/minute/hour
   - Rate limit headers (X-RateLimit-*, Retry-After)
   - Behavior when exceeded (429 response?)
6. **Note response envelope**:
   - Does the API wrap responses? (e.g., `{"data": [...], "meta": {...}}`)
   - How are errors formatted?

## Output

Save the inventory as `api-inventory.md` in the CLI repo root with this structure:

```markdown
# {Tool} API Inventory

## Authentication
- Method: {API key / OAuth2 / both}
- Header: {Authorization: Bearer {key}}

## Rate Limits
- {limit info}

## Endpoints

### {Resource} (e.g., Campaigns)

#### List {Resource}
- Method: GET
- Path: /api/v1/{resource}
- Params: limit, offset, status
- Response: { data: [...], total: N }

#### Get {Resource}
- Method: GET
- Path: /api/v1/{resource}/{id}
- Response: { id, name, ... }
```
