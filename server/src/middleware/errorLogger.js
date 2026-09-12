const errors = [];

const MAX_ERRORS = 100;

export const logError = ({
  error,
  req = null,
  statusCode = 500,
  type = 'API_ERROR',
}) => {
  const errorEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    statusCode,
    message: error?.message || String(error),
    name: error?.name || 'Error',
    stack: error?.stack || null,

    request: req
      ? {
          method: req.method,
          url: req.originalUrl,
          query: req.query,
          params: req.params,
          body: req.body,
          ip: req.ip,
        }
      : null,
  };

  errors.push(errorEntry);

  if (errors.length > MAX_ERRORS) {
    errors.shift();
  }

  console.error('\n========================================');
  console.error(` ${type}`);
  console.error('========================================');
  console.error('Time:', errorEntry.timestamp);
  console.error('Message:', errorEntry.message);
  console.error(
    'Endpoint:',
    req?.method || 'N/A',
    req?.originalUrl || 'N/A'
  );
  console.error('Status:', statusCode);
  console.error('Stack:\n', errorEntry.stack);
  console.error('========================================\n');

  return errorEntry;
};

export const getErrors = () => {
  return [...errors].reverse();
};

export const clearErrors = () => {
  errors.length = 0;
};