from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
def home(request):
    return render(request,'index.html');
def login_page(request):
    return render(request,'login.html');

def register_page(request):
    return render(request,'register.html')


def login_check(request):
    if request.method != "POST":
        return HttpResponse("Invalid method", status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({"success": False, "error": "Invalid credentials"})

    login(request, user)
    return JsonResponse({"success": True})

def register(request):
    if request.method != "POST":
        return HttpResponse("Invalid method", status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"success": False, "error": "Username already taken"})

    User.objects.create_user(username=username, password=password)

    return JsonResponse({"success": True})

