import {
  HttpStatusFormatted,
  causesError,
  fixesError,
  messageError,
} from '../domain/http_status.domain';

export function generateErrorMessages(
  code: number,
  response: string | string[] | object,
) {
  let errorMessage = response;
  if (
    typeof response === 'object' &&
    (response as object).hasOwnProperty('message')
  ) {
    errorMessage = (response as { message: string }).message;
  }

  return {
    statusCode: code,
    error: HttpStatusFormatted[code],
    message: (messageError[code] || messageError.default)(
      HttpStatusFormatted[code],
    ),
    details: {
      description: errorMessage,
      possibleCauses: (causesError[code] || causesError.default)(),
      suggestedFixes: (fixesError[code] || fixesError.default)(),
    },
  };
}
