import json
import logging
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from .bursary_export import (
    BURSARY_GOOGLE_SHEET_HEADERS,
    bursary_google_sheet_row,
)
from .models import BursaryApplication, BursaryPaymentInstallment, BursaryPaymentPlan


logger = logging.getLogger(__name__)
SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
# Applications intentionally kept in the database but omitted from this sheet.
BURSARY_GOOGLE_SHEET_EXCLUDED_REFERENCES = frozenset({
    "IPC-BSA-2026-61B51818C54A",
})


def _column_letter(column_number):
    """Return the A1-notation letter for a one-based column number."""
    letters = ""
    while column_number:
        column_number, remainder = divmod(column_number - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def _merge_bursary_google_sheet_rows(existing_values, database_rows):
    """Migrate a legacy sheet while retaining user-owned columns and rows."""
    if not existing_values:
        return [BURSARY_GOOGLE_SHEET_HEADERS, *database_rows]

    existing_headers = existing_values[0]
    missing_headers = [
        header for header in BURSARY_GOOGLE_SHEET_HEADERS
        if header not in existing_headers
    ]
    headers = [*missing_headers, *existing_headers]
    existing_indexes = {header: index for index, header in enumerate(existing_headers)}
    database_by_reference = {
        str(row[0]).strip(): row for row in database_rows if row
    }
    merged_rows = [headers]
    synced_references = set()

    for existing_row in existing_values[1:]:
        preserved = [
            existing_row[existing_indexes[header]]
            if header in existing_indexes and existing_indexes[header] < len(existing_row)
            else ""
            for header in headers
        ]
        if not any(str(value).strip() for value in preserved):
            continue

        reference = str(preserved[headers.index("Application reference")]).strip()
        if reference in database_by_reference:
            if reference not in synced_references:
                managed = dict(zip(
                    BURSARY_GOOGLE_SHEET_HEADERS, database_by_reference[reference]
                ))
                merged_rows.append([
                    managed.get(header, value)
                    for header, value in zip(headers, preserved)
                ])
                synced_references.add(reference)
            continue
        merged_rows.append(preserved)

    for reference, row in database_by_reference.items():
        if reference not in synced_references:
            managed = dict(zip(BURSARY_GOOGLE_SHEET_HEADERS, row))
            merged_rows.append([managed.get(header, "") for header in headers])
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


def _get_or_create_sheet_id(service, spreadsheet_id, worksheet_name):
    """Create a dedicated report tab without renaming or replacing an existing tab."""
    metadata = service.spreadsheets().get(
        spreadsheetId=spreadsheet_id,
        fields="sheets.properties(sheetId,title)",
    ).execute()
    for sheet in metadata.get("sheets", []):
        properties = sheet.get("properties", {})
        if properties.get("title") == worksheet_name:
            return properties["sheetId"]
    result = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": [{"addSheet": {"properties": {"title": worksheet_name}}}]},
    ).execute()
    return result["replies"][0]["addSheet"]["properties"]["sheetId"]


def _managed_column_groups(headers):
    """Contiguous managed columns, with their indexes in the export row."""
    positions = sorted(
        (headers.index(header), index)
        for index, header in enumerate(BURSARY_GOOGLE_SHEET_HEADERS)
    )
    groups = []
    for column, value_index in positions:
        if groups and column == groups[-1][-1][0] + 1:
            groups[-1].append((column, value_index))
        else:
            groups.append([(column, value_index)])
    return groups


def _format_sheet(service, spreadsheet_id, sheet_id, row_count, headers):
    payable_column = headers.index("Estimated amount applicant pays (GBP)")
    wide_columns = {
        headers.index("Preferred modules"),
        headers.index("Long-term disability, health problem or learning difficulty"),
        headers.index("Additional support required"),
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
            "setBasicFilter": {
                "filter": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 0,
                        "endRowIndex": max(row_count, 1),
                        "startColumnIndex": 0,
                        "endColumnIndex": len(headers),
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
                        "numberFormat": {"type": "CURRENCY", "pattern": "\u00a3#,##0"}
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
                    "startColumnIndex": headers.index("Preferred modules"),
                    "endColumnIndex": headers.index("Preferred modules") + 1,
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
    for header in BURSARY_GOOGLE_SHEET_HEADERS:
        column = headers.index(header)
        requests.extend([
            {
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 0,
                        "endRowIndex": 1,
                        "startColumnIndex": column,
                        "endColumnIndex": column + 1,
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
                        "startIndex": column,
                        "endIndex": column + 1,
                    },
                    "properties": {"pixelSize": 320 if column in wide_columns else 150},
                    "fields": "pixelSize",
                }
            },
        ])
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
    ).exclude(
        application_reference__in=BURSARY_GOOGLE_SHEET_EXCLUDED_REFERENCES,
    ).order_by("-submitted_at", "-id")
    database_rows = [
        bursary_google_sheet_row(application)
        for application in applications.iterator(chunk_size=500)
    ]

    service = _google_sheets_service()
    sheet_id = _target_sheet_id(service, spreadsheet_id, worksheet_name)
    quoted_sheet_name = worksheet_name.replace("'", "''")
    sheet = f"'{quoted_sheet_name}'"
    values_api = service.spreadsheets().values()
    header_values = values_api.get(
        spreadsheetId=spreadsheet_id,
        range=f"{sheet}!1:1",
    ).execute().get("values", [])
    headers = header_values[0] if header_values else []
    last_column = _column_letter(max(len(headers), len(BURSARY_GOOGLE_SHEET_HEADERS)))
    existing_values = values_api.get(
        spreadsheetId=spreadsheet_id,
        range=f"{sheet}!A:{last_column}",
    ).execute().get("values", [])

    # Delete excluded application rows from the sheet itself. Reverse order
    # keeps the remaining row indexes stable and moves manual cells with their rows.
    if "Application reference" in headers:
        reference_column = headers.index("Application reference")
        excluded_row_indexes = [
            row_index
            for row_index, row in enumerate(existing_values[1:], start=1)
            if reference_column < len(row)
            and str(row[reference_column]).strip()
            in BURSARY_GOOGLE_SHEET_EXCLUDED_REFERENCES
        ]
        if excluded_row_indexes:
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": [
                    {"deleteDimension": {
                        "range": {
                            "sheetId": sheet_id,
                            "dimension": "ROWS",
                            "startIndex": row_index,
                            "endIndex": row_index + 1,
                        }
                    }}
                    for row_index in reversed(excluded_row_indexes)
                ]},
            ).execute()
            excluded = set(excluded_row_indexes)
            existing_values = [
                row for row_index, row in enumerate(existing_values)
                if row_index not in excluded
            ]

    if not all(header in headers for header in BURSARY_GOOGLE_SHEET_HEADERS):
        rows = _merge_bursary_google_sheet_rows(existing_values, database_rows)
        values_api.update(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet}!A1",
            valueInputOption="RAW",
            body={"values": rows},
        ).execute()
        if len(existing_values) > len(rows):
            values_api.clear(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet}!A{len(rows) + 1}:{_column_letter(len(rows[0]))}{len(existing_values)}",
                body={},
            ).execute()
        headers = rows[0]
        row_count = len(rows)
    else:
        reference_column = headers.index("Application reference")
        existing_rows_by_reference = {}
        for row_number, existing_row in enumerate(existing_values[1:], start=2):
            reference = (
                str(existing_row[reference_column]).strip()
                if reference_column < len(existing_row) else ""
            )
            if reference:
                existing_rows_by_reference.setdefault(reference, row_number)

        groups = _managed_column_groups(headers)
        updates = []
        next_row = max(len(existing_values) + 1, 2)
        for row in database_rows:
            reference = str(row[0]).strip()
            row_number = existing_rows_by_reference.get(reference)
            if row_number is None:
                row_number = next_row
                next_row += 1
            for group in groups:
                updates.append({
                    "range": f"{sheet}!{_column_letter(group[0][0] + 1)}{row_number}",
                    "values": [[row[value_index] for _, value_index in group]],
                })
        if updates:
            values_api.batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"valueInputOption": "RAW", "data": updates},
            ).execute()
        row_count = max(len(existing_values), next_row - 1)

    _format_sheet(service, spreadsheet_id, sheet_id, row_count, headers)
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


PAYMENT_PLAN_BASE_HEADERS = [
    "Application reference",
    "First name",
    "Last name",
    "Email",
    "Preferred modules",
    "Start Date and Cohorts",
    "Estimated amount applicant pays (GBP)",
    "Duration of Study",
    "Monthly installment (GBP)",
    "Deposit (GBP)",
    "Plan status",
    "Amount paid (GBP)",
    "Balance remaining (GBP)",
    "Next payment due",
]


def bursary_payment_plan_google_sheets_configured():
    return bool(
        settings.BURSARY_PAYMENT_PLANS_GOOGLE_SHEETS_ENABLED
        and settings.BURSARY_PAYMENT_PLANS_SPREADSHEET_ID.strip()
        and (
            settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip()
            or settings.GOOGLE_SERVICE_ACCOUNT_FILE.strip()
        )
    )


def payment_plan_sheet_values(plans):
    """Build a spreadsheet view with one dynamic column per payment month."""
    plans = list(plans)
    month_dates = sorted({
        installment.due_date.replace(day=1)
        for plan in plans
        for installment in plan.installments.all()
        if installment.kind == BursaryPaymentInstallment.Kind.INSTALLMENT
    })
    month_headers = [month.strftime("%B %Y") for month in month_dates]
    headers = [*PAYMENT_PLAN_BASE_HEADERS, *month_headers]
    rows = []
    for plan in plans:
        application = plan.application
        installments = list(plan.installments.all())
        amount_paid = sum(
            (installment.amount for installment in installments if installment.status == BursaryPaymentInstallment.Status.PAID),
            start=0,
        )
        outstanding = max(plan.amount_payable - amount_paid, 0)
        next_payment = next((
            installment for installment in installments
            if installment.status not in {
                BursaryPaymentInstallment.Status.PAID,
                BursaryPaymentInstallment.Status.CANCELLED,
                BursaryPaymentInstallment.Status.REFUNDED,
            }
        ), None)
        amounts_by_month = {}
        for installment in installments:
            if installment.kind != BursaryPaymentInstallment.Kind.INSTALLMENT:
                continue
            month = installment.due_date.replace(day=1)
            amounts_by_month[month] = amounts_by_month.get(month, 0) + installment.amount
        rows.append([
            application.application_reference,
            application.first_name,
            application.last_name,
            application.email,
            ", ".join(plan.approved_modules),
            plan.start_date_and_cohorts,
            float(plan.amount_payable),
            f"{plan.study_duration_months} months" if plan.study_duration_months else "",
            float(plan.installment_amount) if plan.installment_count else "",
            float(plan.deposit_amount),
            plan.get_status_display(),
            float(amount_paid),
            float(outstanding),
            next_payment.due_date.isoformat() if next_payment else "",
            *[float(amounts_by_month[month]) if month in amounts_by_month else "" for month in month_dates],
        ])
    return [headers, *rows]


def sync_bursary_payment_plan_sheet():
    if not bursary_payment_plan_google_sheets_configured():
        raise ImproperlyConfigured("Bursary payment-plan Google Sheets sync is not fully configured.")
    spreadsheet_id = settings.BURSARY_PAYMENT_PLANS_SPREADSHEET_ID.strip()
    worksheet_name = settings.BURSARY_PAYMENT_PLANS_WORKSHEET_NAME.strip()
    plans = BursaryPaymentPlan.objects.exclude(
        status=BursaryPaymentPlan.Status.DRAFT,
    ).select_related("application").prefetch_related("installments").order_by("application__first_name", "application__last_name")
    values = payment_plan_sheet_values(plans)
    headers = values[0]
    service = _google_sheets_service()
    sheet_id = _get_or_create_sheet_id(service, spreadsheet_id, worksheet_name)
    quoted_name = worksheet_name.replace("'", "''")
    sheet = f"'{quoted_name}'"
    values_api = service.spreadsheets().values()
    values_api.clear(spreadsheetId=spreadsheet_id, range=f"{sheet}!A:ZZ", body={}).execute()
    values_api.update(
        spreadsheetId=spreadsheet_id,
        range=f"{sheet}!A1",
        valueInputOption="RAW",
        body={"values": values},
    ).execute()
    currency_headers = {
        "Estimated amount applicant pays (GBP)",
        "Monthly installment (GBP)",
        "Deposit (GBP)",
        "Amount paid (GBP)",
        "Balance remaining (GBP)",
        *headers[len(PAYMENT_PLAN_BASE_HEADERS):],
    }
    requests = [{
        "updateSheetProperties": {
            "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 1}},
            "fields": "gridProperties.frozenRowCount",
        }
    }, {
        "setBasicFilter": {"filter": {"range": {
            "sheetId": sheet_id,
            "startRowIndex": 0,
            "endRowIndex": max(len(values), 1),
            "startColumnIndex": 0,
            "endColumnIndex": len(headers),
        }}},
    }]
    for index, header in enumerate(headers):
        requests.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1, "startColumnIndex": index, "endColumnIndex": index + 1},
                "cell": {"userEnteredFormat": {
                    "backgroundColor": {"red": 0.10, "green": 0.31, "blue": 0.25},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                    "wrapStrategy": "WRAP",
                }},
                "fields": "userEnteredFormat(backgroundColor,textFormat,wrapStrategy)",
            }
        })
        if header in currency_headers:
            requests.append({
                "repeatCell": {
                    "range": {"sheetId": sheet_id, "startRowIndex": 1, "endRowIndex": max(len(values), 2), "startColumnIndex": index, "endColumnIndex": index + 1},
                    "cell": {"userEnteredFormat": {"numberFormat": {"type": "CURRENCY", "pattern": "£#,##0.00"}}},
                    "fields": "userEnteredFormat.numberFormat",
                }
            })
    service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body={"requests": requests}).execute()
    return len(values) - 1


def sync_bursary_payment_plan_sheet_safely():
    if not bursary_payment_plan_google_sheets_configured():
        return False
    try:
        synced_count = sync_bursary_payment_plan_sheet()
    except Exception:
        logger.exception("Could not sync Bursary payment plans to Google Sheets.")
        return False
    logger.info("Synced %s Bursary payment plans to Google Sheets.", synced_count)
    return True
