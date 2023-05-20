import time, os

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bs4 import BeautifulSoup
import requests


# Create your views here.
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.core.files import File
from django.http import HttpResponse
from manifest.settings import BASE_DIR


from .celery_instance import simple_app


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user_id": user.pk, "username": user.username}
        )


class Logout(APIView):
    def get(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class GenerateView(APIView):
    # authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def if_site_exists(self, partition_id):
        try:
            r = requests.get(f"https://manifest.ge/petitions/{partition_id}/")
            soup = BeautifulSoup(r.content, "html.parser")
            return not "გვერდი ვერ მოიძებნა" in soup.title.string
        except Exception as ex:
            pass
        return False

    def get(self, request, manifest_id):
        # if site exists

        if not self.if_site_exists(manifest_id):
            return Response(
                dict(error="Manifest not found for this id!"),
                status=status.HTTP_404_NOT_FOUND,
            )

        task = simple_app.send_task(
            "tasks.parseManifest",
            kwargs={"petition_id": manifest_id},
        )
        status1 = simple_app.AsyncResult(task.task_id, app=simple_app)
        return Response(
            dict(status=status1.status, result=status1.result, celery_id=task.task_id),
            status=status.HTTP_200_OK,
        )


class GetStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, manifest_id, celery_id):
        result = simple_app.AsyncResult(celery_id, app=simple_app)
        return Response(
            {
                "message": "Status of the Task " + str(result.state),
                "file": os.path.exists(
                    str(BASE_DIR) + (f"/storage/data-{manifest_id}.csv")
                ),
                "status": result.status,
            },
            status=status.HTTP_200_OK,
        )


class DownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, manifest_id):
        path_to_file = str(BASE_DIR) + (f"/storage/data-{manifest_id}.csv")
        f = open(path_to_file, "rb")
        pdfFile = File(f)
        response = HttpResponse(pdfFile.read())
        response["Content-Disposition"] = "attachment"
        return response

    # docker system prune --force --filter "label=manifests_djangoapp*"
    # docker-compose build --no-cache celery_worker
    # docker-system prune -a
