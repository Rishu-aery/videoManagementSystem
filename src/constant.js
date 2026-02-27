export const DB_NAME = "videoTube";


// ---------- Success/Error Constants -----------
export const CLIENT_ERROR = Object.freeze({
    BAD_REQUEST_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409
});

export const SERVER_ERROR = Object.freeze({
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
});

export const SUCCESS = Object.freeze({
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202
})