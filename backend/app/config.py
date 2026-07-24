import os

# Base directory for temporary session outputs (CSVs, extracted PNGs)
STORAGE_DIR = os.path.abspath("./session_storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

DEFAULT_MARK = 0.50

def parse_mark_value(mark_input: float | str | None) -> float:
    """
    Parses and validates the user-selected mark value from the frontend dropdown/input.
    Falls back to DEFAULT_MARK (0.50) if unspecified or invalid.
    """
    if mark_input is None:
        return DEFAULT_MARK
    try:
        val = float(mark_input)
        return val if val > 0 else DEFAULT_MARK
    except (ValueError, TypeError):
        return DEFAULT_MARK