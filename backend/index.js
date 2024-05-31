import { existsSync, readFile, readdirSync, stat, statSync, watch } from 'fs';
import express from 'express';
import cors from 'cors';
import hound from 'hound';

const docsPath = "./docs";
const port = 3001;

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
      sub: ctg_
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
  console.log(req.query["path"]);
  if (statSync(path).isDirectory() && existsSync(path + "/index.md")) {
    path += "/index.md"
  };
  console.log(path);
  readFile(path, (err, data) =>
    res.send(data)
  );
})

app.listen(port, () =>
  console.log("[INFO] Server is listening on Port", port))

updateCatergory(docsPath, catergory);
console.log("[INFO] Current catergory:\n", catergory);