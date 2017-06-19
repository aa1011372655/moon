/**
 * Sets Up Methods
 * @param {Object} instance
 */
/**
 * 代码解析
 * by blue
 */
// 初始化在声明中的所有对象方法method
const initMethods = function (instance, methods) {
  // 初始化方法函数，传入方法名和方法函数
  const initMethod = function (methodName, method) {
    // 将方法传入到$data对象中，并且将函数执行指向this（Moon类），并且传入所有参数
    instance.$data[methodName] = function () {
      return method.apply(instance, arguments);
    }
  }
  // 循环遍历用户传入的option.methods对象，将所有函数传入$data中，并重新设置this指向，使其this指向Moon本身
  for (const method in methods) {
    initMethod(method, methods[method]);
  }
}
