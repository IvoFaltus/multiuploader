import json
from collections import Counter
from datetime import timedelta
from pathlib import Path

from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone

from .models import Listing, UserData


THEMES_FILE = Path(__file__).resolve().parent / "static" / "themes.txt"
COLORS_FILE = Path(__file__).resolve().parent / "static" / "colors.css"


def write_theme_css(theme_name):
    try:
        themes = json.loads(THEMES_FILE.read_text(encoding="utf-8") or "{}")
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    css_text = themes.get(theme_name) or themes.get("black")
    if not css_text:
        return False

    COLORS_FILE.write_text(css_text, encoding="utf-8")
    return True


def sync_user_theme(user):
    if not getattr(user, "is_authenticated", False):
        return False

    config = UserData.objects.filter(user=user).values("theme").first()
    theme_name = config["theme"] if config and config.get("theme") else "black"
    return write_theme_css(theme_name)


@login_required
def stats_page(request):
    sync_user_theme(request.user)
    return render(request, "stats.html")


@login_required
def stats_data(request):
    sync_user_theme(request.user)

    listings = list(
        Listing.objects.filter(owner=request.user)
        .prefetch_related("images", "listingplatform_set__platform")
        .order_by("-created_at")
    )

    now = timezone.now()
    start_date = now - timedelta(days=6)

    total_listings = len(listings)
    listings_with_images = sum(1 for listing in listings if listing.images.all())
    total_platform_links = sum(listing.listingplatform_set.count() for listing in listings)
    avg_price = (
        Listing.objects.filter(owner=request.user, price__isnull=False).aggregate(avg=Avg("price"))["avg"]
    )

    platform_counter = Counter()
    timeline_counter = Counter()
    price_buckets = {"0-99": 0, "100-499": 0, "500-999": 0, "1000+": 0}

    for listing in listings:
        created_local = timezone.localtime(listing.created_at)
        created_date = created_local.date()

        if created_date >= start_date.date():
            timeline_counter[created_date.isoformat()] += 1

        price = float(listing.price) if listing.price is not None else None
        if price is not None:
            if price < 100:
                price_buckets["0-99"] += 1
            elif price < 500:
                price_buckets["100-499"] += 1
            elif price < 1000:
                price_buckets["500-999"] += 1
            else:
                price_buckets["1000+"] += 1

        for relation in listing.listingplatform_set.all():
            platform_counter[relation.platform.name] += 1

    timeline = []
    for day_offset in range(7):
        day = (start_date + timedelta(days=day_offset)).date()
        timeline.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%b %d"),
                "count": timeline_counter.get(day.isoformat(), 0),
            }
        )

    platform_labels = ["aukro", "bazos", "sbazar", "facebook"]
    platform_data = [
        {
            "name": platform,
            "count": platform_counter.get(platform, 0),
        }
        for platform in platform_labels
    ]

    recent_listings = [
        {
            "id": listing.id,
            "title": listing.title,
            "created_at": timezone.localtime(listing.created_at).strftime("%d.%m.%Y %H:%M"),
            "price": str(listing.price) if listing.price is not None else "N/A",
            "platforms": [rel.platform.display_name for rel in listing.listingplatform_set.all()],
            "image": next((image.image.url for image in listing.images.all()), ""),
        }
        for listing in listings[:5]
    ]

    top_platform = max(platform_data, key=lambda item: item["count"], default={"name": "none", "count": 0})

    payload = {
        "summary": {
            "total_listings": total_listings,
            "listings_with_images": listings_with_images,
            "platform_links": total_platform_links,
            "avg_price": f"{avg_price:.2f}" if avg_price is not None else "0.00",
            "top_platform": top_platform["name"].title() if top_platform["count"] else "No data",
        },
        "timeline": timeline,
        "platforms": platform_data,
        "price_buckets": [
            {"label": label, "count": count}
            for label, count in price_buckets.items()
        ],
        "recent_listings": recent_listings,
    }

    return JsonResponse(payload)
