from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login_page'),
    path('register/', views.register_page, name='register_page'),
    path('login/check/', views.login_check, name='login_check'),
    path('register/check/', views.register, name='register_check'),
    path('deepweb/', views.deepweb_page, name='deepweb'),
    path('createListingPage/', views.create_listing_page, name='create_listing_page'),
    path('createListing/', views.create_listing, name='create_listing'),
    path('deleteTable',views.deleteTable)
]
