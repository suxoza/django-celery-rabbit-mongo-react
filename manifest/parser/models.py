from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User


class loginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=100, default="")
    created_at = models.DateTimeField(default=now, editable=False)

    def __str__(self) -> str:
        return str(self.ip_address)


class GenerationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=100, default="")
    manifest_id = models.CharField(max_length=160, default="")
    created_at = models.DateTimeField(default=now, editable=False)
    updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return str(self.ip_address)
