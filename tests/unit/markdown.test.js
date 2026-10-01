const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// renderMarkdown is a pure method (String + regex only), so extract it from the
// GeapApp object literal and exercise it without a DOM. Brace-matching is safe
// here because every "{"/"}" in the body (regex quantifiers, template literals)
// is balanced.
function loadRenderMarkdown() {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'js', 'app.js'), 'utf8');
  const marker = 'renderMarkdown(text) {';
  const start = src.indexOf(marker);
  assert.ok(start >= 0, 'renderMarkdown should exist in js/app.js');

  let depth = 0;
  let end = -1;
  for (let j = src.indexOf('{', start + marker.length - 1); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) { end = j; break; }
  }

  const body = src.slice(src.indexOf('{', start + marker.length - 1), end + 1);
  return new Function('return function renderMarkdown(text) ' + body + ';')();
}

const render = loadRenderMarkdown();

const cases = [
  ['h1', '# Top', '<h1>Top</h1>'],
  ['h4', '#### Report', '<h4>Report</h4>'],
  ['bold/italic/code', '**a** *b* `c`', '<strong>a</strong> <em>b</em> <code>c</code>'],
  ['strikethrough', '~~gone~~', '<del>gone</del>'],
  ['unordered list', '- a\n- b', '<ul><li>a</li><li>b</li></ul>'],
  ['task unchecked', '- [ ] todo', '<ul><li><label class="markdown-task"><input type="checkbox" disabled> todo</label></li></ul>'],
  ['task checked', '- [x] done', '<ul><li><label class="markdown-task"><input type="checkbox" disabled checked> done</label></li></ul>'],
  ['ordered list', '1. a\n2. b', '<ol><li>a</li><li>b</li></ol>'],
  ['blockquote', '> quoted', '<blockquote>quoted</blockquote>'],
  ['whitespace hr', '- - -', '<hr>'],
  ['hr', '---', '<hr>'],
  ['fenced code escapes html', '```\nx = <b> & y\n```', '<pre><code>x = &lt;b&gt; &amp; y</code></pre>'],
  ['list then paragraph closes list', '- a\ntext', '<ul><li>a</li></ul>text'],
  ['table with inline formatting', '| **A** | B |\n|---|---|\n| 1 | 2 |',
    '<div class="table-wrap"><table><thead><tr><th><strong>A</strong></th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>'],
  ['streaming: partial table stays text', '| a | b |', '| a | b |'],
  ['internal link', '[Go](/accounts)', '<a href="/accounts" data-route>Go</a>'],
  ['external link', '[x](https://e.com)', '<a href="https://e.com" target="_blank" rel="noreferrer">x</a>'],
  ['empty input', '', ''],
];

for (const [name, input, expected] of cases) {
  test('renderMarkdown - ' + name, () => {
    assert.strictEqual(render(input), expected);
  });
}
