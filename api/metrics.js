import crypto from "node:crypto";

export const VERSION="1.9.2";
const lexicalTokens=text=>text.match(/[\p{L}\p{M}\p{N}]+/gu)??[];
const scalarKey=s=>Array.from(s,c=>c.codePointAt(0));
const cmpScalar=(a,b)=>{const A=scalarKey(a),B=scalarKey(b),n=Math.min(A.length,B.length);for(let i=0;i<n;i++)if(A[i]!==B[i])return A[i]-B[i];return A.length-B.length;};
const viMarks=/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/iu;
const latin=/\p{Script=Latin}/u, han=/\p{Script=Han}/u, hira=/\p{Script=Hiragana}/u, kata=/\p{Script=Katakana}/u;
const dev=/\p{Script=Devanagari}/u, thai=/\p{Script=Thai}/u, khmer=/\p{Script=Khmer}/u, myanmar=/\p{Script=Myanmar}/u, sinhala=/\p{Script=Sinhala}/u, tibetan=/\p{Script=Tibetan}/u;
const english=new Set("the and of to in is are for with this that evidence requires verification".split(" "));
const french=new Set("le la les de des et un une est dans pour avec".split(" "));
const german=new Set("der die das und ist ein eine mit für von".split(" "));
const SANSKRIT=[
 ["Thích Ca Mâu Ni","Śākyamuni","śākyamuni"],["Bồ Tát","Bodhisattva","bodhisattva"],
 ["Nhơn đà la","Indra","indra"],["Tam muội","Samādhi","samādhi"],["Bồ đề","Bodhi","bodhi"],
 ["Đà la ni","Dhāraṇī","dhāraṇī"],["Ca sa","Kāṣāya","kāṣāya"],["A La Hán","Arhat","arhat"],
 ["Diêm phù đàn","Jambūnada","jambūnada"],["Niết bàn","Nirvāṇa","nirvāṇa"],["Bát nhã","Prajñā","prajñā"],["Ba la mật","Pāramitā","pāramitā"],["Mạn đà la","Maṇḍala","maṇḍala"],["Chân ngôn","Mantra","mantra"],["Kiếp","Kalpa","kalpa"],["Xá lợi","Śarīra","śarīra"],["Ưu bà tắc","Upāsaka","upāsaka"],["Ưu bà di","Upāsikā","upāsikā"],["Tỳ kheo","Bhikṣu","bhikṣu"],["Tỳ kheo ni","Bhikṣuṇī","bhikṣuṇī"]
];
function occurrences(text,s){let n=0,p=0;const a=text.toLocaleLowerCase("vi"),b=s.toLocaleLowerCase("vi");while((p=a.indexOf(b,p))>=0){n++;p+=b.length;}return n;}
function detect(text,tokens){
 const out=[]; const add=(language,count,unit,profile,evidence="HEURISTIC",qualification="")=>{if(count>0)out.push({language,count,counting_unit:unit,tokenizer_profile:profile,evidence_class:evidence,qualification});};
 const vi=tokens.filter(t=>viMarks.test(t)).length; add("Việt Nam",vi,"từ","TM-TOK-UNICODE-LEXICAL","HEURISTIC","Phân bổ bảo thủ dựa trên dấu hiệu chính tả đặc trưng; từ Latin không dấu có thể chưa phân loại.");
 const low=tokens.map(t=>t.toLowerCase()); const en=low.filter(t=>english.has(t)).length; add("Anh",en,"từ","TM-TOK-UNICODE-LEXICAL","HEURISTIC","Từ điển tín hiệu hữu hạn.");
 const fr=low.filter(t=>french.has(t)).length; add("Pháp",fr,"từ","TM-TOK-UNICODE-LEXICAL","HEURISTIC","Từ điển tín hiệu hữu hạn.");
 const de=low.filter(t=>german.has(t)).length; add("Đức",de,"từ","TM-TOK-UNICODE-LEXICAL","HEURISTIC","Từ điển tín hiệu hữu hạn.");
 const chars=Array.from(text); const hc=chars.filter(c=>han.test(c)).length; if(hc)add(hira.test(text)||kata.test(text)?"Nhật":"Hán (chưa xác định giản thể/phồn thể)",hc,"ký tự Hán","TM-TOK-CJK-CHAR","DETERMINISTIC","Đếm hệ chữ; không tuyên bố là số từ.");
 add("Hindi",chars.filter(c=>dev.test(c)).length,"ký tự Devanagari","TM-TOK-INDIC","HEURISTIC","Hệ chữ không đủ để chứng minh ngôn ngữ.");
 add("Thái",chars.filter(c=>thai.test(c)).length,"ký tự","TM-TOK-THAI-SEG","HEURISTIC");
 add("Khmer",chars.filter(c=>khmer.test(c)).length,"ký tự","TM-TOK-KHMER-SEG","HEURISTIC");
 add("Myanmar",chars.filter(c=>myanmar.test(c)).length,"ký tự","TM-TOK-MYANMAR-SEG","HEURISTIC");
 add("Sinhala",chars.filter(c=>sinhala.test(c)).length,"ký tự","TM-TOK-SINHALA","HEURISTIC");
 add("Tây Tạng",chars.filter(c=>tibetan.test(c)).length,"ký tự","TM-TOK-TIBETAN","HEURISTIC");
 return out;
}
export function measure(text){
 if(typeof text!=="string")throw new TypeError("text must be a string");
 const tokens=lexicalTokens(text),freq=new Map();for(const t of tokens){const k=t.toLocaleLowerCase("und");freq.set(k,(freq.get(k)||0)+1);}
 const ranked=[...freq].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]||cmpScalar(a[0],b[0])).slice(0,500);
 const sanskrit_origin=SANSKRIT.map(([surface,canonical,etymon])=>({source_surface:surface,count:occurrences(text,surface),canonical_sanskrit:canonical,etymon,mapping_status:"CURATED_SEED",evidence_class:"CURATED"})).filter(x=>x.count).sort((a,b)=>b.count-a.count||cmpScalar(a.source_surface,b.source_surface)).slice(0,500).map((x,i)=>({rank:i+1,...x}));
 const language_records=detect(text,tokens);
 return {version:VERSION,execution_mode:"FULL",report_language:"vi-VN",report_section_scheme:"arabic_1_to_n",source_sha256:crypto.createHash("sha256").update(text,"utf8").digest("hex"),unicode_code_points:Array.from(text).length,utf8_bytes:Buffer.byteLength(text,"utf8"),whitespace_code_points:(text.match(/\s/gu)||[]).length,physical_lines:text.length===0?0:text.split(/\r\n|\r|\n/).length,whitespace_tokens:text.trim()===""?0:text.trim().split(/\s+/u).length,unicode_lexical_tokens:tokens.length,unique_lexical_types:freq.size,repeated_lexical_types:[...freq.values()].filter(n=>n>=2).length,frequency_top_500:ranked.map(([token,count],i)=>({rank:i+1,token,count})),sanskrit_origin:{distinct_surface_count:sanskrit_origin.length,total_occurrences:sanskrit_origin.reduce((a,x)=>a+x.count,0),entries:sanskrit_origin},language_script_detection:{detected_language_count:language_records.length,detected_languages:language_records.map(x=>x.language)},language_word_statistics:{language_records,allocation_semantics:"bounded detector-specific evidence; unlike units are non-additive",additive_totals_valid:false},validation:{finite_test_success_is_universal_correctness:false},authority_boundary:{text_metrics:"measurement/bounded diagnostics",aris:"independent",vlf:"independent",kernel:"singular external router"}};
}
export function renderVietnamese(r){
 const s=r.sanskrit_origin.entries.map(x=>`[${x.source_surface}] (${x.count})`).join(", ")||"không phát hiện";
 const langs=r.language_word_statistics.language_records.map(x=>`${x.language}: ${x.count} ${x.counting_unit}`).join("; ")||"chưa xác định";
 return ["1. Nhận dạng nguồn và hồ sơ chạy",`Phiên bản: ${r.version}; chế độ: ĐẦY ĐỦ`,"2. Thống kê ký tự và Unicode",`Mã Unicode: ${r.unicode_code_points}`,"3. Thống kê byte",`Byte UTF-8: ${r.utf8_bytes}`,"4. Thống kê khoảng trắng",`Khoảng trắng: ${r.whitespace_code_points}`,"5. Thống kê dòng và đoạn",`Dòng: ${r.physical_lines}`,"6. Thống kê câu","Chưa áp dụng trong runtime tối giản hiện tại","7. Thống kê từ",`Từ theo hồ sơ Unicode: ${r.unicode_lexical_tokens}`,"8. Tần suất từ lặp — tối đa 500",r.frequency_top_500.map(x=>`[${x.token}] (${x.count})`).join(", ")||"không có","9. Danh từ riêng / thực thể định danh","Chưa áp dụng","10. Thuật ngữ chuyên biệt","Chưa áp dụng","11. Từ gốc Phạn — tối đa 500",s,"12. Ngôn ngữ phát hiện",r.language_script_detection.detected_languages.join(", ")||"chưa xác định","13. Thống kê từ theo ngôn ngữ",langs,"14. Bảng biểu / dữ liệu cấu trúc","Không áp dụng cho văn bản thuần","15. Lỗi theo bộ quy tắc","Không áp dụng khi chưa có bộ quy tắc","16. Bất thường","Không áp dụng","17. Điểm tổng hợp","Không áp dụng","18. So sánh trước/sau và độ lệch","Không áp dụng khi thiếu hai ảnh chụp nguồn","19. Kiểm định và tính tái lập","Kết quả hữu hạn không chứng minh tính đúng phổ quát","20. Nguồn gốc bằng chứng và dấu vết",`SHA-256 nguồn: ${r.source_sha256}`,"21. Hiệu năng","Xem benchmark phát hành","22. Ranh giới thẩm quyền","Text-Metrics chỉ đo lường và chẩn đoán giới hạn","23. Kết luận cuối","Đã hoàn tất phép đo FULL áp dụng được."].join("\n");
}
export default function handler(req,res){if(req.method==="GET")return res.status(200).json({status:"ok",service:"text-metrics-runtime",version:VERSION});if(req.method!=="POST")return res.status(405).json({error:"method_not_allowed"});try{const text=req.body?.text;if(typeof text!=="string")return res.status(400).json({error:"text_must_be_string"});const result=measure(text);if(req.body?.format==="text")return res.status(200).type("text/plain; charset=utf-8").send(renderVietnamese(result));return res.status(200).json(result);}catch{return res.status(500).json({error:"internal_error"});}}
