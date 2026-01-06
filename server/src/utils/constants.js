/**
 * @fileoverview Authentication constants for response messages.
 * @description Centralized object to manage all authentication-related messages.
 * Similar to Laravel's language localization files.
 */

/**
 * Custom type for Authentication Message strings.
 * @typedef {string} AuthMessage
 */

/**
 * Type definition for the Authentication Messages Object.
 * @typedef {Object} AuthMessages
 * @property {AuthMessage} REQUIRED_FIELDS - Message for missing mandatory request body fields.
 * @property {AuthMessage} INVALID_CREDENTIALS - Message for password failure or incorrect credentials.
 * @property {AuthMessage} ROLE_MISMATCH - Message for unauthorized role access.
 * @property {AuthMessage} LOGIN_SUCCESS - Message for successful login.
 * @property {AuthMessage} USER_NOT_FOUND - Message for non-existent user records.
 */

/** * @type {AuthMessages} 
 * @constant
 */
const AUTH_MESSAGES = {
    REQUIRED_FIELDS: "Email, password, and role are required",
    INVALID_CREDENTIALS: "Invalid email or password",
    ROLE_MISMATCH: "Unauthorized access for this role",
    LOGIN_SUCCESS: "Login successful",
    USER_NOT_FOUND: "Account does not exist"
};

export {
    AUTH_MESSAGES
};