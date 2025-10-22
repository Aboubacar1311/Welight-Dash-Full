from django.db import models

class Client(models.Model):
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"
