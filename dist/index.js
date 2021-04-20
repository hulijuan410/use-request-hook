"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUseRequest = void 0;
var react_1 = require("react");
var axios_1 = __importDefault(require("axios"));
var react_use_1 = require("react-use");
var qs_1 = __importDefault(require("qs"));
var fetchDataReducer = function (state, action) {
    switch (action.type) {
        case 'FETCH_INIT':
            return __assign(__assign({}, state), { loading: true, error: false });
        case 'FETCH_SUCCESS':
            return __assign(__assign({}, state), { loading: false, error: false, data: action.payload });
        case 'FETCH_ERROR':
            return __assign(__assign({}, state), { loading: false, error: true });
        default:
            throw new Error();
    }
};
var withUseRequest = function (defaultConfig, handleErrorRes, handleError) {
    if (defaultConfig === void 0) { defaultConfig = {}; }
    //useRequest Hook
    var useRequest = function (props) {
        var 
        //设置默认值
        url = props.url, _a = props.method, method = _a === void 0 ? 'GET' : _a, _b = props.configDatas, configDatas = _b === void 0 ? {} : _b, //默认传递数据都是json格式
        _c = props.trigger, //默认传递数据都是json格式
        trigger = _c === void 0 ? true : _c, _d = props.headers, headers = _d === void 0 ? {} : _d, handleData = props.handleData;
        var _e = react_1.useReducer(fetchDataReducer, {
            data: null,
            loading: true,
            error: false
        }), state = _e[0], dispatch = _e[1];
        var getIsMounted = react_use_1.useMountedState();
        //处理请求参数
        var getConfigDatas = function (configDatas) {
            //有参数
            if (JSON.stringify(configDatas) !== JSON.stringify({})) {
                //GET请求
                if (method.toUpperCase() === 'GET') {
                    url += "?" + qs_1.default.stringify(configDatas);
                    return;
                }
                else {
                    //其他请求
                    if (configDatas['formData'] ||
                        headers['content-type'] === 'multipart/form-data') {
                        return configDatas['formData'];
                    }
                    if (headers['content-type'] === 'application/x-www-form-urlencoded') {
                        return qs_1.default.stringify(configDatas);
                    }
                }
            }
        };
        var loadData = function (config) {
            if (config === void 0) { config = {}; }
            return __awaiter(void 0, void 0, void 0, function () {
                var promise;
                return __generator(this, function (_a) {
                    dispatch({ type: 'FETCH_INIT' });
                    promise = axios_1.default
                        .request({
                        //data和url顺序不能颠倒（url是在getConfigDatas中拼接的）
                        data: getConfigDatas(__assign(__assign({}, configDatas), config)),
                        url: url,
                        method: method
                    })
                        .then(function (res) {
                        //使用getIsMounted()判断如果请求返回的时候原来的页面已经卸载，则不更新状态，否则会报warning：Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function
                        if (!getIsMounted()) {
                            return res;
                        }
                        if (res.data.code === 0) {
                            dispatch({
                                type: 'FETCH_SUCCESS',
                                payload: handleData ? handleData(res) : res.data.data
                            });
                        }
                        else {
                            dispatch({ type: 'FETCH_ERROR' });
                            //错误处理
                            handleErrorRes &&
                                handleErrorRes(res, Object.assign({}, defaultConfig, props));
                        }
                        return res; //请求有返回的情况下都会把res返回，这样方便后续使用.then()进行扩展，更灵活
                    })
                        .catch(function (err) {
                        //错误处理
                        handleError && handleError(err);
                        dispatch({ type: 'FETCH_ERROR' });
                    });
                    return [2 /*return*/, promise];
                });
            });
        };
        react_1.useEffect(function () {
            if (trigger && url) {
                loadData();
            }
        }, [url, JSON.stringify(configDatas)]); // eslint-disable-line
        //JSON.stringify(variables)这里不能直接用variables，应为对象每次都会认为是不一样的
        return [state, loadData];
    };
    return useRequest;
};
exports.withUseRequest = withUseRequest;
exports.default = exports.withUseRequest();
