/**
 * Utility function to handle fetch errors consistently across the application
 * and log them prominently in the console
 */
export function handleFetchError(error: unknown, context: string = 'API') {
  // Create a prominent error message
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  const timestamp = new Date().toISOString();
  
  // Create a visually distinct console message
  console.error(`
⚠️ FETCH ERROR ⚠️
Time: ${timestamp}
Context: ${context}
Error: ${errorMessage}
${'='.repeat(50)}
`);

  // If it's a network error, add more details
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    console.error(`
🔍 Network Error Details:
- Check if the server is running
- Verify the API URL configuration
- Check network connectivity
- Ensure correct port configuration
${'='.repeat(50)}
`);
  }

  // Return the error message for UI display
  return errorMessage;
}
