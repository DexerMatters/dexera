import { readdirSync, statSync } from 'fs';
import express from 'express';
import cors from 'cors';

const docsPath = "./docs";
const port = 3001;

let catergory = [];
let app = express();

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

app.use(cors())

app.get("/catergory", (req, res) => {
  console.log("[INFO] Receive GET")
  res.send(catergory);
})

app.listen(port, () =>
  console.log("[INFO] Server is listening on Port", port))

updateCatergory(docsPath, catergory);
console.log("[INFO] Current catergory:\n", catergory);