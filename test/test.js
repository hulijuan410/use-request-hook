'use strict';
const expect = require('chai').expect;
const useRequest = require('../dist/index').default;
console.log(useRequest);
const [state, loadData] = useRequest({
  //发送请求的时候确定要返回的数据类型
  url: 'https://randomuser.me/api/',
  configDatas: {
    results: query
  },
  method: 'GET',
  trigger: false,
  handleData: (res) => res.data.results //精确获取需要返回的数据
});

loadData().then((res) => {
  console.log(res);
});
