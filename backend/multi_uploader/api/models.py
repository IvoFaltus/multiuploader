from django.db import models
from django.contrib.auth.models import User
# Create your models here.
user = User.objects.create_user(
    username="testuser",
    password="mypassword123"
)