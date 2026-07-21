from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import HomeContent


class HomeContentApiTests(APITestCase):
    def setUp(self):
        self.content = HomeContent.objects.get(key="main")

    def test_public_endpoint_only_returns_published_active_content(self):
        response = self.client.get("/api/home/content")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["hero"]["title"], self.content.hero["title"])

        self.content.status = HomeContent.Status.DRAFT
        self.content.save(update_fields=["status"])
        self.assertEqual(self.client.get("/api/home/content").status_code, 404)

    def test_inactive_content_is_not_public(self):
        self.content.is_active = False
        self.content.save(update_fields=["is_active"])
        self.assertEqual(self.client.get("/api/home/content").status_code, 404)


class AdminManagedContentApiTests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.admin = users.objects.create_user(
            username="content.admin",
            email="content-admin@example.com",
            password="test",
            is_staff=True,
        )
        self.member = users.objects.create_user(
            username="content.member",
            email="content-member@example.com",
            password="test",
        )

    def test_admin_can_save_draft_and_publish_without_losing_media_fields(self):
        self.client.force_authenticate(self.admin)
        content = HomeContent.objects.get(key="main")
        hero = {**content.hero, "title": "Updated home title"}

        draft = self.client.patch(
            "/api/admin/content/home",
            {"sections": {"hero": hero}, "status": "draft"},
            format="json",
        )
        self.assertEqual(draft.status_code, 200, draft.data)
        self.assertEqual(draft.data["status"], "draft")
        self.assertEqual(draft.data["sections"]["hero"]["image_url"], content.hero["image_url"])

        published = self.client.patch(
            "/api/admin/content/home",
            {"status": "published"},
            format="json",
        )
        self.assertEqual(published.status_code, 200, published.data)
        self.assertIsNotNone(published.data["published_at"])
        self.assertEqual(published.data["updated_by"], self.admin.pk)
        self.assertEqual(self.client.get("/api/home/content").data["hero"]["title"], "Updated home title")

    def test_non_staff_cannot_manage_content(self):
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.patch("/api/admin/content/home", {}, format="json").status_code, 403)
