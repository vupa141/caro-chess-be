import { Injectable } from '@nestjs/common';
import { HTTP_STATUS_CODE } from '../constant';

const DEFAULT_SUCCESS_MESSAGE = 'success';

export interface Error {
    key: string;
    errorCode?: number;
    message?: string;
}

export class SuccessResponse {
    code: number;
    message: string;
    data: any;

    constructor(data = {}) {
        this.code = HTTP_STATUS_CODE.SUCCESS;
        (this.message = DEFAULT_SUCCESS_MESSAGE), (this.data = data);
    }
}

export class ErrorResponse {
    code: number;
    message: string;
    errors: Error[];

    constructor(
        code = HTTP_STATUS_CODE.SERVER_ERROR,
        message = '',
        errors: Error[] = [],
    ) {
        this.code = code;
        this.message = message;
        this.errors = errors;
    }
}
