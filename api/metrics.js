import crypto from "node:crypto";

const lexicalTokens = text => text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
const scalarKey = s => Array.from(s, c => c.codePointAt(0));
const cmpScalar = (a,b) => {
  const A=scalarKey(a), B=scalarKey(b), n=Math.min(A.length,B.length);
  for(let i=0;i<n;i++) if(A[i]!==B[i]) return A[i]-B[i];
  return A.length-B.length;
};
export function measure(text){
  if(typeof text!=="string") throw new TypeError("text must be a string");
  const tokens=lexicalTokens(text), freq=new Map();
  for(const t of tokens){const k=t.toLowerCase();freq.set(k,(freq.get(k)||0)+1);}
  const ranked=[...freq].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]||cmpScalar(a[0],b[0])).slice(0,500);
  return {
    version:"1.9.2",
    tm_arp:{release_controller:"TM-ARP-v1.0",change_class:"PATCH_SAFE"},
    source_sha256:crypto.createHash("sha256").update(text,"utf8").digest("hex"),
    unicode_code_points:Array.from(text).length,
    utf8_bytes:Buffer.byteLength(text,"utf8"),
    whitespace_code_points:(text.match(/\s/gu)||[]).length,
    physical_lines:text.length===0?0:text.split(/\r\n|\r|\n/).length,
    whitespace_tokens:text.trim()===""?0:text.trim().split(/\s+/u).length,
    unicode_lexical_tokens:tokens.length,
    unique_lexical_types:freq.size,
    repeated_lexical_types:[...freq.values()].filter(n=>n>=2).length,
    frequency_top_500:ranked.map(([token,count],i)=>({rank:i+1,token,count}))
  };
}
export default function handler(req,res){
  if(req.method==="GET") return res.status(200).json({status:"ok",service:"text-metrics-runtime",version:"1.9.2",tm_arp:{release_controller:"TM-ARP-v1.0",change_class:"PATCH_SAFE"}});
  if(req.method!=="POST") return res.status(405).json({error:"method_not_allowed"});
  try{
    const text=req.body?.text;
    if(typeof text!=="string") return res.status(400).json({error:"text_must_be_string"});
    return res.status(200).json(measure(text));
  }catch(e){return res.status(500).json({error:"internal_error"});}
}
