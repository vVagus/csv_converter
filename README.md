# CSV Converter

Converts exam question documents (DOCX/text) into structured, verified, and CSV-ready question data using Gemini for parsing, answer verification, and formatting. Also includes a score normalizer that corrects duplicated/inflated scores from the legacy PHP LMS.

Live app: https://starlite-lms.vercel.app

## What it does

**Question conversion**
- Extracts objective questions, options, and class/level tags (e.g. SSS_1, JSS_3) from unstructured exam documents.
- Uses Gemini to solve and verify each question, correcting mismatched answer keys where the source document got it wrong.
- Evenly distributes correct answers across option positions instead of leaving them clustered.
- Cleans up formatting: converts math symbols to proper UTF-8, wraps tabular data in HTML tables, and formats passages/stanzas consistently.
- Outputs a validated CSV ready for batch upload into an LMS.

**Score normalizer**
- Fixes a bug in the legacy PHP LMS where a student's result row gets duplicated N times, inflating both the score and the total (e.g. a true 8/25 duplicated 5 times becomes 40/125). The percentage stays the same, which is what makes the bug easy to miss.
- Detects duplicate rows per student/subject, collapses them back to a single true result, and recalculates the correct score.
- Prevents inflated or duplicated scores from propagating into generated PDFs or CSV exports.

## Structure

- `backend/` — FastAPI service handling document parsing, the Gemini extraction pipeline (`llm_engine.py`, `parser.py`), and score normalization.
- `frontend/` — Next.js interface for uploading documents, reviewing converted output, and normalizing scores.

## Running locally

### Backend

cd backend
pip install -r requirements.txt
cp .env.example .env # then add your GEMINI_API_KEY
uvicorn app.main:app --reload


### Frontend

cd frontend
npm install
npm run dev


## Environment variables

See `backend/.env.example` for required variables.

## Notes

Built to replace a rigid legacy vendor workflow for converting exam documents into LMS-ready question banks and correcting a known score-duplication bug, currently in production use processing real exam batches.