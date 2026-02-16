from django.db import models
from django.contrib.auth.models import User





class UserData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    aukro_username = models.CharField(max_length=150, null=True, blank=True)
    bazos_username = models.CharField(max_length=150, null=True, blank=True)
    sbazar_username = models.CharField(max_length=150, null=True, blank=True)
    facebook_username = models.CharField(max_length=150, null=True, blank=True)

class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    # basic info
    title = models.CharField(max_length=200)
    description = models.TextField()

    category = models.CharField(max_length=50, null=True, blank=True)
    price_type = models.CharField(max_length=50, null=True, blank=True)
    sale_type = models.CharField(max_length=20, null=True, blank=True)  # buy_now / auction

    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    condition = models.CharField(max_length=30, null=True, blank=True)

    # contact info
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    bank_account = models.CharField(max_length=50, null=True, blank=True)

    # location
    city = models.CharField(max_length=100, null=True, blank=True)
    postal = models.CharField(max_length=20, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    personal_pickup = models.BooleanField(default=False)
    display_phone = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} (id={self.id})"


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="listing_images/")

    def __str__(self):
        return f"Image for listing {self.listing.id}"


class Platform(models.Model):
    name = models.CharField(max_length=50, unique=True)  # bazos, sbazar, facebook, aukro
    display_name = models.CharField(max_length=100)

    def __str__(self):
        return self.display_name


class ListingPlatform(models.Model):
   

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.listing.id} → {self.platform.name}"