export const HttpStatusFormatted = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'Ok',
  201: 'Created',
  202: 'Accepted',
  203: 'Non Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Ambiguous',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'Uri Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I Am A Teapot',
  421: 'Misdirected',
  422: 'Unprocessable Entity',
  424: 'Failed Dependency',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'Http Version Not Supported',
};

export const causesError = {
  400: () => ['Invalid request syntax.', 'Malformed request message.'],
  401: () => ['Missing or invalid authentication token.'],
  402: () => ['Payment is required to proceed.'],
  403: () => ['Client lacks permissions.', 'Forbidden resource.'],
  404: () => ['Resource does not exist.', 'Incorrect URL.'],
  405: () => [
    'HTTP method not allowed.',
    'Method not supported by the resource.',
  ],
  406: () => ['No acceptable content types.'],
  407: () => ['Proxy authentication required.'],
  408: () => [
    'Request timed out.',
    'Server did not receive full request in time.',
  ],
  409: () => [
    'Resource conflict.',
    'State of resource does not allow request.',
  ],
  410: () => ['Resource permanently removed.'],
  411: () => ['Content-Length header is missing.'],
  412: () => ['Preconditions in headers are false.'],
  413: () => ['Payload too large for server.'],
  414: () => ['URI too long for server to process.'],
  415: () => ['Unsupported media type.'],
  416: () => ['Invalid range specified.', 'No overlapping ranges.'],
  417: () => ['Expectation failed.'],
  418: () => ["I'm a teapot."],
  421: () => ['Request directed at wrong server.'],
  422: () => ['Unprocessable entity.'],
  424: () => ['Failed dependency.'],
  428: () => ['Precondition required.'],
  429: () => ['Too many requests sent in a given time frame.'],
  500: () => ['Server encountered an internal error.'],
  501: () => ['Request method not supported.'],
  502: () => ['Invalid response from upstream server.'],
  503: () => ['Server is currently unavailable.'],
  504: () => ['Upstream server did not respond in time.'],
  505: () => ['HTTP version not supported.'],
  default: () => ['Unexpected error.'],
};
export const messageError = {
  400: () =>
    'The server could not understand the request due to invalid syntax.',
  401: () =>
    'The client must authenticate it self to get the requested response.',
  402: () => 'This request requires payment.',
  403: () => 'The client does not have access rights to the content.',
  404: () => 'The server can not find the requested resource.',
  405: () =>
    'The request method is known by the server but is not supported by the target resource.',
  406: () =>
    'The server cannot produce a response matching the list of acceptable values.',
  407: () => 'The client must first authenticate itself with the proxy.',
  408: () =>
    'The server did not receive a complete request message within the time it was prepared to wait.',
  409: () =>
    'The request could not be completed due to a conflict with the current state of the target resource.',
  410: () =>
    'The target resource is no longer available at the origin server and this condition is likely to be permanent.',
  411: () =>
    'The server refuses to accept the request without a defined Content-Length.',
  412: () =>
    'One or more conditions given in the request header fields evaluated to false when tested on the server.',
  413: () =>
    'The server is refusing to process a request because the request payload is larger than the server is willing or able to process.',
  414: () =>
    'The server is refusing to service the request because the request-target is longer than the server is willing to interpret.',
  415: () =>
    'The origin server is refusing to service the request because the payload is in a format not supported by this method on the target resource.',
  416: () =>
    "None of the ranges in the request's Range header field overlap the current extent of the selected resource or the set of requested ranges is invalid.",
  417: () =>
    "The expectation given in the request's Expect header field could not be met by at least one of the inbound servers.",
  418: () => `I'm a teapot.`, // Humorous error status
  421: () =>
    'The request was directed at a server that is not able to produce a response.',
  422: () =>
    'The server understands the content type of the request entity, but was unable to process the contained instructions.',
  424: () =>
    'The method could not be performed on the resource because the requested action depended on another action and that action failed.',
  428: () => 'The origin server requires the request to be conditional.',
  429: () =>
    'The user has sent too many requests in a given amount of time (rate limiting).',
  500: () =>
    'The server has encountered a situation it does not know how to handle.',
  501: () =>
    'The request method is not supported by the server and cannot be handled.',
  502: () =>
    'The server, while acting as a gateway or proxy, received an invalid response from the upstream server.',
  503: () => 'The server is not ready to handle the request.',
  504: () =>
    'The server is acting as a gateway and cannot get a response in time.',
  505: () =>
    'The HTTP version used in the request is not supported by the server.',
  default: (message: string) =>
    `The request resulted in an error: ${message}. Please check your request and try again.`,
};

export const fixesError = {
  400: () => [
    'Check request syntax.',
    'Ensure request message is well-formed.',
  ],
  401: () => ['Provide valid authentication token.', 'Log in and try again.'],
  402: () => ['Ensure payment is completed.'],
  403: () => ['Check client permissions.', 'Request access if necessary.'],
  404: () => ['Verify resource URL.', 'Ensure resource exists.'],
  405: () => ['Check allowed HTTP methods for the resource.'],
  406: () => ['Ensure content types are acceptable.'],
  407: () => ['Authenticate with the proxy and try again.'],
  408: () => ['Try sending the request again.', 'Check server status.'],
  409: () => ['Resolve resource conflict and retry.'],
  410: () => ['Check if resource has been permanently removed.'],
  411: () => ['Include Content-Length header in the request.'],
  412: () => ['Ensure preconditions in headers are true.'],
  413: () => ['Reduce request payload size.', 'Check server limits.'],
  414: () => ['Shorten the request URI.', 'Check server URI limits.'],
  415: () => ['Use a supported media type for the request payload.'],
  416: () => ['Adjust the Range header fields to specify valid ranges.'],
  417: () => ['Review the Expect header field requirements.'],
  418: () => ['Try brewing coffee another way.'], // Humorous fix for teapot status
  421: () => ['Ensure request is directed at the correct server.'],
  422: () => ['Check request entity for errors or inconsistencies.'],
  424: () => ['Address the failed dependency and retry the request.'],
  428: () => ['Include necessary preconditions in the request.'],
  429: () => ['Wait for the rate limit to reset before retrying.'],
  500: () => ['Investigate server logs for details on the internal error.'],
  501: () => ['Check if the requested method is supported by the server.'],
  502: () => ['Verify responses from upstream server for validity.'],
  503: () => ['Retry the request later when the server may be available.'],
  504: () => [
    'Check gateway or proxy settings.',
    'Ensure upstream server is reachable.',
  ],
  505: () => ['Use a supported HTTP version in the request.'],
  default: () => ['Attempt the request again later.'],
};
