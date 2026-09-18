# text-metrics-runtime

Text-Metrics v1.9.1 deterministic runtime for bounded text measurement.

## API

GET /api/metrics returns health metadata.

POST /api/metrics with JSON `{"text":"..."}` returns source SHA-256, Unicode/UTF-8/whitespace/line/token metrics and deterministic repeated lexical frequency Top-500.

Authority boundary: measurement only. This runtime does not perform ARIS epistemic governance or VLF textual transformation.
