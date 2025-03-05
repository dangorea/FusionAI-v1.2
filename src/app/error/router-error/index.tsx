import React from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

/**
 * A custom error boundary element for React Router routes.
 * This will replace the default "Unexpected Application Error" page
 * and give you more details (including stack trace).
 */
export function RouterError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong!';
  let details = 'No additional error details were found.';

  if (isRouteErrorResponse(error)) {
    // This is a "Response" thrown in a loader/action, e.g.:
    //   throw new Response("Not Found", { status: 404 })
    title = `HTTP ${error.status} - ${error.statusText}`;
    // You can show a body here if you have one
    if (error.data) {
      details = JSON.stringify(error.data, null, 2);
    }
  } else if (error instanceof Error) {
    // This is a normal JS Error thrown in your component code
    title = error.name || 'Error';
    details = `Message: ${error.message}\n\nStack Trace:\n${error.stack}`;
  } else if (typeof error === 'string') {
    // In some rare cases, you might just get a string
    details = error;
  } else {
    // Fallback for anything else you might throw
    details = JSON.stringify(error);
  }

  const handleReload = () => {
    // Optionally reload or navigate
    window.location.reload();
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#c00' }}>Oops!</h2>
      <p>We encountered an unexpected error.</p>

      <h3 style={{ marginTop: '1rem' }}>{title}</h3>

      <details
        style={{ marginTop: '1rem', textAlign: 'left', whiteSpace: 'pre-wrap' }}
      >
        {details}
      </details>

      <div style={{ marginTop: '2rem' }}>
        <button type="button" onClick={() => navigate('/')}>
          Go Home
        </button>
        &nbsp;|&nbsp;
        <button type="button" onClick={handleReload}>
          Reload
        </button>
      </div>
    </div>
  );
}
