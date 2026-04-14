import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/locales/default/suggestQuestions.ts', 'utf-8');

// 移除 export default { ... }
const inner = content.replace(/^export default \{/, '').replace(/\};\s*$/, '');

// 解析所有 'key': 'value' 或 'key':\n  'value'
const result = {};
const lines = inner.split('\n');
let currentKey = null;
let collectingValue = false;
let valueLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // 检测 'key': 'value' 单行
  const singleLine = line.match(/^\s*'([^']+)':\s*'(.*)',?\s*$/);
  if (singleLine) {
    result[singleLine[1]] = singleLine[2].replace(/\\'/g, "'").replace(/\\n/g, '\n');
    continue;
  }

  // 检测 'key': 开始多行值
  const keyStart = line.match(/^\s*'([^']+)':\s*$/);
  if (keyStart) {
    currentKey = keyStart[1];
    collectingValue = true;
    valueLines = [];
    continue;
  }

  // 检测多行值的内容行（以 'value...', 格式）
  if (collectingValue && currentKey) {
    const valueLine = line.match(/^\s*'(.*)',?\s*$/);
    if (valueLine) {
      result[currentKey] = valueLine[1].replace(/\\'/g, "'").replace(/\\n/g, '\n');
      collectingValue = false;
      currentKey = null;
    }
  }
}

console.log('Keys found:', Object.keys(result).length);
writeFileSync('locales/zh-CN/suggestQuestions.json', JSON.stringify(result, null, 2), 'utf-8');
console.log('Written to locales/zh-CN/suggestQuestions.json');
