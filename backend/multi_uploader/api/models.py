from django.db import models
from django.contrib.auth.models import User





class UserData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    theme = models.CharField(max_length=20, default="black")

    email = models.EmailField(blank=True)

    phone = models.CharField(max_length=30, blank=True)

    sorting = models.CharField(
        max_length=20,
        default="newfirst"
    )

    display = models.CharField(
        max_length=20,
        default="all"
    )

class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "title", "description"],
                name="unique_listing_per_user"
            )
        ]
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
    link = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        unique_together = ("listing", "platform")

    def __str__(self):
        return f"{self.listing.id} → {self.platform.name}"
    



class Feedback(models.Model):
    email = models.CharField(max_length=70)
    name = models.CharField(max_length=100)
    text = models.TextField(null=False)
