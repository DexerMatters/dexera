import { existsSync, readFile, readdirSync, stat, statSync, watch } from 'fs';
import express from 'express';
import cors from 'cors';
import hound from 'hound';
import markdownit from 'markdown-it';
import markdownItStyle from 'markdown-it-style';
import markdownItTexmath from 'markdown-it-texmath';
import markdownItTextualUml from 'markdown-it-textual-uml';
import kate from 'katex';

import hljs from 'highlight.js'

const docsPath = "./docs";
const port = 3001;
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (__) { }
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});


md.use(markdownItStyle, {
  'p': "padding-left: 8px; font-size: 0.9em; line-height: 1.5em",
  'ul': "font-size: 0.9em; line-height: 1.5em",
  'h3': "border-left: 3px solid purple; padding-left: 8px",
  'code': "font-size: 0.85em; background-color: rgb(244, 236, 245); padding: 3px; border-radius: 10%",
  'blockquote': "padding: 2px 8px 2px 8px; color: rgb(73,54,72); border-left: 3px solid purple; background-color: rgb(244,236,245)"
});

md.use(markdownItTexmath, {
  engine: kate,
  delimiter: 'dollars',
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

md.use(markdownItTextualUml);

let catergory = [];
let app = express();
let watcher = hound.watch("./docs");

function updateCatergory(path, ctg) {
  readdirSync(path).forEach((name, index) => {
    let ctg_ = [];
    if (statSync(path + '/' + name).isDirectory()) {
      updateCatergory(path + '/' + name, ctg_);
    };
    ctg.push({
      title: name,
      path: path + '/' + name,
      sub: ctg_,
      md: name.endsWith(".md")
    })
  }
  )
}

watcher.on('change', (file, stats) => {
  catergory = [];
  updateCatergory(docsPath, catergory);
  console.log("[INFO] Catergory structure changed");
})

app.use(cors())

app.get("/catergory", (req, res) => {
  res.send(catergory);
})

app.get("/content", (req, res) => {
  let path = decodeURIComponent(req.query["path"]);
  if (statSync(path).isDirectory() && existsSync(path + "/index.md")) {
    path += "/index.md"
  };
  readFile(path, (err, data) =>
    res.send(md.render(String(data)))
  );
})

app.listen(port, () =>
  console.log("[INFO] Server is listening on Port", port))

updateCatergory(docsPath, catergory);
console.log("[INFO] Current catergory:\n", catergory);