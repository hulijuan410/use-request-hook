# use-axios-hook

**use-axios-hook**是使用[Typescript](https://www.typescriptlang.org)和[React Hooks](https://zh-hans.reactjs.org/docs/hooks-reference.html)封装的用于服务端请求的自定义 hook。

## 安装

```bash
// npm
$> npm install use-axios-hook
// yarn
$> yarn add use-axios-hook
```

## 快速入门

```js
//1、引入'use-axios-hook'包
import useRequest from 'use-axios-hook';
//2、调用：发起请求
const [state] = useRequest({
  url: 'https://randomuser.me/api/',
  configDatas: {
    results: 50
  },
  method: 'GET',
  trigger: true, //组件加载就发送请求
  handleData: (res) => res.data.results //精确获取需要返回的数据
});
//3、监听请求状态(包括三个状态：loading、success、error)
//请求成功
useEffect(() => {
  if (state.data) {
    setData(state.data);
  }
}, [state.data]);
```

## 一些常用实例

1. 组件加载就发送请求 [<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/trusting-river-qt84d?file=/src/App.tsx)

```js
import './styles.css';
import React, { useEffect, useState } from 'react';
//引入
import useRequest from 'use-axios-hook';

export default function App() {
  const [data, setData] = useState([]);
  //调用：发送请求
  const [state] = useRequest({
    url: 'https://randomuser.me/api/',
    configDatas: {
      results: 50
    },
    method: 'GET',
    trigger: true, //组件加载就发送请求
    handleData: (res) => res.data.results //精确获取需要返回的数据
  });
  //监听请求状态：数据请求成功
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]);
  return (
    <div className="App">
      <!-- 请求中（loading） -->
      {state.loading ? (
        <div>数据正在加载中........</div>
      ) : (
        data.length !== 0 &&
        data.map((item) => {
          return (
            <div key={item.phone} className="item">
              email:{item.email}
            </div>
          );
        })
      )}
      <!-- 请求失败（error） -->
      {state.error && <div>数据请求出错</div>}
    </div>
  );
}
```

2. 组件加载不即刻发送请求，需要其他事件触发请求[<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/jovial-feistel-p11wv?file=/src/App.tsx)

这个例子使用了 ts 语法，在 ts 中使用时，可以在使用 hook 时直接定义需要返回的数据类型。

```js
import "./styles.css";
import React, { useState, useEffect } from "react";
//引入use-axios-hook
import useRequest from "use-axios-hook";
//定义数据类型
interface Item {
  cell: string;
  name: {
    title: string;
  };
}

export default function App() {
  const [data, setData] = useState<Item[]>([]);
  const [query, setQuery] = useState<number>(50);
  //调用：未发起请求
  const [state, loadData] = useRequest<Item[]>({//直接定义需要返回的数据类型
    url: "https://randomuser.me/api/",
    configDatas: {
      results: query
    },
    method: "GET",
    trigger: false, //点击button按钮再发送请求
    handleData: (res) => res.data.results //精确获取需要返回的数据
  });
  //监听请求状态：数据请求成功
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]);
  //发送请求：点击按钮发送请求
  const handleClick = () => {
    //如果只是发送一次请求可以直接loadData()就可以了
    // loadData();
    //如果发送请求后还需要一些其他的操作，可以使用.then()进行扩展，.then()中既可以拿到请求返回，也可以进行js操作；
    loadData().then((res) => {
      console.log(res);
      setQuery(query === 50 ? 100 : 50);
    });
  };

  return (
    <>
      <button onClick={handleClick.bind(null)}>button</button>
      <ul>
        {state.loading ? (
          <p>loading....</p>
        ) : (
          data.length !== 0 &&
          data.map((item, index) => <li key={item.cell}>{item.name.title}</li>)
        )}
        {state.error && <div>error</div>}
      </ul>
    </>
  );
}

```

3. 使用 **withUseRequest 定制自己的 useRequest**[<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/cool-nobel-q2xpw?file=/src/App.tsx)

#### 针对所有接口可以选择性增加以下**通用配置**

- 定制请求参数 _url 的类型_；
- 定制判断服务端*是否正常返回数据的判断方法*；
- 定制服务端*非正常返回数据情况下的错误处理*；
- 定制 _catch 到的错误处理_；
- 统一处理服务端*返回数据的格式*；
- 统一*增加额外的请求参数*；

下面只是举例介绍怎么使用配置，详细参数请参考下面的 **API** 介绍。

```js
//useMyRequest.js
//导入withUseRequest
import { withUseRequest } from "use-axios-hook";
import { AxiosResponse } from "axios";

//定义增加额外的请求参数类型
interface ConfigType {
  isPage?: boolean; //比如项目需要一个布尔变量判断当前接口是否为页面级别的接口
}
//定制请求参数 url 的类型
type UrlType = string;

const useMyRequest = () => {
  //判断数据是否返回正确(假设code非0情况下数据返回错误)
  const defineError = (res?: AxiosResponse) => {
    return res.data.code !== 0;
  };
  //数据返回错误情况下的处理（handleDefineError中可以拿到服务端返回res和配置的额外请求参数）
  const handleDefineError = (res?: AxiosResponse, config?: ConfigType) => {
    if (res!.data.code === 401) {
      console.log("增加401处理逻辑");
    } else if (res!.data.code === 407) {
      console.log("增加407处理逻辑");
    } else {
      //页面级数据接口错误，400和500直接跳转，否则根据返回res分别处理
      if (config!.isPage) {
        if (res!.data.code >= 400) {
          console.log("直接跳转400页面");
        }
      } else {
        console.log(res);
      }
    }
  };
  //处理捕获错误
  const handleCatchErr = (err?: any) => {
    console.error(err);
    console.log("直接跳转400页面");
  };
  //统一接口返回数据的格式，假设所有接口数据都包裹在返回数据的data字段中，这里可以统一处理返回res.data.data,以免在每个接口调用中都要调用res.data.data
  const formatData = (res?: AxiosResponse) => {
    return res?.data.data;
  };
  //定义参数
  const config = {
    isPage: false
  };

  return withUseRequest<UrlType, ConfigType>(
    config,
    handleDefineError,
    handleCatchErr,
    formatData,
    defineError
  );
};

export default useMyRequest;

```

```js
//调用定制好的useRequest
import useMyRequest from "./useMyRequest";

export default function App() {
  //调用hook
  const useRequest = useMyRequest();
  const [data, setData] = useState<string[]>([]);
  const [num, setNumber] = useState<string | number>(2);
  //定义请求
  const [state, loadData] = useRequest<string[]>({
    url: "https://autumnfish.cn/api/joke/list",
    configDatas: {
      num: num
    },
    method: "GET",
    trigger: false, //点击button按钮再发送请求
    isPage: true//在useMyRequest中配置的参数
  });
  //监听请求成功，改变状态
  useEffect(() => {
    if (state.data) {
      setData(state.data);
    }
  }, [state.data]); //eslint-disable-line
  //发送请求
  const handleClick = () => {
    loadData().then(() => {
      if (num === 2) {
        setNumber("a");
      } else {
        setNumber(2);
      }
    });
  };
  return (
    <>
      <button onClick={handleClick.bind(null)}>button</button>
      <ul>
        {state.loading ? (
          <p>loading....</p>
        ) : state.error ? (
          <div>error</div>
        ) : (
          data.length !== 0 &&
          data.map((item, index) => <li key={index}>{item}</li>)
        )}
      </ul>
    </>
  );
}
```

## API 介绍

### **useRequest： 默认 hook**

- **请求参数**：包括 **axios** 所有自带的请求参数，还有以下 **4 个默认参数**

```js
//请求url
url: axios自带参数，可通过withUseRequest定制url类型，默认为string类型
//需要传递给后端的数据,默认为{}
configDatas?：json
//是否立即触发请求,true:立即发送，false：不发送，默认为 true
trigger?: boolean
//处理请求返回，精确获取想要的数据，默认不填
handleData?：(res: AxiosResponse) => T;
//在后端接口为 post 请求但是需要使用 get 方式连接请求参数，并且请求参数需要事件触发触发得到，因此需要在事件触发时使用请求参数重新拼接 url
//默认为false，需要使用以上方式发请求时设置为true
postWithGetMethod：boolean
```

- **返回参数**

```js
//状态对象
state：包含后端返回数据 data，请求加载状态 loading 和错误状态 error
//用于发送请求的函数，当请求参数 trigger 为 false 时，请求不立刻发送，在触发时机调用 loadData 即可发起请求
loadData：(data:json) => promise
//其中data为发送给后端的请求数据，json格式默认为{}，返回promise方便后续使用.then(res=>{})进行扩展
```

### **withUseRequest：定制 useRequest**

- **请求参数**

```js
//useRequest的默认请求参数上面已经列出，如果以上的参数对于你的项目还不够怎么办呢，可以使用withUseRequest的defaultConfig定制属于你自己项目的请求参数
defaultConfig?：json格式，默认为{}
//有些项目是通过res.data.code是否为0来判读服务端数据是否正常返回，有些则是通过res.status是否为200来判断，可以使用withUseRequest的defineError定制自己项目的数据是否正常返回的标准，true:非正常返回
defineError?：(res: AxiosResponse) => boolean
//数据非正常返回时的处理方法，函数参数：服务端返回数据 res，和所有的请求参数
handleDefineError?：(res, config) => void
//捕获到错误时的处理方法
handleCatchErr?: (err) => void
//统一格式化后端返回数据，比如后端返回数据都是 res.data.data 这种格式，这里可以统一处理返回res.data.data,以免在每个接口调用中都要调用res.data.data;
formatData?: (res) => T
```
