import React from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

export function RouterError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong!';
  let details = 'No additional error details were found.';

  if (isRouteErrorResponse(error)) {
    title = `HTTP ${error.status} - ${error.statusText}`;
    if (error.data) {
      details = JSON.stringify(error.data, null, 2);
    }
  } else if (error instanceof Error) {
    title = error.name || 'Error';
    details = `Message: ${error.message}\n\nStack Trace:\n${error.stack}`;
  } else if (typeof error === 'string') {
    details = error;
  } else {
    details = JSON.stringify(error);
  }

  const handleReload = () => {
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
