# use-axios-hook

Custom React Hook for data fetching

# Installation

npm install use-axios-hook

# Usage

### use-axios-hook 暴露出的变量和函数

1. 请求参数变量：在 axios 现有参数基础上增加了以下三个参数

- configDatas：传递的数据，默认以 json 格式传递；
- trigger：布尔值，是否触发请求，true:发送，false：不发送；
- handleData：可以精确的获取数据

```
export type RequestParams<T = any, UrlType = any> = AxiosRequestConfig & {
  url: UrlType;
  configDatas?: {
    [key: string]: any;
  };
  trigger?: boolean;
  handleData?: (res: AxiosResponse) => T;
};
```

把请求参数暴露出来，方便使用者定制自己的请求参数，可以在现有参数的基础上进行扩展；

2. 导出一个默认的 useRequest hook，可以直接调用，见调用方式 1
- 请求参数：

3. 导出 withUseRequest 高阶函数，用户可以通过配置参数生成自己的 useRequest hook，见调用方式 2

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
export default withUseRequest();
```

### 两种调用方式

1. 直接调用导出的默认 useRequest hook

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

正常情况下，默认导出的 useRequest hook 就够用了，如果需要根据项目定制自己的 useRequest，可以使用如下方式

2. 使用导出的 withUseRequest 定制 useRequest

```
import { withUseRequest } from "use-axios-hook";
import { AxiosResponse } from "axios";

//在这里可以配置你项目里的通用配置，比如
interface ConfigType {
  isPage?: boolean; //页面级别的接口开启（接口错误跳错误页面），模块级别的接口不开启（接口错误做相应处理）
}
//配置请求url的类型
type UrlType = string;

//配置项目通用配置
const useRequest = () => {
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
  //默认配置
  const config = {
    openDefaultFunc: true,
    isPage: false
  };

  return withUseRequest<UrlType>(config, handleRes, handleErr, formatData);
};

export default useRequest;

```
