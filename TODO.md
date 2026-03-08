## TODO

### Setup
- [Done] Confirm required Node/Bun versions
- [ ] Add environment variables documentation (`.env.example`)
- [ ] Add a root `README.md` (project overview, run commands)

### Backend
- [ ] Verify API routes are mounted and reachable
- [ ] Add request validation (inputs + error responses)
- [ ] Add edit post, image to the user profile and 
- [ ] Add auth flow (signup/login) and route protection (if applicable)
- [ ] Add pagination/filtering for post listing (if applicable)
- [ ] Add centralized error handling + consistent response shape

### Frontend
- [ ] Wire up API client (base URL, auth headers, error handling)
- [ ] Add core pages (list posts, post detail, create/edit) (if applicable)
- [ ] Add loading/empty/error states

### Testing
- [ ] Add unit tests for controllers/utils
- [ ] Add API integration tests for key routes

### Quality & Tooling
- [ ] Add linting/formatting scripts (and run them in CI)
- [ ] Add basic logging and request tracing (as needed)

### Deployment
- [ ] Document deploy steps (env vars, build, start)
- [ ] Add health check endpoint and monitoring notes
