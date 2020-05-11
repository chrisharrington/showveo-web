export enum ErrorCode {
    Unauthorized = 401,
    InternalError = 500
}

export class HttpError extends Error {
    code: ErrorCode;

    constructor(code: ErrorCode, message: string) {
        super(message);
        
        this.code = code;
    }
}