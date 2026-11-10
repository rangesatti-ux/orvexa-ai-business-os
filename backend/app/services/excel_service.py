from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter


def generate_excel(headers: list[str], rows: list[list]) -> BytesIO:
    """Generate a formatted Excel spreadsheet in-memory and return a BytesIO buffer."""
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Report"

    # Ensure gridlines are visible
    sheet.views.sheetView[0].showGridLines = True

    # Styling definitions
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    thin_border = Border(
        left=Side(style="thin", color="D9D9D9"),
        right=Side(style="thin", color="D9D9D9"),
        top=Side(style="thin", color="D9D9D9"),
        bottom=Side(style="thin", color="D9D9D9")
    )

    data_font = Font(name="Arial", size=10)
    data_alignment = Alignment(horizontal="left", vertical="center")

    # Append and style headers
    sheet.append(headers)
    sheet.row_dimensions[1].height = 28

    for col_num, _ in enumerate(headers, 1):
        cell = sheet.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thin_border

    # Append and style data rows
    for row_idx, row_data in enumerate(rows, 2):
        sheet.append(row_data)
        sheet.row_dimensions[row_idx].height = 20
        for col_num, _ in enumerate(row_data, 1):
            cell = sheet.cell(row=row_idx, column=col_num)
            cell.font = data_font
            cell.alignment = data_alignment
            cell.border = thin_border

    # Auto-fit column widths
    for col in sheet.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.value is not None:
                cell_len = len(str(cell.value))
                if cell_len > max_len:
                    max_len = cell_len
        sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    return buffer