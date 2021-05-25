# use-axios-hook

Custom React Hook for data fetching

# Installation

npm install use-axios-hook

# 基础调用

## 调用方式

```
//1、引入
import useRequest from "use-axios-hook";
//2、发起请求
const [state] = useRequest({
  url: "https://randomuser.me/api/",
  configDatas: {
    results: 50
  },
  method: "GET",
  trigger: true,//组件加载就发送请求
  handleData: (res) => res.data.results //精确获取需要返回的数据
});
//3、监听请求状态
  //loading状态
  useEffect(() => {
    if (state.loading) {
      ****
    }
  }, [state.loading]);
  //成功
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]);
  //失败
  useEffect(() => {
    if (state.error) {
      ****
    }
  }, [state.error]);
```

## 参数设置

#### 请求参数

- url: 请求 url，axios 自带参数（必填）
- configDatas：需要传递给后端的数据，以 json 格式传递，默认为 {}；（选填）
- trigger：布尔值，是否立即触发请求，true:立即发送，false：不发送，默认为 true；（选填）
- handleData：(res: AxiosResponse) => T;处理请求返回，精确获取想要的数据，默认不填；（选填）
- postWithGetMethod：布尔值，默认为 false（在后端接口为 post 请求但是需要使用 get 方式连接请求参数，并且请求参数需要其他方式触发得到，需要在触发时重新拼接 url，设置为 true）；（选填）

除此之前还包括 axios 所有自带的请求参数，参数类型设置如下：

```
export type RequestParams<T = any, UrlType = any> = AxiosRequestConfig & {
  url: UrlType;
  configDatas?: {
    [key: string]: any;
  };
  trigger?: boolean;
  handleData?: (res: AxiosResponse) => T;
  postWithGetMethod?: boolean;
};
```

### 返回参数

- state：状态对象，包含后端返回数据 data，请求加载状态 loading 和错误状态 error；
- loadData：用于发送请求的函数，当请求参数 trigger 为 false 时，请求不立刻发送，在触发时机调用 loadData 即可发起请求；
  - loadData 函数参数：需要发送给后端的请求数据，同样是 json 格式，默认为{}；（选填）
  - loadData 函数返回：promise，把后端返回数据 response 返回，这样方便后续使用.then()进行扩展，更灵活；

## Example

- 直接在 react 中调用

```
//AppReact.jsx
import React, { useState, useEffect } from "react";
import useRequest from "use-axios-hook";

function AppReact() {
  const [data, setData] = useState([]);
  //发请求
  const [state] = useRequest({
    url: "https://randomuser.me/api/",
    configDatas: {
      results: 50
    },
    method: "GET",
    trigger: true,//组件加载就发送请求
    handleData: (res) => res.data.results //精确获取需要返回的数据
  });
  //监听请求成功，改变状态
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]); //eslint-disable-line

  return (
    <>
      <ul>
        {state.loading && <p>loading....</p>}
        {data.length !== 0 &&
          data.map((item, index) => <li key={item.cell}>{item.name.title}</li>)}
        {state.error && <div>error</div>}
      </ul>
    </>
  );
}
export default AppReact;
```

- 使用 ts 语法

```
//AppTypescript.tsx
import React, { useState, useEffect } from "react";
import useRequest from "use-axios-hook";
//定义数据类型
interface Item {
  cell: string;
  name: {
    title: string;
  };
}

function AppTypescript() {
  const [data, setData] = useState<Item[]>([]);
  const [query, setQuery] = useState<number>(50);
  //发送数据请求
  const [state, loadData] = useRequest<Item[]>({//发送请求的时候可以传入需要获取的数据类型
    url: "https://randomuser.me/api/",
    configDatas: {
      results: query
    },
    method: "GET",
    trigger: false, //点击button按钮再发送请求
    handleData: (res) => res.data.results //精确获取需要返回的数据
  });
  //监听请求成功，改变状态
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]); //eslint-disable-line

  const handleClick = () => {
    //点击按钮发送请求，请求完成后可以通过then进行扩展，即可以拿到返回数据又可以进行其他操作，更加灵活
    loadData().then((res) => {
      console.log(res);
      setQuery(query === 50 ? 200 : 50);
    });
  };

  return (
    <>
      <button onClick={handleClick.bind(null)}>button</button>
      <ul>
        {/* {state.loading && <p>loading....</p>} */}
        {data.length !== 0 &&
          data.map((item, index) => <li key={item.cell}>{item.name.title}</li>)}
        {state.error && <div>error</div>}
      </ul>
    </>
  );
}
export default AppTypescript;

```

以上是使用默认配置，如果需要根据项目定制自己的 useRequest，比如定制错误处理函数，格式化请求返回数据，增加额外请求参数等，可以使用 use-axios-hook 导出的高阶函数 withUseRequest。

# 使用 withUseRequest 定制调用

## 导出代码

```
export const withUseRequest: <U>(
  defaultConfig?: {},
  handleErrorRes?: (res?: AxiosResponse, defaultConfig?: {}) => any,
  handleError?: (err?: any) => any,
  formatData?: (res?: AxiosResponse) => void
) => UseRequestType<U> = (
  defaultConfig = {},
  handleErrorRes,
  handleError,
  formatData
) => {
    const useRequest: ReturnType<typeof withUseRequest> = (props) =>{}
    return useRequest;
};
```

## withUseRequest 参数

- defaultConfig：增加请求的默认配置参数：json 格式，默认为{}；（选填）
- handleErrorRes：错误处理函数：比如处理 401,407 等情况，(res?: AxiosResponse, defaultConfig?: {}) => any；（选填）
  - handleErrorRes 函数参数：服务端返回数据 res，和所有的请求参数；
- handleError：错误处理函数：用于 catch 捕获到的错误处理；（选填）
- formatData：统一格式化后端返回数据，比如后端返回数据都是 res.data.data 这种格式，可以统一格式化返回为 res.data；（选填）

## Example

- 使用导出的 withUseRequest 定制自己的 useRequest

```
//useBaseRequest.js
import { withUseRequest } from "use-axios-hook";
import { AxiosResponse } from "axios";

//在这里可以配置你项目里的通用配置，比如
interface ConfigType {
  isPage?: boolean; //比如项目分页面级别的接口和模块级别的接口，对于页面级别的接口错误直接跳转错误页面，模块级别的接口错误只需要做错误处理，这时需要一个统一变量标识接口类型；
}
//配置请求url的类型
type UrlType = string;

//配置项目通用配置
const useBaseRequest = () => {
  //handleRes可以统一配置错误返回的逻辑，举例如下
  const handleRes = (res?: AxiosResponse, config?: ConfigType) => {
    if (res!.data.code === 401) {
      //比如401需要用户登录
      console.log("在这里增加用户登录的逻辑");
    } else if (res!.data.code === 407) {
      //比如407需要绑定手机号
      console.log("在这里增加绑定手机号的逻辑");
    } else {
      if (config!.isPage) {
        //页面级数据接口错误，400和500直接跳转，否则根据返回res分别处理
        if (res!.data.code >= 400) {
          console.log("直接跳转400页面");
        } else if (res!.data.code >= 500) {
          console.log("直接跳转500页面");
        }
      }
    }
  };
  //handleErr统一处理捕获错误逻辑
  const handleErr = (err?: any) => {
    console.error(err);
    console.log("直接跳转400页面");
  };
  //统一接口返回数据的格式，比如所有接口数据都包裹在返回数据的data字段中，这里可以统一返回res.data.data,否则在每个接口中要获取到数据都要调用res.data.data
  const formatData = (res?: AxiosResponse) => {
    return res?.data.data;
  };
  //除了自带的参数，需要额外增加的默认配置
  const config = {
    openDefaultFunc: true,
    isPage: false
  };

  return withUseRequest<UrlType>(config, handleRes, handleErr, formatData);
};

export default useBaseRequest;

```

- 使用定制好的 useRequest

```
import useBaseRequest from "./useBaseRequest";
...
...
const useRequest = useBaseRequest();
//接下来就和基础调用一样啦。。。
...
...
```
