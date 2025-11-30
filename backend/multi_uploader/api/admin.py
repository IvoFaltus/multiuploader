from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Listing,ListingPlatform, Platform



class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "city", "postal", 'description',"phone", "condition", "owner", "created_at")

admin.site.register(Listing, ListingAdmin)
class ListingPlatformAdmin(admin.ModelAdmin):
    list_display = ("listing", "platform")

admin.site.register(ListingPlatform, ListingPlatformAdmin)


class PlatformAdmin(admin.ModelAdmin):
    list_display = ("name", "display_name")
admin.site.register(Platform)