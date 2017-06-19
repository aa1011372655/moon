/**
 * Makes Computed Properties for an Instance
 * @param {Object} instance
 * @param {Object} computed
 */
/**
 * 代码解析
 * by blue
 */
// 初始化计算后函数
// instance传入的是Moon本身
// computed为用户传入的option.computed对象，
const initComputed = function(instance, computed) {
  // 设置需要监听计算的属性
  // prop为你需要监听的属性，该属性会最后返回计算后的值
  let setComputedProperty = function(prop) {
    // 获取观察者
    const observer = instance.$observer;

    // Flush Cache if Dependencies Change
    // 设置缓存该属性
    observer.observe(prop);

    // Add Getters
    // 绑定$data中的当前属性prop
    Object.defineProperty(instance.$data, prop, {
      // get函数
      get: function() {
        // Property Cache
        let cache = null;

        // If no cache, create it
        if(observer.cache[prop] === undefined) {
          // Capture Dependencies
          observer.target = prop;

          // Invoke getter
          cache = computed[prop].get.call(instance);

          // Stop Capturing Dependencies
          observer.target = null;

          // Store value in cache
          observer.cache[prop] = cache;
        } else {
          // Cache found, use it
          cache = observer.cache[prop];
        }

        return cache;
      },
      set: noop
    });

    // Add Setters
    let setter = null;
    if((setter = computed[prop].set) !== undefined) {
      observer.setters[prop] = setter;
    }
  }

  // Set All Computed Properties
  // 循环遍历所有的计算后对象，设置计算后对象需要监听的属性
  for(let propName in computed) {
    setComputedProperty(propName);
  }
}
