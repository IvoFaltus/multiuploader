from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Listing ,ListingPlatform, Platform, ListingImage
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
import json


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
    "description": l.description,
    "price":  str(l.price) if l.price is not None else None,
    "city": l.city,
    "postal": l.postal,
    "phone": l.phone,
    "condition": l.condition,
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






from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from decimal import Decimal, InvalidOperation

from .models import Listing, ListingImage, Platform, ListingPlatform


@login_required(login_url='home')
def create_listing(request):
    if request.method != "POST":
        return HttpResponse("Invalid method", status=405)

    # -------- SAFE FIELD READING --------

    def get(name):
        return request.POST.get(name, "").strip()

    title = get("title")
    description = get("description")
    category = get("category")
    price_type = get("price_type")
    sale_type = get("sale_type")
    condition = get("condition")

    name = get("name")
    email = get("email")
    bank_account = get("bank_account")

    city = get("city")
    postal = get("postal")
    phone = get("phone")

    # -------- SAFE PRICE PARSING --------

    price_raw = get("price")
    price = None

    if price_raw != "":
        try:
            price = Decimal(price_raw.replace(",", "."))
        except InvalidOperation:
            return HttpResponse("Invalid price format", status=400)

    # -------- CHECKBOXES --------

    personal_pickup = "personal_pickup" in request.POST
    display_phone = "displayPhone" in request.POST

    # -------- PASSWORD (HASHED) --------

    raw_password = get("password")
    password = make_password(raw_password) if raw_password else None

    # -------- CREATE LISTING --------

    listing = Listing.objects.create(
        owner=request.user,
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
        display_phone=display_phone,
    )

    # -------- SAVE IMAGES --------

    photos = request.FILES.getlist("photos")
    for photo in photos:
        ListingImage.objects.create(listing=listing, image=photo)

    # -------- SAVE PLATFORMS --------

    platforms = request.POST.getlist("platforms")
    for p in platforms:
        platform_obj = Platform.objects.filter(name=p).first()
        if platform_obj:
            ListingPlatform.objects.create(listing=listing, platform=platform_obj)

    return redirect("deepweb")
    