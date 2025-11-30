from django.db import models
from django.contrib.auth.models import User

class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    city = models.CharField(max_length=100)
    postal = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    condition = models.CharField(max_length=20)  # new / used
    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return self.title
class Platform(models.Model):
    name = models.CharField(max_length=50, unique=True)  # bazos, sbazar, aukro
    display_name = models.CharField(max_length=100)      # Bazoš.cz, Sbazar.cz, Aukro.cz

    def __str__(self):
        return self.display_name
class ListingPlatform(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.listing.id} → {self.platform.name}"
    
