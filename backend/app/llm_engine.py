import os
from typing import Literal
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class QuestionItem(BaseModel):
    detected_class: str = Field(description="Class tag e.g. SSS_1, SSS_2, JSS_3")
    question: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    option_5: str | None = None
    answear: Literal["option_1", "option_2", "option_3", "option_4"] = Field(
        description="MUST be the exact option key (option_1, option_2, option_3, or option_4) containing the CORRECT answer."
    )
    source_indicated_answer: str | None = None
    correction_made: bool = False
    correction_reason: str | None = None


class ClassQuestionCount(BaseModel):
    class_name: str
    count: int


class ConversionMetrics(BaseModel):
    total_questions_processed: int
    questions_per_class: list[ClassQuestionCount]
    total_answer_corrections: int


class ExtractionResponse(BaseModel):
    metrics: ConversionMetrics
    questions: list[QuestionItem]
    audit_summary: list[str]


async def parse_questions_with_gemini(extracted_text: str) -> ExtractionResponse:
    system_prompt = """
    You are an expert academic document parser, mathematical engine, and LMS data extraction specialist.
    
    1. CLASS GROUPING: Extract all objective questions, options, and detected class/level tags (e.g. SSS_1, SSS_2, JSS_3).
    2. ACCURATE SOLVING & VERIFICATION: You MUST read and solve every question carefully. Determine which option contains the factually correct answer and set `answear` EXACTLY to that option key.
    3. CHOICE SHUFFLING & BALANCED DISTRIBUTION:
       - Do NOT place the correct answer in the same option position (e.g., option_2) repeatedly.
       - Randomize and evenly distribute correct answers across `option_1`, `option_2`, `option_3`, and `option_4` (~25% allocation each).
       - Ensure `answear` accurately matches the randomized position key.
    4. ANSWER CORRECTION AUDIT: If the source text indicated an answer key (e.g. "Ans: B"), compare it against your verified solution. If the source key was wrong, set `answear` to the true winning option key, set `correction_made` to True, and add a detailed entry in `audit_summary`.
    5. OPTION E SWAP ALGORITHM: If 5 choices (A-E) exist and Option E is correct, swap Option E into option_1..option_4 and assign `answear` accordingly. Never output an option_5 column.
    6. CONTEXT PREPENDING & LINE BREAKS: Use <br><br> to separate context/passages/instructions from questions, and <br> for stanzas in poems.
    7. UTF-8 FLATTENING: Convert math formulas into clean UTF-8 characters (x², α, β, √, θ, H₂O, x₁, ₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹).
    8. HTML TABLES & NATIVE HTML TAGS: 
       - Convert any grid, schedule, or tabular data into an inline HTML table (e.g., <table border='1' cellpadding='5' style='border-collapse:collapse;'>...</table>).
       - Use standard HTML tags (<b>, <i>, <u>, <sub>, <sup>, <code>, <ol>, <ul>, <mark>) wherever appropriate for clean presentation.
       - CRITICAL: Always use SINGLE QUOTES ('...') for any internal HTML attributes.
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[system_prompt, f"Source Text:\n{extracted_text}"],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractionResponse,
        ),
    )

    return ExtractionResponse.model_validate_json(response.text)