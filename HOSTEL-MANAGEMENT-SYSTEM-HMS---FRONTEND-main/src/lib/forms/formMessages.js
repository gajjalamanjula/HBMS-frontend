export const formMessages = {
  genericError: 'Something went wrong. Please try again.',
  validationError: 'Please fix the highlighted fields.',
  networkError: 'Unable to connect to the server. Please try again.',
  sessionExpired: 'Session expired. Please login again.',
};

export function createSuccess(entity = 'Record') {
  return `${entity} created successfully.`;
}

export function updateSuccess(entity = 'Record') {
  return `${entity} updated successfully.`;
}

export function deleteSuccess(entity = 'Record') {
  return `${entity} deleted successfully.`;
}

export function uploadSuccess(entity = 'File') {
  return `${entity} uploaded successfully.`;
}

export function actionSuccess(action = 'Action') {
  return `${action} completed successfully.`;
}

export function submitError(entity = 'form') {
  return `Unable to submit ${entity}. Please try again.`;
}
