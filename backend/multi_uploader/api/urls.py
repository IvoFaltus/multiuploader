from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('login/',views.login_page),
    path('register/',views.register_page),
    path('login/check/',views.login_check),
    path('register/check/', views.register),
]
