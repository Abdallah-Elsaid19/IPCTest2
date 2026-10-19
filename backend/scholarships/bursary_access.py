from django.core import signing


BURSARY_EDIT_LINK_MAX_AGE = 7 * 24 * 60 * 60
BURSARY_EDIT_LINK_SALT = "scholarships.bursary-edit.v1"


def bursary_edit_revision(application):
    # A new information request gets a new history ID, so old links never reopen.
    return application.status_history.order_by("-pk").values_list("pk", flat=True).first()


def make_bursary_edit_token(application):
    return signing.dumps({
        "application_id": application.pk,
        "revision": bursary_edit_revision(application),
    }, salt=BURSARY_EDIT_LINK_SALT)


def read_bursary_edit_token(token):
    return signing.loads(
        token,
        salt=BURSARY_EDIT_LINK_SALT,
        max_age=BURSARY_EDIT_LINK_MAX_AGE,
    )
