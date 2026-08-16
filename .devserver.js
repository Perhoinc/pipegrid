const http=require("http"),fs=require("fs"),path=require("path");
const root=__dirname;
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml"};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split("?")[0]);
  if(p==="/") p="/index.html";
  const fp=path.join(root,p);
  fs.readFile(fp,(err,data)=>{
    if(err){ res.writeHead(404); res.end("not found"); return; }
    const ext=path.extname(fp);
    res.writeHead(200,{"Content-Type":MIME[ext]||"application/octet-stream"});
    res.end(data);
  });
}).listen(8934,()=>console.log("dev server on 8934"));
