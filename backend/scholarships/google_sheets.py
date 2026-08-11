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
                    "startColumnIndex": 9,
                    "endColumnIndex": 10,
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
    for column_index in (8, 10, 11):
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
    rows = [BURSARY_GOOGLE_SHEET_HEADERS]
    rows.extend(
        bursary_google_sheet_row(application)
        for application in applications.iterator(chunk_size=500)
    )

    service = _google_sheets_service()
    sheet_id = _target_sheet_id(service, spreadsheet_id, worksheet_name)
    quoted_sheet_name = worksheet_name.replace("'", "''")
    sheet_range = f"'{quoted_sheet_name}'!A:L"
    service.spreadsheets().values().clear(
        spreadsheetId=spreadsheet_id,
        range=sheet_range,
        body={},
    ).execute()
    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=f"'{quoted_sheet_name}'!A1",
        valueInputOption="RAW",
        body={"values": rows},
    ).execute()
    _format_sheet(service, spreadsheet_id, sheet_id, len(rows))
    return len(rows) - 1


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
