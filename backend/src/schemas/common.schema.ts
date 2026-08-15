import { Type } from 'typebox';

export const ApiErrorSchema = Type.Object(
  {
    statusCode: Type.Number(),
    error: Type.String(),
    message: Type.String(),
  },
  { $id: 'ApiError', additionalProperties: false },
);

export type ApiErrorResponse = Type.Static<typeof ApiErrorSchema>;

export const StatusMessageSchema = Type.Object(
  {
    message: Type.String(),
    status: Type.Number(),
  },
  { $id: 'StatusMessage', additionalProperties: false },
);

export type StatusMessage = Type.Static<typeof StatusMessageSchema>;
