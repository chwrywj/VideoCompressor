import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from "@/locales";

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'

import './assets/css/common.scss'
import './assets/css/iconfont.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app')

/********************Vue原型扩展方法 begin********************/
//判断字符串是否为空
app.config.globalProperties.isNullOrEmpty = function (str) {
	if (typeof str == "undefined" || str == null || String(str).trim() == "")
		return true;
	else
		return false;
};

//克隆对象
app.config.globalProperties.clone = function (obj) {
	if (null == obj || "object" != typeof obj)
		return obj;

	return JSON.parse(JSON.stringify(obj));
};

//移除数组指定项
app.config.globalProperties.arrayRemove = function (arr, item) {
	var i = arr.length;
	while (i--) {
		if (arr[i] === item) {
			return arr.splice(i, 1);
		}
	}
	return arr;
};
/********************Vue原型扩展方法 end********************/
