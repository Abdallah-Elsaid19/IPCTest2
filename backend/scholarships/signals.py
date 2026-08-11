from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .google_sheets import sync_bursary_google_sheet_safely
from .models import BursaryApplication


def schedule_bursary_google_sheet_sync():
    transaction.on_commit(sync_bursary_google_sheet_safely)


@receiver(post_save, sender=BursaryApplication)
def sync_bursary_sheet_after_save(**kwargs):
    schedule_bursary_google_sheet_sync()


@receiver(post_delete, sender=BursaryApplication)
def sync_bursary_sheet_after_delete(**kwargs):
    schedule_bursary_google_sheet_sync()
