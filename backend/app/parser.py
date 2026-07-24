import os
import docx

def extract_docx_content(docx_path: str, session_folder: str) -> str:
    """
    Reads a .docx file, extracts text/tables, and dumps embedded images 
    as standalone PNG files into the session folder.
    """
    doc = docx.Document(docx_path)
    full_text = []
    
    # Extract Paragraph Text
    for p in doc.paragraphs:
        if p.text.strip():
            full_text.append(p.text.strip())
            
    # Extract Table Text
    for table in doc.tables:
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_data:
                full_text.append(" | ".join(row_data))
                
    # Extract Media Assets (Images)
    img_counter = 1
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            img_part = rel.target_part
            img_filename = f"asset_image_{img_counter}.png"
            img_path = os.path.join(session_folder, img_filename)
            with open(img_path, "wb") as f:
                f.write(img_part.blob)
            img_counter += 1

    return "\n".join(full_text)