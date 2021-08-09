import { useEffect, useReducer } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useMountedState } from 'react-use';
import qs from 'qs';

type ActionType = 'FETCH_INIT' | 'FETCH_SUCCESS' | 'FETCH_ERROR';
export type State<T = any> = {
  data: T;
  loading: boolean;
  error: boolean;
};

type Action<T = any> = {
  type: ActionType;
  payload?: T;
};

export type RequestParams<
  T = any,
  UrlType = any,
  OtherParams = any
> = AxiosRequestConfig & {
  // 兼容 `/api/{params}` 类型接口
  url: UrlType;
  configDatas?: {
    [key: string]: any;
  };
  trigger?: boolean;
  handleData?: (res: AxiosResponse) => T;
  postWithGetMethod?: boolean; //使用Post请求，但是需要把请求参数链接到url上，并且请求参数需要其他方式触发得到
} & OtherParams;

const fetchDataReducer: (state: State, action: Action) => State = (
  state: State,
  action: Action
) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        loading: true,
        error: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: false,
        data: action.payload
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: true
      };
    default:
      throw new Error();
  }
};

type UseRequestType<U = any, O = any> = <T = any>(
  params: RequestParams<T, U, O>
) => [State<T>, (config?: {}) => Promise<any>];

type WithRequestParams = {
  defaultConfig?: {};
  handleDefineError?: (res?: AxiosResponse, defaultConfig?: {}) => any;
  handleCatchErr?: (err?: any) => any;
  formatData?: (res?: AxiosResponse) => void;
  defineError?: (res?: AxiosResponse) => boolean;
};

export const withUseRequest: <U, O>( //O是为了在RequestParams中增加通用匹配参数
  params?: WithRequestParams
) => UseRequestType<U, O> = ({ ...params }) => {
  const {
    defaultConfig,
    handleDefineError,
    handleCatchErr,
    formatData,
    defineError
  } = params;
  //useRequest Hook
  const useBaseRequest: ReturnType<typeof withUseRequest> = (props) => {
    let {
      //设置默认值
      url,
      method = 'GET',
      configDatas = {}, //默认传递数据都是json格式
      trigger = true,
      headers = {},
      handleData,
      postWithGetMethod = false
    } = props;
    const [state, dispatch] = useReducer<
      (state: State, action: Action) => State
    >(fetchDataReducer, {
      data: null,
      loading: false,
      error: false
    });
    const getIsMounted = useMountedState();

    //处理请求参数
    const getConfigDatas: (
      configDatas: RequestParams['configDatas']
    ) => Object | string = (configDatas) => {
      //没有参数，直接返回
      if (Object.keys(configDatas).length === 0) return;
      //有参数
      // if (JSON.stringify(configDatas) !== JSON.stringify({})) {
      //GET请求
      if (method.toUpperCase() === 'GET') {
        url += `?${qs.stringify(configDatas)}`;
        return;
      } else {
        //其他请求
        if (postWithGetMethod) {
          //使用post请求，但是后端要求把请求参数连到url上，并且请求参数在页面加载时拿不到，所以需要拿到后重新拼接url
          url +=
            url!.indexOf('?') === -1
              ? `?${qs.stringify(configDatas)}`
              : `&${qs.stringify(configDatas)}`;
          return;
        }
        if (
          configDatas!['formData'] ||
          headers['content-type'] === 'multipart/form-data'
        ) {
          return configDatas!['formData'];
        }
        if (headers['content-type'] === 'application/x-www-form-urlencoded') {
          return qs.stringify(configDatas);
        }
      }
      // }
    };

    const loadData = async (config = {}) => {
      dispatch({ type: 'FETCH_INIT' });
      let promise = axios
        .request({
          //data和url顺序不能颠倒（url是在getConfigDatas中拼接的）
          ...props,
          data: getConfigDatas({ ...configDatas, ...config }),
          url: url,
          method: method
        })
        .then((res) => {
          //使用getIsMounted()判断如果请求返回的时候原来的页面已经卸载，则不更新状态，否则会报warning：Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function
          if (!getIsMounted()) {
            return res;
          }
          if (res.data.code === 0 || (defineError && !defineError(res))) {
            dispatch({
              type: 'FETCH_SUCCESS',
              payload: handleData
                ? handleData(res)
                : formatData
                ? formatData(res)
                : res.data
            });
          } else {
            dispatch({ type: 'FETCH_ERROR' });
            //错误处理
            handleDefineError &&
              handleDefineError(res, Object.assign({}, defaultConfig, props));
          }
          return res; //请求有返回的情况下都会把res返回，这样方便后续使用.then()进行扩展，更灵活
        })
        .catch((error) => {
          //错误处理
          handleCatchErr && handleCatchErr(error);
          dispatch({ type: 'FETCH_ERROR' });
          throw error;
        });
      return promise;
    };

    useEffect(() => {
      if (trigger && url) {
        loadData();
      }
    }, [url, JSON.stringify(configDatas)]); // eslint-disable-line
    //JSON.stringify(variables)这里不能直接用variables，应为对象每次都会认为是不一样的
    return [state, loadData];
  };
  return useBaseRequest;
};

export default withUseRequest();
