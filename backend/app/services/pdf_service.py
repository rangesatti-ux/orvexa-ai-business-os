from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate


def generate_pdf(title: str, rows: list[str]):
    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()

    story = [Paragraph(title, styles["Heading1"])]

    for row in rows:
        story.append(Paragraph(row, styles["BodyText"]))

    doc.build(story)

    buffer.seek(0)

    return buffer