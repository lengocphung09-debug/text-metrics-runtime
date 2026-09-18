import test from "node:test";import assert from "node:assert/strict";import {measure,renderVietnamese} from "../api/metrics.js";
test("Red-Team: no phonetic Sanskrit fabrication",()=>{const r=measure("foo bar baz");assert.equal(r.sanskrit_origin.entries.length,0);});
test("Red-Team: distinct Sanskrit surfaces not merged",()=>{const r=measure("Bồ Tát. Bồ đề.");assert.equal(r.sanskrit_origin.distinct_surface_count,2);});
test("Red-Team: Sanskrit ordering descending",()=>{const r=measure("Tam muội. Bồ Tát. Bồ Tát. Bồ Tát.");assert.equal(r.sanskrit_origin.entries[0].source_surface,"Bồ Tát");assert.equal(r.sanskrit_origin.entries[0].count,3);});
test("Red-Team: script is not falsely exact word count",()=>{const r=measure("漢字漢字");const x=r.language_word_statistics.language_records.find(x=>x.language.startsWith("Hán"));assert.equal(x.counting_unit,"ký tự Hán");assert.notEqual(x.evidence_class,"EXTERNALLY_VERIFIED");});
test("Red-Team: unsupported Latin remains unallocated",()=>{const r=measure("xyzzy plugh");assert.equal(r.language_script_detection.detected_language_count,0);});
test("Red-Team: report remains Vietnamese numbered",()=>{const s=renderVietnamese(measure("Evidence"));assert.match(s,/1\. Nhận dạng nguồn/);assert.match(s,/23\. Kết luận cuối/);assert.doesNotMatch(s,/^A\. /m);});
test("Red-Team: Top-500 bounded",()=>{const words=Array.from({length:700},(_,i)=>"w"+i);const r=measure(words.concat(words).join(" "));assert.equal(r.frequency_top_500.length,500);});
test("Red-Team: source immutability",()=>{const s="Bồ Tát\nEvidence";measure(s);assert.equal(s,"Bồ Tát\nEvidence");});
