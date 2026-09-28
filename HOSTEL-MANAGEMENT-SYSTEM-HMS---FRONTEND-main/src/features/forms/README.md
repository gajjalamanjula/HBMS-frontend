# Phase 12 form standard

All HMS create/update/auth/upload/payment forms should use:

- React Hook Form
- Zod schemas
- `src/components/form/*` reusable fields
- `mapServerErrorsToForm` for backend validation errors
- `SubmitButton` for disabled/loading submit state
- React Query mutations with invalidation in feature hooks

Production rule: page/component JSX should not call APIs directly. Form submit handlers call feature hooks/mutations only.
