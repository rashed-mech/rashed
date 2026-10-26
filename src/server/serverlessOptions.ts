// Preserve binary PDF and image bytes through the Lambda response envelope.
export const serverlessOptions = { binary: ['application/pdf', 'image/*', 'application/octet-stream'] };
