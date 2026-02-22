from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Listing ,ListingPlatform, Platform, ListingImage
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
import json
import base64
from django.core.files.base import ContentFile
from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from decimal import Decimal, InvalidOperation
from django.views.decorators.csrf import csrf_exempt
from .models import Listing, ListingImage, Platform, ListingPlatform

def createListingFunc(owner, title, description, category, price_type, sale_type, price, condition, name, email, bank_account, city, postal, phone, personal_pickup, display_phone, platforms, images):
    listing = Listing.objects.create(
        owner=owner,
        title=title,
        description=description,
        category=category,
        price_type=price_type,
        sale_type=sale_type,
        price=price,
        condition=condition,
        name=name,
        email=email,
        bank_account=bank_account,
        city=city,
        postal=postal,
        phone=phone,
        personal_pickup=personal_pickup,
        display_phone=display_phone
    )

    for platform in platforms:
        matched_platform = Platform.objects.filter(name=platform).first()
        if matched_platform:
            ListingPlatform.objects.create(
                listing=listing,
                platform=matched_platform
            )

    for image in images:
        ListingImage.objects.create(
            listing=listing,
            image=image
        )

    return listing

    



    for platform in platforms:
        matched_platform = Platform.objects.filter(name=platform).first()
        if matched_platform:        
            ListingPlatform.objects.create(
                listing=listing,
                platform=matched_platform
            )
        
    return listing




def home(request):
    return render(request, 'index.html')


@csrf_exempt
def deleteTable(request):
    if request.method != "POST":
        return HttpResponse("Bad Method",status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return HttpResponse("Invalid JSON", status=400)

    if data.get("tables") == "all":
        ListingImage.objects.all().delete()
        ListingPlatform.objects.all().delete()
        Listing.objects.all().delete()

    return HttpResponse(status=204)

def create_listing_page(request):
    if not request.user.is_authenticated:
        return redirect('home')     # URL name  
    return render(request, 'create_listing.html')

def login_page(request):
    return render(request, 'login.html')


def register_page(request):
    return render(request, 'register.html')


def login_check(request):
    if request.method != "POST":
        return HttpResponse("Invalid method", status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({"success": False, "error": "Invalid credentials"})

    login(request, user)
    return redirect('deepweb')      # URL name


def deepweb_page(request):
    if not request.user.is_authenticated:
        return redirect('home')

    listings = Listing.objects.filter(owner=request.user)

    data = {}
    i = 1
    for l in listings:
        data[f"Listing {i}"] = { 
    "title": l.title,
    "link": ListingPlatform.objects.filter(listing=l).first().link,
    "description": l.description,
    "price":  str(l.price) if l.price is not None else None,
    "platforms": [listing_platform.platform.name for listing_platform in ListingPlatform.objects.filter(listing=l)],
    "pictures": [img.image.url for img in ListingImage.objects.filter(listing=l)]
}
        i += 1
        
    
        
        

    return render(request, 'deepweb.html', {"data_json": json.dumps(data)})


def register(request):
    if request.method != "POST":
        return HttpResponse("Invalid method", status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"success": False, "error": "Username already taken"})

    User.objects.create_user(username=username, password=password)

    return redirect('login_page')   # URL name





def toImageFile(base64_string, filename="image"):
    if not base64_string:
        return None

    format, imgstr = base64_string.split(";base64,")
    ext = format.split("/")[-1]

    return ContentFile(
        base64.b64decode(imgstr),
        name=f"{filename}.{ext}"
    )




@csrf_exempt
def create_listing(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated:
        return HttpResponse("Authentication required", status=401)

    try:
        data = json.loads(request.body)
    except Exception:
        return HttpResponse("Invalid JSON", status=400)

    listings = data.get("listings", [])

    for item in listings:
        link = item.get("link")
        platform_name = item.get("platform")
        title = item.get("title", "").strip()
        description = item.get("description", "").strip()
        images = item.get("images", [])

        if not (link and platform_name and title):
            continue

        # price parse
        price = None
        if item.get("price"):
            try:
                price = Decimal(str(item["price"]).replace(",", "."))
            except InvalidOperation:
                pass

        # listing create/get
        listing, created = Listing.objects.get_or_create(
            owner=request.user,
            title=title,
            description=description,
            defaults={"price": price},
        )

        # images only when new listing
        if created:
            for image in images:
                img_file = toImageFile(image)
                if img_file:
                    ListingImage.objects.create(listing=listing, image=img_file)

        platform = Platform.objects.filter(name=platform_name).first()
        if not platform:
            continue
        
        ListingPlatform.objects.get_or_create(
            listing=listing,
            platform=platform,
            defaults={"link": link},
        )

    return HttpResponse(status=204)

