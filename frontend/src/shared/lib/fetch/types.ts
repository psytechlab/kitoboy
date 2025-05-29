export interface ErrorOptions {
    silent?: boolean | undefined;
    message?: string | undefined;
}

export interface ErrorOptionsByStatusCode {
    [responseCode: number]: ErrorOptions;
    default?: ErrorOptions;
}

export type Fetch = typeof fetch;

export type FetchInput = Parameters<Fetch>;

export type ErrorData<T = unknown> = Record<string, unknown> | string | T;

export interface ExtendedError<T = unknown> extends Error {
    status: number;
    statusText?: string;
    httpMethod: 'get' | 'post' | 'put' | 'delete';
    data: ErrorData<T>;
}
