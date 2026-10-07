const fs = require('fs');
const file = 'styles.css';
const obsolete = /body\.(?:design-(?:upscayl|linear|spotify|figma|notion)|style-(?:warm|tech|minimal|melancholy))\b/;
const splitSelectors = (value) => {
  const result = []; let depth = 0, start = 0;
  for (let i = 0; i < value.length; i++) {
    if ('(['.includes(value[i])) depth++;
    else if (')]'.includes(value[i])) depth--;
    else if (value[i] === ',' && depth === 0) { result.push(value.slice(start, i)); start = i + 1; }
  }
  result.push(value.slice(start)); return result;
};
let removed = 0;
let css = fs.readFileSync(file, 'utf8').replace(/([^{}]+)\{([^{}]*)\}/g, (rule, header, body) => {
  if (!obsolete.test(header)) return rule;
  const comment = header.match(/^(?:\s|\/\*[\s\S]*?\*\/)*\s*/)?.[0] || '';
  const selectors = splitSelectors(header.slice(comment.length));
  const kept = selectors.filter(selector => !obsolete.test(selector));
  removed += selectors.length - kept.length;
  return kept.length ? comment + kept.join(',') + '{' + body + '}' : '';
});
css = css.replace(/@media[^{}]+\{\s*\}/g, '').replace(/\/\* Upscayl: default site design, using the shared component structure\. \*\//, '/* Local font shared by the site themes. */');
fs.writeFileSync(file, css);
console.log(`Removed ${removed} obsolete theme selectors.`);
