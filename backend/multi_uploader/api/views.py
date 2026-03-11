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
from django.http import HttpResponse,HttpResponseNotAllowed
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from decimal import Decimal, InvalidOperation
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Listing, ListingImage, Platform, ListingPlatform
from django.views.decorators.http import require_GET,require_POST



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


@ensure_csrf_cookie
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
    "links": list(ListingPlatform.objects.filter(listing=l).values_list("link", flat=True)),
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
    print(request.body)

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

        # create or get listing
        listing, created = Listing.objects.get_or_create(
            owner=request.user,
            title=title,
            description=description,
            defaults={"price": price},
        )

        # add images only if new listing
        if created:
            for image in images:
                img_file = toImageFile(image)
                if img_file:
                    ListingImage.objects.create(listing=listing, image=img_file)

        # find platform
        platform = Platform.objects.filter(name=platform_name).first()
        if not platform:
            continue

        # create relation listing-platform
        ListingPlatform.objects.get_or_create(
            listing=listing,
            platform=platform,
            defaults={"link": link},
        )

    return HttpResponse(status=204)



@csrf_exempt
@require_GET
def getAllListings(request):
    
    listings = Listing.objects.filter(owner=request.user).prefetch_related(
        "images",
        "listingplatform_set__platform"
    )
    print(listings)
    data = []

    for l in listings:
        data.append({
            "id": l.id,
            "title": l.title,
            "description": l.description,
            "price": str(l.price),
            "images": [img.image.url for img in l.images.all()],
            "platforms": [
                {
                    "name": lp.platform.name,
                    "link": lp.link
                }
                for lp in l.listingplatform_set.all()
            ]
        })

    return JsonResponse(data, safe=False)




def getListingsForPlatform(request, platform):
    print("---- getListingsForPlatform DEBUG ----")

    data = []

    print("platform param:", platform)

    platform_obj = Platform.objects.get(name=platform)
    print("platform_obj:", platform_obj)
    print("platform_obj.id:", platform_obj.id)

    print("request.user:", request.user)
    print("request.user.id:", request.user.id)
    print("request.user.is_authenticated:", request.user.is_authenticated)

    listingplatform_qs = ListingPlatform.objects.filter(platform=platform_obj)
    print("ListingPlatform rows:", list(listingplatform_qs.values()))

    listing_ids = list(
        listingplatform_qs.values_list("listing_id", flat=True)
    )
    print("listing_ids:", listing_ids)

    user_listings = Listing.objects.filter(owner=request.user)
    print("all user listings:", list(user_listings.values("id", "title")))

    listings = Listing.objects.filter(
        owner=request.user,
        id__in=listing_ids
    )

    print("filtered listings count:", listings.count())
    print("filtered listings:", list(listings.values("id", "title")))

    for l in listings:
        print("processing listing:", l.id, l.title)

        images = [img.image.url for img in l.images.all()]
        print("images:", images)

        data.append({
            "id": l.id,
            "title": l.title,
            "description": l.description,
            "price": str(l.price),
            "images": images
        })

    print("final data:", data)
    print("---- END DEBUG ----")

    return JsonResponse(data, safe=False)