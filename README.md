# use-axios-hook

**use-axios-hook**是使用[Typescript](https://www.typescriptlang.org)和[React Hooks](https://zh-hans.reactjs.org/docs/hooks-reference.html)，基于 [axios](https://github.com/axios/axios) 封装的用于服务端请求的 react 自定义 hook。

## 安装

```bash
// npm
$> npm install use-axios-hook
// yarn
$> yarn add use-axios-hook
```

## 快速入门

```js
//1、引入'use-axios-hook'
import useRequest from 'use-axios-hook';
//2、调用：发起请求
const [state] = useRequest({
  url: 'https://randomuser.me/api/',
  configDatas: {
    results: 50
  },
  method: 'GET',
  trigger: true,
  handleData: (res) => res.data.results
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

**1. 组件加载就发送请求** [<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/trusting-river-qt84d?file=/src/App.tsx)

```js
import './styles.css';
import React, { useEffect, useState } from 'react';
//引入'use-axios-hook'
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

**2. 组件加载不即刻发送请求，需要其他事件触发请求**[<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/jovial-feistel-p11wv?file=/src/App.tsx)

_这个例子使用了 ts 语法，在 ts 中使用时，可以在调用 hook 时就传入需要返回的数据类型进行类型检测_

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
  const [state, loadData] = useRequest<Item[]>({//<Item[]>传入需要返回的数据类型
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
    //如果发送请求后还需要一些其他的操作，可以使用.then()进行扩展，.then(res=>{})中既可以拿到请求返回，也可以进行js操作；
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

**3. 使用 withUseRequest 定制自己的 useRequest**[<font color=#467aff>在 codesandbox 试试吧</font>](https://codesandbox.io/s/cool-nobel-q2xpw?file=/src/App.tsx)
_例子没有实际逻辑意义，纯粹为了举例说明(点击两次试试哦~)_

##### **针对所有接口可以选择性增加以下*通用配置***

- 定制请求参数 _url 的类型_；
- 定制判断服务端*是否正常返回数据的判断方法*；
- 定制服务端*非正常返回数据情况下的错误处理*；
- 定制 _catch 到的错误处理_；
- 统一处理服务端*返回数据的格式*；
- 统一*增加额外的请求参数*；

下面只是举例介绍怎么使用配置，详细参数请参考下面的 [**API**](#api) 介绍。

```js
//定制useRequest
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

  return withUseRequest<UrlType, ConfigType>({
    defaultConfig: config,
    handleDefineError,
    handleCatchErr,
    formatData,
    defineError
  });
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

## <div id="api">API 介绍</div>

### **useRequest： 默认 hook**

- **请求参数**：包括 [**axios**](https://github.com/axios/axios) 所有自带的请求参数，还有以下除 URL 外的**5 个新增参数**

```js
//请求url
url: axios自带参数，可通过withUseRequest定制url类型，默认为string类型
//需要传递给后端的数据,都是以json格式传递,默认为{}
configDatas?：json
//是否立即触发请求,true:立即发送，false：不发送，默认为 true
trigger?: boolean
//处理请求返回，精确获取想要的数据，默认不填
handleData?：(res: AxiosResponse) => T;
//控制header中content-type的类型，默认为json
//type ContentType = 'urlencoded' | 'json' | 'formdata';
contentType?: ContentType;
//后端接口为post/PUT/PATCH请求，但是需要以GET方式传递参数，默认为false（一般不会有这种方式，但是遇到过就加上了，也是以防意外）
postWithGetMethod：boolean
```

**对请求参数 contentType 进行说明：**

当 axios 请求为 GET 或 DELETE 请求时，一般不需要设置 contentType，当请求为 POST、PUT 或 PATCH 时，需要根据传递给后端的数据格式将 contentType 设置为以下三种类型之一（因为我们规定数据是以 json 格式传递的所以 contentType 默认为 json，当需要其他格式的数据时需要在请求中设置 contentType 为相应的类型）：

1. urlencoded：对应 content-type 为 application/x-www-form-urlencoded；
2. json：对应 content-type 为 application/json；
3. formdata: 对应 content-type 为 multipart/form-data，**特别注意：这种类型传递的数据必须以 formData 命名，js 举例如下**

```js
//定义请求
const [file, loadFile] = useRequest({
  url:
    'http://test.doc.ie.sogou/api/documents?X-SOHUPASSPORT-USERID=0FA5A34E68F8A47D976E62D803CE847E@qq.sohu.com',
  method: 'POST',
  trigger: false,
  contentType: 'formdata' //***设置contentType为formdata格式***
});
//发送请求（FormData本身就是一种key=value的形式）
const handleLoadFile = (e: any) => {
  let file = e.target.files[0];
  const form = new FormData();
  form.append('file', file);
  form.append('name', 'test');
  loadFile({
    formData: form //***注意这里必须命名为formData，否则取不到，因为在useRequest中我是这么取值的`if (contentType === 'formdata') {return configDatas!['formData'];}`***
  });
};
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

#### 为什么要自己定制呢，原因在于

1. useRequest 的默认请求参数上面已经列出，如果以上的参数对于你的项目还不够怎么办呢，可以使用 withUseRequest 的 defaultConfig 定制属于你自己项目的**请求参数**;
2. 有些项目是通过 res.data.code 是否为 0 来判读服务端数据是否正常返回，有些则是通过 res.status 是否为 200 来判断，每个项目的标准都不一样,可以使用 withUseRequest 的 defineError 定制自己项目的**数据是否正常返回的标准**；
3. 每个项目所有接口的**错误处理**基本是相同的，可以在 withUseRequest 中统一配置；
4. 统一**格式化后端的返回数据**，比如后端返回数据都是 res.data.data 这种格式，这里可以统一处理返回 res.data.data,以免在每个接口调用中都要调用 res.data.data;
5. 自己定制的请求参数 **defaultConfig 在**自己定制的错误处理函数 **handleDefineError 中是可以获取到的**；

- **函数参数**

```js
//定制属于你自己项目的请求参数
defaultConfig?：json格式，默认为{}
//定制自己项目的数据是否正常返回的标准，默认为res.data.code !== 0，defineError返回true:非正常返回
defineError?：(res: AxiosResponse) => boolean
//数据非正常返回时的处理方法，函数参数：服务端返回数据 res，和所有的请求参数
handleDefineError?：(res, config) => void
//捕获到错误时的处理方法
handleCatchErr?: (err) => void
//统一格式化后端返回数据
formatData?: (res) => T
```
