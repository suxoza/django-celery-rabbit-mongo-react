from django.urls import re_path, path
from .views import LoginView, GenerateView, Logout, DownloadView, GetStatus

urlpatterns = [
    path("login", LoginView.as_view(), name="api-login"),
    path("logout", Logout.as_view(), name="api-logout"),
    path("generate/<int:manifest_id>", GenerateView.as_view(), name="api-generate"),
    path(
        "generate/<int:manifest_id>/<str:celery_id>",
        GetStatus.as_view(),
        name="api-get-status",
    ),
    path("download/<int:manifest_id>", DownloadView.as_view(), name="api-download"),
]
