from django.urls import path
from . import views
from . import views2

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login_page'),
    path('register/', views.register_page, name='register_page'),
    path('login/check/', views.login_check, name='login_check'),
    path('register/check/', views.register, name='register_check'),
    path('deepweb/', views.deepweb_page, name='deepweb'),
    path('createListingPage/', views.create_listing_page, name='create_listing_page'),
    path('createListing/', views.create_listing, name='create_listing'),
    path('deleteTable',views.deleteTable),
    path('getAllListings',views.getAllListings,name='getAllListings'),
    path('getListingsForPlatform/<str:platform>', views.getListingsForPlatform, name='getListingsForPlatform'),
    path('settings/',views.settings_page,name='settings_page'),
    path('guide/',views.guide_page,name='guide_page'),
    path('statistics/',views2.stats_page,name='stats_page'),
    path('statistics/data/',views2.stats_data,name='stats_data'),
    path("saveConfig/",views.saveConfig,name="saveconfig"),
    path("applyTheme/", views.applyTheme, name="apply_theme"),
    path("deleteAllListings/", views.deleteAllListings, name="delete_listings"),
    path("deleteListing/<int:id>", views.deleteListing, name="delete_listing"),
    path("saveFeedback/",views2.saveFeedback)
]
