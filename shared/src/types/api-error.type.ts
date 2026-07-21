/** Standard error shape returned by the backend for failed requests. */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}
