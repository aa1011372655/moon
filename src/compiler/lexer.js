/**
 * 语法分析器
 * @type {RegExp}
 */
const tagOrCommentStartRE = /<\/?(?:[A-Za-z]+\w*)|<!--/;
// 公共api
const lex = function(input) {
  let state = {
    input: input,
    current: 0,
    tokens: []
  }
  lexState(state);
  return state.tokens;
}

const lexState = function(state) {
  const input = state.input;
  const len = input.length;
  while(state.current < len) {
    // Check if it is text
    if(input.charAt(state.current) !== "<") {
      lexText(state);
      continue;
    }

    // Check if it is a comment
    if(input.substr(state.current, 4) === "<!--") {
      lexComment(state);
      continue;
    }

    // It's a tag
    // 不是注释也不是显示内容则解析标签
    lexTag(state);
  }
}
/**
 * 解析内容
 * @param state
 */
const lexText = function(state) {
  // 当前需要校验的字符串开始位置
  const current = state.current;
  // 当前需要处理的整个字符串
  const input = state.input;
  // 字符串长度
  const len = input.length;
  // 将完整的html字符串从开始位置截取得到之后的字符串搜索是否存在tag或者注释的开始符号，作为text的结束下标
  let endOfText = input.substring(current).search(tagOrCommentStartRE);
  // 如果找不到，说明只有文本，直接将文本类型存入tokens即可
  if(endOfText === -1) {
    // Only Text
    state.tokens.push({
      type: "text",
      value: input.slice(current)
    });
    state.current = len;
    return;
    // 只要不等于零，说明找到了下一个tag或者注释，那么讲之前的作为text类型存入tokens
  } else if(endOfText !== 0) {
    // End of Text Found
    endOfText += current;
    state.tokens.push({
      type: "text",
      value: input.slice(current, endOfText)
    });
    // 下一个开始查询的开始位置从新设置
    state.current = endOfText;
  }
}
// 解析注释
const lexComment = function(state) {
  // 当前字符串检索开始的位置
  const current = state.current;
  // 整个html字符串
  const input = state.input;
  // 整个html字符串长度
  const len = input.length;
  // 直接加4是由于注释的开始标识为<!--
  current += 4;
  // 获取这个注释的结束标识
  const endOfComment = input.indexOf("-->", current);
  // 如果不存在，则也把这个text作为注释
  if(endOfComment === -1) {
    // Only an unclosed comment
    state.tokens.push({
      type: "comment",
      value: input.slice(current)
    });
    state.current = len;
  } else {
    // End of Comment Found
    // 只要搜索到了，就将其中的注释提出来
    state.tokens.push({
      type: "comment",
      value: input.slice(current, endOfComment)
    });
    // 由于注释结束为-->所以加3
    state.current = endOfComment + 3;
  }
}
// 解析节点
const lexTag = function(state) {
  // 整个html字符串
  const input = state.input;
  // html字符串长度
  const len = input.length;

  // Lex Starting of Tag
  // 获取下一个字符，如果开始字符串类似于</，说明是结束节点标志
  const isClosingStart = input.charAt(state.current + 1) === "/";
  // 是结束节点就加2，否则继续向前推进一位字符
  state.current += isClosingStart === true ? 2 : 1;

  // Lex type and attributes
  // 获取标签的类型
  let tagToken = lexTagType(state);
  // 解析属性
  lexAttributes(tagToken, state);

  // Lex ending tag
  const isClosingEnd = input.charAt(state.current) === "/";
  state.current += isClosingEnd === true ? 2 : 1;

  // Check if Closing Start
  if(isClosingStart === true) {
    tagToken.closeStart = true;
  }

  // Check if Closing End
  if(isClosingEnd === true) {
    tagToken.closeEnd = true;
  }
}
/**
 * 获取标签类型
 * @param state 传入当前标签状态对象
 * @returns {{type: string, value: string}}
 */
const lexTagType = function(state) {
  // 完整html字符串
  const input = state.input;
  // 字符串长度
  const len = input.length;
  // 当前解析器步长
  let current = state.current;
  // 标签类型索引
  let tagType = "";
  while(current < len) {
    // 获取当前步长的单个字符
    const char = input.charAt(current);
    // 如果这个字符是/、>、空格时直接跳出循环，并且认为该标签为之前tagType字符串的值
    if((char === "/") || (char === ">") || (char === " ")) {
      break;
    } else {
      // 如果不是结束字段那么就加这个字符
      tagType += char;
    }
    // 步长向前推进
    current++;
  }
  // 写入标签token对象中
  const tagToken = {
    type: "tag",
    value: tagType
  };
  // 将该百千的token插入整个状态的tokens数组中
  state.tokens.push(tagToken);
  // 重置步长
  state.current = current;
  // 返回当前标签token
  return tagToken;
}
/**
 * 解析属性函数
 * @param tagToken
 * @param state
 */
const lexAttributes = function(tagToken, state) {
  // html字符串
  const input = state.input;
  // 字符长度
  const len = input.length;
  // 当前步长
  let current = state.current;
  // 该步长下的单个字符
  let char = input.charAt(current);
  // 获取下一个字符
  let nextChar = input.charAt(current + 1);

  const incrementChar = function() {
    current++;
    char = input.charAt(current);
    nextChar = input.charAt(current + 1);
  }
  // 属性索引
  let attributes = {};

  while(current < len) {
    // If it is the end of a tag, exit
    // 如果步长下的字符为闭合标签符号的话，跳出循环
    if((char === ">") || (char === "/" && nextChar === ">")) {
      break;
    }

    // If there is a space, skip
    // 如果是空格的话那么步长加1，替换当前的单个字符和下一个字符
    if(char === " ") {
      incrementChar();
      continue;
    }

    // Get the name of the attribute
    let attrName = "";
    let noValue = false;

    while(current < len && char !== "=") {
      if((char === " ") || (char === ">") || (char === "/" && nextChar === ">")) {
        noValue = true;
        break;
      } else {
        attrName += char;
      }
      incrementChar();
    }

    let attrValue = {
      name: attrName,
      value: "",
      meta: {}
    }

    if(noValue === true) {
      attributes[attrName] = attrValue;
      continue;
    }

    // Exit Equal Sign
    incrementChar();

    // Get the type of quote used
    let quoteType = " ";
    if(char === "'" || char === "\"") {
      quoteType = char;

      // Exit the quote
      incrementChar();
    }

    // Find the end of it
    while(current < len && char !== quoteType) {
      attrValue.value += char;
      incrementChar();
    }

    // Exit the end of it
    incrementChar();

    // Check for an Argument
    const argIndex = attrName.indexOf(":");
    if(argIndex !== -1) {
      const splitAttrName = attrName.split(":");
      attrValue.name = splitAttrName[0];
      attrValue.meta.arg = splitAttrName[1];
    }

    // Setup the Value
    attributes[attrName] = attrValue;
  }

  state.current = current;
  tagToken.attributes = attributes;
}
