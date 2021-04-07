"""Social_Media_App URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path,include
from django.views.generic import TemplateView
from Social_Media_App import myFunctions
from Social_Media_App import settings
from global_login_required import login_not_required

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('u/',include("SM_Users.urls")),
    path('notLoggeIn/',login_not_required(TemplateView.as_view(template_name="user/ulogin.html")),name="notLoggedIn"),
    path('',login_not_required(myFunctions.loginPage),name="u_login"),
    path('webpush/',include("webpush.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
