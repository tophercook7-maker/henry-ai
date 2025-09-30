// HENRY_SYSTEM_HELPERS_BEGIN
import os from "node:os";
import child_process from "node:child_process";
const ex = (cmd,args,opts={}) => new Promise((resolve)=>{
  const ps = child_process.spawn(cmd,args,{shell:false,env:process.env,...opts});
  let out="", err=""; ps.stdout.on("data",d=>out+=d); ps.stderr.on("data",d=>err+=d);
  ps.on("close",code=>resolve({code,out,err}));
});
function safeStr(s){ return String(s??"").trim(); }
function isPlainNumber(s){ return /^[0-9]+$/.test(s); }
function rejectPathy(a){ return a.some(x => /(^\/|\.{2}\/|\/\.{2}|~)/.test(x)); }
function capArgs(args, limit=16){ if(args.length>limit) throw new Error("too-many-args"); return args; }

const ALLOWED = {
  git: new Set(["status","branch","rev-parse","log","show","diff","ls-files","add","commit","push"]),
  gh:  new Set(["repo","pr","issue","auth"]),
  xcodebuild: new Set(["-showsdks","-version","-list"]),
  uname: new Set(["-a"]),
  node: new Set(["-v"]),
  npm:  new Set(["-v"])
};

app.post("/system/run", async (req,res)=>{
  try{
    const admin = safeStr(req.headers["x-local-admin"])==="1";
    const dang  = safeStr(req.headers["x-dangerous"])==="1"; // required for writey git ops
    if(!admin) return res.status(403).json({ok:false,error:"admin-off"});

    const body=req.body||{};
    const cmd = safeStr(body.cmd);
    let args = Array.isArray(body.args)? body.args.map(safeStr) : [];
    const cwd  = safeStr(body.cwd)||process.cwd();

    if(!cmd) return res.status(400).json({ok:false,error:"missing-cmd"});
    if(!Object.prototype.hasOwnProperty.call(ALLOWED, cmd)) {
      return res.status(400).json({ok:false,error:"not-allowed-cmd"});
    }
    args = capArgs(args, 16);
    if(rejectPathy(args)) return res.status(400).json({ok:false,error:"blocked-path-arg"});

    if(cmd==="git"){
      const sub=args[0]||"";
      if(!ALLOWED.git.has(sub)) return res.status(400).json({ok:false,error:"git-subcmd-blocked",sub});
      // read-only: no dangerous header required
      const writeSubs = new Set(["add","commit","push"]);
      if(writeSubs.has(sub) && !dang) return res.status(403).json({ok:false,error:"danger-confirm-missing"});
      // Validate specific subs conservatively
      if(sub==="rev-parse"){
        const okArgs=new Set(["rev-parse","--abbrev-ref","HEAD"]);
        for(const x of args){ if(!okArgs.has(x)) return res.status(400).json({ok:false,error:"git-arg-blocked",arg:x}); }
      }
      if(sub==="log"){
        const expect=new Set(["log","--oneline","-n"]);
        if(args.length<2) return res.status(400).json({ok:false,error:"git-log-needs-flags"});
        if(!(expect.has(args[0]) && expect.has(args[1]))) return res.status(400).json({ok:false,error:"git-log-flags"});
        if(args[2] && args[2]!=="-n") return res.status(400).json({ok:false,error:"git-log-only-n"});
        if(args[3] && !isPlainNumber(args[3])) return res.status(400).json({ok:false,error:"git-log-n-not-number"});
      }
      if(sub==="show"){
        if(args.length!==2) return res.status(400).json({ok:false,error:"git-show-one-ref"});
        if(args[1].length>64) return res.status(400).json({ok:false,error:"git-ref-too-long"});
      }
      if(sub==="diff"){
        if(args.length<2) return res.status(400).json({ok:false,error:"git-diff-needs--name-only"});
        if(args[0]!=="diff"||args[1]!=="--name-only") return res.status(400).json({ok:false,error:"git-diff-only-name-only"});
      }
      if(sub==="add"){
        if(!(args.length===2 && args[1]==="-A")) return res.status(400).json({ok:false,error:"git-add-only-A"});
      }
      if(sub==="commit"){
        // git commit -m "msg"
        if(!(args.length>=3 && args[1]==="-m")) return res.status(400).json({ok:false,error:"git-commit-requires-m"});
        if(args.slice(2).join(" ").length>500) return res.status(400).json({ok:false,error:"commit-msg-too-long"});
      }
      if(sub==="push"){
        if(args.length!==1) return res.status(400).json({ok:false,error:"git-push-no-extra-args"});
      }
    }

    const {code,out,err} = await ex(cmd,args,{cwd});
    return res.json({ok:true,code,out,err});
  }catch(e){
    return res.status(500).json({ok:false,error:String(e)});
  }
});
// HENRY_SYSTEM_HELPERS_END
