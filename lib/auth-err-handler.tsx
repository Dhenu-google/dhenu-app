/**
 * Maps Firebase authentication error codes to user-friendly messages.
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
    default:
      return "An unknown error occurred. Please try again.";
  }
}