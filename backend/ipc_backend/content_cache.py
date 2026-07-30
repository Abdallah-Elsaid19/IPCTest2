class ContentNoStoreMiddleware:
    """Ensure CMS-backed public content is never served from a stale cache."""

    SPECIAL_CONTENT_PATHS = {
        "/api/scholarships",
        "/api/sponsorship",
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path.rstrip("/")
        is_content_request = (
            path.endswith("/content")
            or path in self.SPECIAL_CONTENT_PATHS
            or (
                path.startswith("/api/clubs/")
                and path not in {"/api/clubs/enquiries"}
            )
        )
        if request.method in {"GET", "HEAD"} and is_content_request:
            response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
        return response
