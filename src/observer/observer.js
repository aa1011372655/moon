/**
 * 代码解析
 * by blue
 * @param {*} instance 
 */
// 观察者类
function Observer(instance) {
  // Associated Moon Instance
  // 传入Moon主类本身
  this.instance = instance;

  // Computed Property Cache
  this.cache = {};

  // Computed Property Setters
  this.setters = {};

  // Set of events to clear cache when dependencies change
  this.clear = {};

  // Property Currently Being Observed for Dependencies
  this.target = null;

  // Dependency Map
  this.map = {};
}

Observer.prototype.observe = function(key) {
  const self = this;
  this.clear[key] = function() {
    self.cache[key] = undefined;
  }
}
/**
 * 通知函数，通知数据的变化
 * ！！！val传参不知何用
 */
Observer.prototype.notify = function(key, val) {
  let depMap = null;
  // 获取当前对象索引值，且不为undefined
  if((depMap = this.map[key]) !== undefined) {
    var depMapLength=depMap.length
    // 循环整个获取的当前
    for(let i = 0; i < depMapLength; i++) {
      this.notify(depMap[i]);
    }
  }

  let clear = null;
  if((clear = this.clear[key]) !== undefined) {
    clear();
  }
}
