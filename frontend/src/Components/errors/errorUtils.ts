/**
 * Extracts a useful string message from whatever error was thrown.
 * Handles standard Error objects, strings, and objects with a 'message' property.
 * Provides a fallback message if nothing useful can be extracted.
 *
  @param error The caught error value (typically `unknown`).
 * @param defaultMessage Optional message to return if extraction fails.
 * @returns A string error message.
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = "Something went wrong. Please try again."
): string {
  // --- Most common case: Standard Error object ---
  if (error instanceof Error) {
    // use if not empty otherwise fallback(defaultMessage)
    return error.message || defaultMessage;
  }

  // --- Case: A plain string was thrown ---
  if (typeof error === "string") {
    return error || defaultMessage;
  }

  // --- Case: An object with a 'message' property (like some API errors) ---
  // Check it's an object, not null, and actually has the key 'message'
  if (error && typeof error === "object" && "message" in error) {
    // Extract the message property safely
    const messageValue = (error as { message: unknown }).message;

    // If the message property is a non-empty string, use it
    if (typeof messageValue === "string" && messageValue) {
      return messageValue;
    }
    // If message property is something else (like a number), try converting it
    if (messageValue !== null && messageValue !== undefined) {
      return String(messageValue);
    }
  }

  // console.warn("Could not extract specific error message:", error); //  log for debugging

  return defaultMessage;
}

//API errors
interface ApiErrorFormat {
  response?: {
    data?: {
      message?: string;
      detail?: string; // Sometimes APIs use 'detail' (same as meta? should be cleared!!!!!!!!)
    };
  };
  message?: string; // Axios often includes a top-level message too
}

function isApiErrorFormat(error: unknown): error is ApiErrorFormat {
  return (
    typeof error === "object" &&
    error !== null &&
    ("message" in error || "response" in error)
  );
}

export function extractApiErrorMessage(error: unknown): string {
  if (isApiErrorFormat(error)) {
    // Try nested message first
    const nestedMsg =
      error.response?.data?.message || error.response?.data?.detail;
    if (typeof nestedMsg === "string" && nestedMsg) {
      return nestedMsg;
    }
    // Try top-level message
    if (typeof error.message === "string" && error.message) {
      return error.message;
    }
  }
  // Fallback to the general extractor
  return extractErrorMessage(error, "API request failed.");
}
