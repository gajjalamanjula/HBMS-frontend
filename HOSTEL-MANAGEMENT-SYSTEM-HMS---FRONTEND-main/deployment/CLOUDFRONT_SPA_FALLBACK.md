# CloudFront SPA fallback required before domain launch

This frontend uses React Router with `BrowserRouter`, so dashboard routes such as `/manager/bookings`, `/tenant/payments`, and `/owner/dashboard` are client-side routes.

Configure the CloudFront distribution custom error responses:

| Origin error | Response page path | Response code | Error caching min TTL |
|---|---|---:|---:|
| 403 | /index.html | 200 | 0 |
| 404 | /index.html | 200 | 0 |

After deployment, test direct refresh for these URLs:

- `/`
- `/branches`
- `/branches/1`
- `/login`
- `/owner/dashboard`
- `/manager/bookings`
- `/tenant/payments`
- `/staff/complaints`
- `/superadmin/users`

If any route returns CloudFront/S3 403 or 404 instead of the React page, the SPA fallback is not configured correctly.
