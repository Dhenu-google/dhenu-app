import { AuthErrorCodes } from "firebase/auth";

/**
 * Maps Firebase authentication and Firestore error codes to user-friendly messages.
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already in use. Please try signing in or use a different email.";
    case "auth/invalid-email":
      return "The email address is not valid. Please enter a valid email.";
    case "auth/weak-password":
      return "The password is too weak. Please use a stronger password.";
    case "auth/user-not-found":
      return "No user found with this email. Please check your email or sign up.";
    case "auth/wrong-password":
      return "The password is incorrect. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/invalid-credential":
      return "The credentials provided are invalid. Please check and try again.";
    case "firestore/unreachable":
      return "Could not reach Cloud Firestore. Please check your internet connection and try again.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/operation-not-allowed":
      return "This operation is not allowed. Please contact support.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid. Please check and try again.";
    case "auth/invalid-email":
      return "The email address is not valid. Please enter a valid email.";
    case "auth/user-disabled":
      return "This user account has been disabled. Please contact support.";
    case "auth/timeout":
      return "The operation timed out. Please try again.";
    case "auth/invalid-argument":
      return "An invalid argument was provided. Please check and try again."; 
    case "auth/network-request-failed":
      return "Network request failed. Please check your internet connection and try again.";
    case AuthErrorCodes.ADMIN_ONLY_OPERATION:
      return "This operation is restricted to administrators only. Please contact support.";
    case AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
      return "Your credentials are too old. Please sign in again.";
    case AuthErrorCodes.EXPIRED_OOB_CODE:
      return "The verification code has expired. Please request a new one.";
    case AuthErrorCodes.INVALID_API_KEY:
      return "The API key is invalid. Please check your configuration.";
    case AuthErrorCodes.INVALID_APP_ID:
      return "The App ID is invalid. Please check your configuration.";
    case AuthErrorCodes.INVALID_CERT_HASH:
      return "The certificate hash is invalid. Please check your configuration.";
    case AuthErrorCodes.INVALID_CONTINUE_URI:
      return "The continue URI is invalid. Please check your configuration.";
    case AuthErrorCodes.INVALID_IDP_RESPONSE:
      return "The identity provider response is invalid. Please check your configuration.";
    case AuthErrorCodes.INVALID_OOB_CODE:
      return "The out-of-band code is invalid. Please check your configuration.";
    case AuthErrorCodes.CREDENTIAL_MISMATCH:
      return "The credentials do not match. Please check and try again.";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "Network request failed. Please check your internet connection and try again.";
    case AuthErrorCodes.TIMEOUT:
      return "The operation timed out. Please try again.";
    case AuthErrorCodes.USER_CANCELLED:
      return "The user cancelled the operation. Please try again.";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "The password is too weak. Please use a stronger password.";
    case AuthErrorCodes.USER_DELETED:
      return "The user account has been deleted. Please contact support.";
    case AuthErrorCodes.TOKEN_EXPIRED:
      return "The token has expired. Please sign in again.";
    case AuthErrorCodes.EMAIL_EXISTS:
      return "The email address already exists. Please use a different email.";
    case AuthErrorCodes.INVALID_EMAIL:
      return "The email address is not valid. Please enter a valid email.";
    case AuthErrorCodes.INVALID_PASSWORD:
      return "The password is invalid. Please check and try again.";
    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
      return "The login credentials are invalid. Please check and try again.";
    case AuthErrorCodes.CAPTCHA_CHECK_FAILED:
      return "The CAPTCHA check failed. Please try again.";
    case AuthErrorCodes.INVALID_AUTH:
      return "(contact support. The authentication is invalid. Please check your configuration.";
    default:
      return "An unknown error occurred. Please try again.";
  }
}