import fs from "node:fs";
export const STATES=["CREATED","BASELINE_VERIFIED","CHANGE_INTAKE","DELTA_CLASSIFIED","SPEC_CANDIDATE","IMPLEMENTING","TESTING","CI_VERIFIED","PREVIEW_VERIFYING","RELEASE_ELIGIBLE","AUTHORIZATION_REQUIRED","PRODUCTION_DEPLOYING","PRODUCTION_VERIFYING","EVIDENCE_FINALIZING","RELEASED","BLOCKED","ROLLBACK_REQUIRED","ROLLBACK_VERIFYING","ROLLED_BACK"];
export function classify(change){if(change.authority_boundary||change.metric_semantics)return "GOVERNANCE_SENSITIVE";if(change.breaking)return "MAJOR_SEMANTIC";if(change.semantic)return "MINOR_SEMANTIC";return "PATCH_SAFE";}
export function judge(e){for(const k of ["baseline","tests","ci","runtime","evidence"])if(e[k]!=="PASS")return {state:"BLOCKED",reason:k};return {state:"RELEASE_ELIGIBLE"};}
export function authorization(changeClass,approved=false){return changeClass==="PATCH_SAFE"&&approved?{state:"PRODUCTION_DEPLOYING"}:{state:"AUTHORIZATION_REQUIRED"};}
export function rollbackTarget(lkg){if(!lkg||lkg.state!=="VERIFIED")throw new Error("no_verified_last_known_good");return lkg;}
if(process.argv[1]===new URL(import.meta.url).pathname){const f=process.argv[2];if(!f)process.exit(2);console.log(JSON.stringify(judge(JSON.parse(fs.readFileSync(f,"utf8")))));}
