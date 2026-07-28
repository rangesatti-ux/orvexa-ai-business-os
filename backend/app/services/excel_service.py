from io import BytesIO

from openpyxl import Workbook


def generate_excel(headers, rows):
    workbook = Workbook()

    sheet = workbook.active

    sheet.append(headers)

    for row in rows:
        sheet.append(row)

    buffer = BytesIO()

    workbook.save(buffer)

    buffer.seek(0)

    return buffer