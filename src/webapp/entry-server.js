import { createApp } from './main.js';
//核心的目的 有2个 
//摘取每一个当前路由 index/test -> vue router=>compents
//compents异步的数据 组装成一个页面
//把后端请求的这套流程的数据交给 context.state
export default context => {
    return new Promise((resolve, reject) => {
        const { app, router, store } = createApp();
        //后台真实的路由 a/b 
        //router是前端的路由 context.url后台给你的环境
        router.push(context.url);
        //onReady方法把一个回调排队，在路由完成初始导航时调用，这意味着它可以解析所有的异步进入钩子和路由初始化相关联的异步组件。
        //这可以有效确保服务端渲染时服务端和客户端输出的一致。
        //第二个参数 errorCallback 只在 2.4+ 支持。它会在初始化路由解析运行出错 (比如解析一个异步组件失败) 时被调用
        router.onReady(() => {
            //getMatchedComponents返回目标位置或是当前路由匹配的组件数组（是数组的定义/构造类，不是实例）。通常在服务端渲染的数据预加载时时候。
            const matchCompents = router.getMatchedComponents();
            Promise.all(matchCompents.map((Component) => {
                    if (Component.asyncData) {
                        return Component.asyncData({
                            store
                        })
                    }
                }))
                .then(() => {
                    //读取完
                    context.state = store.state;
                    resolve(app);
                }).catch(reject)
        }, reject);
    });
}
