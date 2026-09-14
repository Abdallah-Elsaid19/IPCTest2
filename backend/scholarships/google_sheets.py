import json
import logging
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from .bursary_export import (
    BURSARY_GOOGLE_SHEET_HEADERS,
    bursary_google_sheet_row,
)
from .models import BursaryApplication


logger = logging.getLogger(__name__)
SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"


def _column_letter(column_number):
    """Return the A1-notation letter for a one-based column number."""
    letters = ""
    while column_number:
        column_number, remainder = divmod(column_number - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def _merge_bursary_google_sheet_rows(existing_values, database_rows):
    """Migrate an existing sheet without dropping rows not managed by Django."""
    if not existing_values:
        return [BURSARY_GOOGLE_SHEET_HEADERS, *database_rows]

    existing_headers = existing_values[0]
    existing_indexes = {
        header: index for index, header in enumerate(existing_headers)
    }
    database_by_reference = {
        str(row[0]).strip(): row for row in database_rows if row
    }
    merged_rows = [BURSARY_GOOGLE_SHEET_HEADERS]
    synced_references = set()

    for existing_row in existing_values[1:]:
        normalised_row = [
            existing_row[existing_indexes[header]]
            if header in existing_indexes
            and existing_indexes[header] < len(existing_row)
            else ""
            for header in BURSARY_GOOGLE_SHEET_HEADERS
        ]
        if not any(str(value).strip() for value in normalised_row):
            continue

        reference = str(normalised_row[0]).strip()
        if reference in database_by_reference:
            if reference not in synced_references:
                merged_rows.append(database_by_reference[reference])
                synced_references.add(reference)
            continue
        merged_rows.append(normalised_row)

    merged_rows.extend(
        row
        for reference, row in database_by_reference.items()
        if reference not in synced_references
    )
    return merged_rows


def bursary_google_sheet_url():
    spreadsheet_id = settings.BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID.strip()
    return (
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"
        if spreadsheet_id else ""
    )


def bursary_google_sheets_configured():
    return bool(
        settings.BURSARY_GOOGLE_SHEETS_ENABLED
        and settings.BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID.strip()
        and (
            settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip()
            or settings.GOOGLE_SERVICE_ACCOUNT_FILE.strip()
        )
    )


def _google_credentials():
    try:
        from google.oauth2 import service_account
    except ImportError as error:
        raise ImproperlyConfigured(
            "Install google-api-python-client and google-auth to enable Bursary Google Sheets sync."
        ) from error

    if settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip():
        try:
            service_account_info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
        except json.JSONDecodeError as error:
            raise ImproperlyConfigured("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.") from error
        return service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=[SHEETS_SCOPE],
        )
    if settings.GOOGLE_SERVICE_ACCOUNT_FILE.strip():
        credential_path = Path(settings.GOOGLE_SERVICE_ACCOUNT_FILE)
        if not credential_path.is_absolute():
            credential_path = Path(settings.BASE_DIR) / credential_path
        return service_account.Credentials.from_service_account_file(
            credential_path,
            scopes=[SHEETS_SCOPE],
        )
    raise ImproperlyConfigured(
        "Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_FILE."
    )


def _google_sheets_service():
    try:
        from googleapiclient.discovery import build
    except ImportError as error:
        raise ImproperlyConfigured(
            "Install google-api-python-client and google-auth to enable Bursary Google Sheets sync."
        ) from error
    return build("sheets", "v4", credentials=_google_credentials(), cache_discovery=False)


def _target_sheet_id(service, spreadsheet_id, worksheet_name):
    metadata = service.spreadsheets().get(
        spreadsheetId=spreadsheet_id,
        fields="sheets.properties(sheetId,title)",
    ).execute()
    sheets = metadata.get("sheets", [])
    for sheet in sheets:
        properties = sheet.get("properties", {})
        if properties.get("title") == worksheet_name:
            return properties["sheetId"]

    if len(sheets) == 1:
        sheet_id = sheets[0]["properties"]["sheetId"]
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "requests": [{
                    "updateSheetProperties": {
                        "properties": {"sheetId": sheet_id, "title": worksheet_name},
                        "fields": "title",
                    }
                }]
            },
        ).execute()
        return sheet_id

    result = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": [{"addSheet": {"properties": {"title": worksheet_name}}}]},
    ).execute()
    return result["replies"][0]["addSheet"]["properties"]["sheetId"]


def _format_sheet(service, spreadsheet_id, sheet_id, row_count):
    column_count = len(BURSARY_GOOGLE_SHEET_HEADERS)
    payable_column = BURSARY_GOOGLE_SHEET_HEADERS.index(
        "Estimated amount applicant pays (GBP)"
    )
    wide_columns = {
        BURSARY_GOOGLE_SHEET_HEADERS.index("Preferred modules"),
        BURSARY_GOOGLE_SHEET_HEADERS.index(
            "Long-term disability, health problem or learning difficulty"
        ),
        BURSARY_GOOGLE_SHEET_HEADERS.index("Additional support required"),
    }
    requests = [
        {
            "updateSheetProperties": {
                "properties": {
                    "sheetId": sheet_id,
                    "gridProperties": {"frozenRowCount": 1},
                },
                "fields": "gridProperties.frozenRowCount",
            }
        },
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": column_count,
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": {"red": 0.92, "green": 0.92, "blue": 0.92},
                        "textFormat": {"bold": True},
                        "verticalAlignment": "MIDDLE",
                        "wrapStrategy": "WRAP",
                    }
                },
                "fields": "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,wrapStrategy)",
            }
        },
        {
            "updateDimensionProperties": {
                "range": {
                    "sheetId": sheet_id,
                    "dimension": "COLUMNS",
                    "startIndex": 0,
                    "endIndex": column_count,
                },
                "properties": {"pixelSize": 150},
                "fields": "pixelSize",
            }
        },
        {
            "setBasicFilter": {
                "filter": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 0,
                        "endRowIndex": max(row_count, 1),
                        "startColumnIndex": 0,
                        "endColumnIndex": column_count,
                    }
                }
            }
        },
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 1,
                    "endRowIndex": max(row_count, 2),
                    "startColumnIndex": payable_column,
                    "endColumnIndex": payable_column + 1,
                },
                "cell": {
                    "userEnteredFormat": {
                        "numberFormat": {"type": "CURRENCY", "pattern": "£#,##0"}
                    }
                },
                "fields": "userEnteredFormat.numberFormat",
            }
        },
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 1,
                    "endRowIndex": max(row_count, 2),
                    "startColumnIndex": 11,
                    "endColumnIndex": 12,
                },
                "cell": {
                    "userEnteredFormat": {
                        "verticalAlignment": "TOP",
                        "wrapStrategy": "WRAP",
                    }
                },
                "fields": "userEnteredFormat(verticalAlignment,wrapStrategy)",
            }
        },
    ]
    for column_index in sorted(wide_columns):
        requests.append({
            "updateDimensionProperties": {
                "range": {
                    "sheetId": sheet_id,
                    "dimension": "COLUMNS",
                    "startIndex": column_index,
                    "endIndex": column_index + 1,
                },
                "properties": {"pixelSize": 320},
                "fields": "pixelSize",
            }
        })
    service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": requests},
    ).execute()


def sync_bursary_google_sheet():
    if not bursary_google_sheets_configured():
        raise ImproperlyConfigured(
            "Bursary Google Sheets sync is not fully configured."
        )

    spreadsheet_id = settings.BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID.strip()
    worksheet_name = settings.BURSARY_GOOGLE_SHEETS_WORKSHEET_NAME.strip()
    applications = BursaryApplication.objects.select_related(
        "assigned_reviewer",
    ).order_by("-submitted_at", "-id")
    database_rows = list(
        bursary_google_sheet_row(application)
        for application in applications.iterator(chunk_size=500)
    )

    service = _google_sheets_service()
    sheet_id = _target_sheet_id(service, spreadsheet_id, worksheet_name)
    quoted_sheet_name = worksheet_name.replace("'", "''")
    last_column = _column_letter(len(BURSARY_GOOGLE_SHEET_HEADERS))
    sheet_range = f"'{quoted_sheet_name}'!A:{last_column}"
    values_api = service.spreadsheets().values()
    existing_values = values_api.get(
        spreadsheetId=spreadsheet_id,
        range=sheet_range,
    ).execute().get("values", [])

    if not existing_values or existing_values[0] != BURSARY_GOOGLE_SHEET_HEADERS:
        rows = _merge_bursary_google_sheet_rows(existing_values, database_rows)
        values_api.update(
            spreadsheetId=spreadsheet_id,
            range=f"'{quoted_sheet_name}'!A1",
            valueInputOption="RAW",
            body={"values": rows},
        ).execute()
        existing_row_count = len(existing_values)
        if existing_row_count > len(rows):
            values_api.clear(
                spreadsheetId=spreadsheet_id,
                range=(
                    f"'{quoted_sheet_name}'!A{len(rows) + 1}:"
                    f"{last_column}{existing_row_count}"
                ),
                body={},
            ).execute()
        row_count = len(rows)
    else:
        existing_rows_by_reference = {}
        for row_number, existing_row in enumerate(existing_values[1:], start=2):
            reference = str(existing_row[0]).strip() if existing_row else ""
            if reference:
                existing_rows_by_reference.setdefault(reference, row_number)

        updates = []
        additions = []
        for row in database_rows:
            row_number = existing_rows_by_reference.get(str(row[0]).strip())
            if row_number:
                updates.append({
                    "range": f"'{quoted_sheet_name}'!A{row_number}",
                    "values": [row],
                })
            else:
                additions.append(row)

        if updates:
            values_api.batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"valueInputOption": "RAW", "data": updates},
            ).execute()
        if additions:
            values_api.append(
                spreadsheetId=spreadsheet_id,
                range=f"'{quoted_sheet_name}'!A:{last_column}",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": additions},
            ).execute()
        row_count = len(existing_values) + len(additions)

    _format_sheet(service, spreadsheet_id, sheet_id, row_count)
    return len(database_rows)


def sync_bursary_google_sheet_safely():
    if not bursary_google_sheets_configured():
        return False
    try:
        synced_count = sync_bursary_google_sheet()
    except Exception:
        logger.exception("Could not sync Bursary applications to Google Sheets.")
        return False
    logger.info("Synced %s Bursary applications to Google Sheets.", synced_count)
    return True
