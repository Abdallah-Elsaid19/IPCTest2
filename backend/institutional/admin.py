from django.contrib import admin

from .models import EmployerContent, PartnershipContent, PublicationContent

admin.site.register(EmployerContent)
admin.site.register(PartnershipContent)
admin.site.register(PublicationContent)
