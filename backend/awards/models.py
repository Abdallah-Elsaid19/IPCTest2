from django.db import models


class AwardCategory(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField()
    image_url = models.URLField(max_length=1000)
    icon_class = models.CharField(max_length=80)
    highlights = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name_plural = "Award categories"
        indexes = [
            models.Index(fields=["is_active", "sort_order"], name="awards_cat_active_order_idx"),
        ]

    def __str__(self):
        return self.title


class AwardProgramme(models.Model):

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    criteria = models.JSONField(default=list, blank=True)
    category = models.ForeignKey(
        AwardCategory,
        on_delete=models.PROTECT,
        related_name="programmes",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        indexes = [
            models.Index(fields=["category", "is_active"], name="awards_prog_cat_active_idx"),
            models.Index(fields=["slug"], name="awards_awar_slug_1d6b47_idx"),
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
