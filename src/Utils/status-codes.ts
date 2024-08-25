export const HttpStatusCode = {
    OK: 200,                   // Success
    Created: 201,              // Resource created
    BadRequest: 400,           // Invalid request
    Unauthorized: 401,        // Authentication required
    Forbidden: 403,           // Access denied
    NotFound: 404,            // Resource not found
    InternalServerError: 500, // Server error
} as const;

export type HttpStatusCode = typeof HttpStatusCode[keyof typeof HttpStatusCode];