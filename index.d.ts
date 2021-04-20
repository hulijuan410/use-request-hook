import { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare type State<T = any> = {
    data: T;
    loading: boolean;
    error: boolean;
};
export declare type RequestParams<T = any, UrlType = any> = AxiosRequestConfig & {
    url: UrlType;
    configDatas?: {
        [key: string]: any;
    };
    trigger?: boolean;
    handleData?: (res: AxiosResponse) => T;
};
declare type UseRequestType<U = any> = <T = any>(params: RequestParams<T, U>) => [State<T>, (config?: {}) => Promise<any>];
export declare const withUseRequest: <U>(defaultConfig?: {}, handleErrorRes?: (res?: AxiosResponse, defaultConfig?: {}) => any, handleError?: (err?: any) => any, formatData?: (res?: AxiosResponse) => void) => UseRequestType<U>;
declare const _default: UseRequestType<unknown>;
export default _default;
