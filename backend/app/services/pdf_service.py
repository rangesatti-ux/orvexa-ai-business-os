from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Canvas wrapper to perform two-pass rendering for total page counts."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#666666"))
        
        # Header rule and title
        self.setStrokeColor(colors.HexColor("#CCCCCC"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 40, letter[0] - 54, letter[1] - 40)
        
        # Footer rule and page numbering
        self.line(54, 50, letter[0] - 54, 50)
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 35, footer_text)
        self.drawString(54, 35, "Orvexa Business OS — Confidential")
        
        self.restoreState()


def generate_pdf(
    title: str,
    headers: list[str] = None,
    rows: list[list[str]] = None,
    paragraphs: list[str] = None,
) -> BytesIO:
    """Generate a professionally formatted PDF report in-memory and return a BytesIO buffer."""
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=64,
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1F4E78"),
        spaceAfter=15,
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#333333"),
        spaceAfter=10,
    )

    story = [
        Paragraph(title, title_style),
        Spacer(1, 10),
    ]

    if paragraphs:
        for p in paragraphs:
            story.append(Paragraph(p, body_style))
        story.append(Spacer(1, 10))

    if headers and rows:
        table_data = [[Paragraph(f"<b>{h}</b>", body_style) for h in headers]]
        for row in rows:
            table_data.append([Paragraph(str(cell), body_style) for cell in row])

        col_width = (letter[0] - 108) / len(headers)
        col_widths = [col_width] * len(headers)

        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1F4E78")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FBFD")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E0E0E0")),
        ]))
        story.append(table)

    elif paragraphs is None and rows and not headers:
        for row in rows:
            story.append(Paragraph(row, body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)

    return buffer