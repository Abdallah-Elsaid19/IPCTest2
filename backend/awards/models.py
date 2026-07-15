from django.db import models


class AwardProgramme(models.Model):
    class Category(models.TextChoices):
        ACADEMIC = "academic", "Academic"
        COMMERCIAL = "commercial", "Commercial"
        PROFESSIONAL = "professional", "Professional"
        OTHER = "other", "Other"

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.OTHER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title


class AwardsInterest(models.Model):
    class InterestType(models.TextChoices):
        NOMINATE = "Nominate", "Nominate"
        SPONSOR = "Sponsor", "Sponsor"
        JUDGE = "Judge", "Judge"
        GENERAL = "General", "General"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    programme = models.ForeignKey(AwardProgramme, null=True, blank=True, on_delete=models.SET_NULL, related_name="interests")
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    interest_type = models.CharField(max_length=24, choices=InterestType.choices)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["interest_type", "created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.interest_type}"