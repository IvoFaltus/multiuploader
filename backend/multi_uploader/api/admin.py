from django.contrib import admin
from .models import Listing, ListingImage, Platform, ListingPlatform, UserData


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

class ListingPlatformInline(admin.TabularInline):
    model = ListingPlatform
    extra = 1


@admin.register(UserData)
class UserDataAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "email",
        "sorting",
        "display",
        "phone",
    )
    search_fields = ("user", "email", "sorting", "display", "phone")

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "price",
        "owner",
        "created_at",
        "description",
    )

    search_fields = ("title", "description", "owner")
    
    readonly_fields = ("created_at",)
    inlines = [ListingImageInline, ListingPlatformInline]


@admin.register(ListingPlatform)
class ListingPlatformAdmin(admin.ModelAdmin):
    list_display = ("listing", "platform")


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "display_name")


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("listing", "image")