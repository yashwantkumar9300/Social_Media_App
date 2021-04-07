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

from django.urls import path
from django.views.generic import TemplateView
from SM_Users import views
from global_login_required import login_not_required
from SM_Users.views import ThreadView


urlpatterns = [
    
    path('sign_up/',views.sign_up,name="sign_up"),
    path('save_reg/',views.Save_Registration.as_view(),name="save_reg"),
    path('reg_validate_otp/',views.Reg_validate_otp.as_view(),name="reg_validate_otp"),
    path('login/',login_not_required(views.User_Login.as_view()),name="login"),
    path('logout/',views.User_Logout.as_view(),name="logout"),
    path('homepage/',views.Homepage,name="homepage"),
    path('u_forgot_pwd/',login_not_required(TemplateView.as_view(template_name="user/u_forgot_pwd.html")),name="u_forgot_pwd"),
    path('u_for_pwd_email/',views.Forgot_pwd_email.as_view(),name="u_for_pwd_email"),
    path('for_pwd_validate_otp/',views.Forgot_pwd_validate_otp.as_view(),name="for_pwd_validate_otp"),

    path('search_friends/',views.Search_Friends.as_view(),name="search_friends"),
    path('search_friends_detail/',views.Search_Friends_detail.as_view(),name="search_friends_detail"),
    path('addfriends/',views.addfriends,name="addfriends"),
    path('acceptRequest/',views.acceptRequest,name="acceptRequest"),
    path('cancelRequest/',views.cancelRequest,name="cancelRequest"),

    path('notifications/',views.notifications_page,name="notifications"),
    path('read_noti/',views.read_noti,name="read_noti"),
    path('read_acti/',views.read_acti,name="read_acti"),
    path('load_notification/',views.load_notification,name="load_notification"),

    path('my_profile/',views.my_profile,name="my_profile"),
    path('update_profile/',views.update_profile,name="update_profile"),

    path('friends/',views.friends_tab,name="friends"),

    path('unfriend/',views.unfriend,name="unfriend"),

    path('mark_all_read/',views.mark_all_read,name="mark_all_read"),

    path('load_more_request/',views.load_more_request,name="load_more_request"),
    path('load_more_friends/',views.load_more_friends,name="load_more_friends"),
    path('load_more_sent_req/',views.load_more_sent_req,name="load_more_sent_req"),

    path('cp/',views.createPost,name="cp"),
    path('commentOnPost/',views.commentOnPost,name="commentOnPost"),
    path('likeOnPost/',views.likeOnPost,name="likeOnPost"),

    path('redirect_me/',views.redirect_me,name="redirect_me"),

    path('smpl/',views.smpl,name='smpl'),

    path('view_post/',views.viewPost,name='view_post'),
    path('view_postr/',views.viewPostr,name='view_postr'),  #ending with 'r' means post status is 'read'
    path('deletePost/',views.deletePost,name="deletePost"),

    path('modalPost/',views.modalPost,name="modalPost"),
    path('likeOnModalPost/',views.likeOnModalPost,name="likeOnModalPost"),
    path('commentOnModalPost/',views.commentOnModalPost,name="commentOnModalPost"),

    path('myposts/',views.myposts,name="myposts"),

    path('checkUsername/',views.checkUsername,name="checkUsername"),
    path('checkUseremail/',views.checkUseremail,name="checkUseremail"),
    path('updateDetails/',views.updateDetails,name="updateDetails"),

    path('loadMorePost/',views.loadMorePost,name="loadMorePost"),

    #Chats
    path('mychats/',views.myChats,name='mychats'),
    path('chat/<str:username>/', ThreadView.as_view()),

    path('myactivity/',views.myActivity,name="myactivity"),
    path('load_activity/',views.load_activity,name="load_activity"),

    path('photos/',views.photosTab,name="photos")
]
