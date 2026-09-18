import test from "node:test";import assert from "node:assert/strict";import {measure} from "../api/metrics.js";
test("deterministic core metrics",()=>{const r=measure("Học thuật cần bằng chứng. Evidence requires verification.");assert.equal(r.unicode_lexical_tokens,8);assert.equal(r.physical_lines,1);assert.equal(r.frequency_top_500.length,0);});
test("frequency deterministic",()=>{const r=measure("b a b a c");assert.deepEqual(r.frequency_top_500.map(x=>[x.token,x.count]),[["a",2],["b",2]]);});
test("unicode code points and bytes",()=>{const r=measure("😀");assert.equal(r.unicode_code_points,1);assert.equal(r.utf8_bytes,4);});
