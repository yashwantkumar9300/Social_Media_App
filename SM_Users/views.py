import asyncio
from datetime import datetime

from asgiref.sync import sync_to_async
from django.shortcuts import render, redirect
from webpush import send_user_notification
from SM_Users.user_forms import UserRegistrationForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login,logout
from SM_Users.models import UserModel,AllNotification,FriendRequestModel,AllPosts,CommentsOnPost,FilesOnPosts
from django.core.mail import send_mail
from Social_Media_App import settings as se
import random
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponse
import dateutil.parser
from django.db.models import Q


#chat imports
from django.views import View
from django.contrib.auth import get_user_model
from django.shortcuts import Http404
from SM_Users.models import Thread, Message


#Common Views
reg_rand_otp=None
def registration_mail(em,reg_string):
    global reg_rand_otp
    reg_rand_otp=random.randint(000000,999999)
    print(reg_rand_otp)
    send_mail("[FriendsBook.com]",reg_string+str(reg_rand_otp),se.EMAIL_HOST_USER,[em])

def myFriendsList(request):
    u_data = UserModel.objects.filter(username=request.user)
    my_friends = FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),
                                                   status="Accepted").order_by('-request_accepted_date')
    my_frnds_list = []
    for res in my_friends:
        if res.request_from == u_data[0]:
            my_frnds_list.append(res.request_to)
        else:
            my_frnds_list.append(res.request_from)
    return my_frnds_list,u_data


def commonQuery(request):
    u_data=UserModel.objects.filter(username=request.user)
    frm=len(FriendRequestModel.objects.filter(request_to=u_data[0],status="Pending"))
    all_friends = len(FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),
                                                    status="Accepted"))  # here Q and "|" (or operator) is working to find the total friends.
    noti_count = len(
        AllNotification.objects.filter(noti_to=UserModel.objects.get(username=request.user), status="unread").exclude(
            Q(not_type="Request Cancelled") | Q(not_type="Unfriend") | Q(not_type="Commented on own post") | Q(not_type="Liked on own") | Q(not_type="Commented on own profile")))

    my_friends = FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),
                                                   status="Accepted").order_by('-request_accepted_date')
    my_frnds_list = []
    for res in my_friends:
        if res.request_from == u_data[0]:
            my_frnds_list.append(res.request_to)
        else:
            my_frnds_list.append(res.request_from)
    return frm,all_friends,noti_count,u_data,my_frnds_list


def save_notification(request,typ,log_usr,othr_usr,frm_idno=None):
    if typ=="Friend Request":
        notification =log_usr.fname+" wants to be your friend."
        my_notification="You sent a friend request to "+othr_usr.fname+"."
        AllNotification(not_type=typ,noti_from=log_usr,noti_to=othr_usr,notification=notification,my_notification=my_notification).save()
        payload = {"head": typ, "body": notification,
                   "icon": log_usr.image.url, "url": "/u/search_friends_detail/?f="+log_usr.username}
        send_user_notification(user=othr_usr.user ,payload=payload, ttl=1000, )
    elif typ=="Request Accepted":
        notification = log_usr.fname + " accepted your friend request."
        my_notification = "You accepted the friend request of "+othr_usr.fname+"."
        AllNotification(not_type=typ, noti_from=log_usr, noti_to=othr_usr, notification=notification,
                        my_notification=my_notification).save()
        payload = {"head": typ, "body": notification,
                   "icon": othr_usr.image.url, "url": "/u/search_friends_detail/?f="+log_usr.username}
        send_user_notification(user=othr_usr.user, payload=payload, ttl=1000, )
    elif typ=="Request Cancelled":
        notification = log_usr.fname + " cancelled your friend request."
        my_notification = "Your friend request has been cancelled by "+othr_usr.fname+"."
        AllNotification(not_type=typ, noti_from=log_usr, noti_to=othr_usr, notification=notification,
                        my_notification=my_notification).save()
    elif typ=="Unfriend":
        notification = log_usr.fname + " removed you as a friend."
        my_notification = "Your removed  "+othr_usr.fname+" from your friend list."
        if othr_usr.username==log_usr.username:
            my_notification="Your removed  "+frm_idno.request_to.fname+" from your friend list."         #here frm_idno is working to get the username of other frnd
        AllNotification(not_type=typ, noti_from=log_usr, noti_to=othr_usr, notification=notification,
                        my_notification=my_notification).save()
    elif typ=="PostLiked":
        pass
    elif typ=="Commented on post":
        notification = log_usr.fname + " commented on your post."
        my_notification = "You commented on " + othr_usr.fname + "'s post."
        an=AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr, notification=notification,
                        my_notification=my_notification,post_id=frm_idno.post)
        payload = {"head": typ, "body": notification,
                    "icon": log_usr.image.url, "url": "/u/view_post/?idnt="+str(frm_idno.post.post_id)+"&nid="+str(an.idno)}     #here frm_idno varible is used for geeting the post_id which will be used to make a url
        send_user_notification(user=othr_usr.user, payload=payload, ttl=1000, )

    elif typ=="Commented on own profile":
        notification = "You commented on your profile."
        my_notification = "You commented on your profile."
        an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                            notification=notification,
                                            my_notification=my_notification, post_id=frm_idno.post)


    elif typ=="Commented on profile":
        notification = log_usr.fname + " commented on your profile."
        my_notification = "You commented on " + othr_usr.fname + "'s profile."
        an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                            notification=notification,
                                            my_notification=my_notification, post_id=frm_idno.post)
        payload = {"head": typ, "body": notification,
                   "icon": log_usr.image.url,
                   "url": "/u/view_post/?idnt=" + str(frm_idno.post.post_id) + "&nid=" + str(
                       an.idno)}  # here frm_idno varible is used for geeting the post_id which will be used to make a url
        send_user_notification(user=othr_usr.user, payload=payload, ttl=1000, )

    elif typ=="Commented on own post":
        notification = "You commented on your own post."
        my_notification = "You commented on your own post."
        an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                            notification=notification,
                                            my_notification=my_notification,post_id=frm_idno.post)
    elif typ=="Liked":
        if "profile picture" in frm_idno.post_header:
            notification = log_usr.fname + " liked your profile picture."
            my_notification = "You liked " + othr_usr.fname + "'s profile picture."
            an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                                notification=notification,
                                                my_notification=my_notification, post_id=frm_idno)
            payload = {"head": typ, "body": notification,
                       "icon": log_usr.image.url, "url": "/u/view_post/?idnt=" + str(frm_idno.post_id) + "&nid=" + str(
                    an.idno)}  # here frm_idno varible is used for geeting the post_id which will be used to make a url
            send_user_notification(user=othr_usr.user, payload=payload, ttl=1000, )
        else:
            notification = log_usr.fname + " liked your post."
            my_notification = "You liked " + othr_usr.fname + "'s post."
            an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                                notification=notification,
                                                my_notification=my_notification, post_id=frm_idno)
            payload = {"head": typ, "body": notification,
                       "icon": log_usr.image.url, "url": "/u/view_post/?idnt=" + str(frm_idno.post_id) + "&nid=" + str(
                    an.idno)}  # here frm_idno varible is used for geeting the post_id which will be used to make a url
            send_user_notification(user=othr_usr.user, payload=payload, ttl=1000, )
    elif typ=="Liked on own":
        if "profile picture" in frm_idno.post_header:
            notification = "You liked your profile picture."
            my_notification = "You liked your profile picture."
            an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                                notification=notification,
                                                my_notification=my_notification, post_id=frm_idno)
        else:
            notification = "You liked your post."
            my_notification = "You liked your post."
            an = AllNotification.objects.create(not_type=typ, noti_from=log_usr, noti_to=othr_usr,
                                                notification=notification,
                                                my_notification=my_notification, post_id=frm_idno)
    else:
        pass




def sign_up(request):
    return render(request,"user/user_registration.html",{"reg_form":UserRegistrationForm})


reg_data=None
class Save_Registration(View):
    def post(self,request):
        global reg_data
        reg_data=[]
        urf=UserRegistrationForm(request.POST,request.FILES)
        if urf.is_valid():
            reg_data.append({'fname':urf.cleaned_data['fname'],'lname':urf.cleaned_data['lname'],'email':urf.cleaned_data['email'],
                             'uname': urf.cleaned_data['username'], 'pwd': urf.cleaned_data['password'],})
            print(reg_data)
            usr = User.objects.create_user(username=reg_data[0]["uname"], password=reg_data[0]["pwd"])
            UserModel(fname=reg_data[0]["fname"], lname=reg_data[0]["lname"], email=reg_data[0]["email"],
                      username=reg_data[0]["uname"],password=reg_data[0]["pwd"],
                      image="user_profile_image/user_img.jpg", user=usr).save()
            return render(request, "user/ulogin.html", {"success": "Successfully Registered"})
        else:
            return render(request,"user/user_registration.html",{"reg_form":urf})


class Reg_validate_otp(View):
    pass


class User_Login(View):
    def post(self,request):
        uname=request.POST.get("uname")
        upass=request.POST.get("upass")
        try:
            user=authenticate(request,username=uname,password=upass)
            if user:
                login(request,user)
                # return render(request, "user/homepage.html")
                return redirect('homepage')
            else:
                return render(request, "user/ulogin.html", {"error": "Invalid Credentials"})
        except User.DoesNotExist:
            return render(request,"user/ulogin.html",{"error":"Invalid Credentials"})

class User_Logout(View):
    def get(self,request):
        logout(request)
        return render(request,"user/ulogin.html",{"logout":"Successfully Logged Out"})


def Homepage(request):
    myfrndlist=myFriendsList(request)
    all_post=AllPosts.objects.filter(Q(created_by__in=myfrndlist[0])|Q(created_by__in=myfrndlist[1]),status=True).order_by('-date_created')[:5]
    result=commonQuery(request)
    final_post=[]
    global liked
    for post in all_post:
        fop=FilesOnPosts.objects.filter(post=post)
        cop=CommentsOnPost.objects.filter(post=post,liked=False).order_by('-date_commented')
        cop.reverse()
        liked=CommentsOnPost.objects.filter(post=post,liked=True,comm_by=UserModel.objects.get(username=request.user)).order_by('-date_commented')
        no_of_likes=CommentsOnPost.objects.filter(post=post,liked=True).count()
        no_of_comments=CommentsOnPost.objects.filter(post=post,liked=False).count()
        final_post.append([post,fop,cop,liked,no_of_likes,no_of_comments])
    return render(request,"user/homepage.html",{'udata':result[3],"noti_count":result[2],
                                                "total_req":result[0],"all_friends":result[1],
                                                "all_post":final_post,"myFriendsList":result[4]})


for_pwd_email=""
class Forgot_pwd_email(View):
    def post(self,request):
        global for_pwd_email
        email=request.POST.get("email")
        for_pwd_email=email
        try:
            UserModel.objects.get(email=email)
            for_pwd_string = "Your OTP For Reset Password Is : "
            registration_mail(email,for_pwd_string)
            return render(request,"user/u_reset_pwd.html")
        except UserModel.DoesNotExist:
            messages.error(request,"Invalid Email")
            return redirect('u_forgot_pwd')


class Forgot_pwd_validate_otp(View):
    def post(self,request):
        global reg_rand_otp
        otp=request.POST.get("otp")
        pwd=request.POST.get("pass2")
        try:
            if int(otp) == reg_rand_otp:
                um = UserModel.objects.get(email=for_pwd_email)
                um.password = pwd
                us = User.objects.get(username=um.username)
                us.set_password(pwd)
                us.save()
                um.save()
                messages.success(request, "Password Changed Successfully")
                return redirect('notLoggedIn')
            else:
                return render(request, "user/u_reset_pwd.html", {"error": "Invalid OTP"})
        except:
            return render(request,"user/u_reset_pwd.html",{"error":"Invalid OTP"})


@method_decorator(csrf_exempt,name='dispatch')
class Search_Friends(View):
    @method_decorator(login_required(login_url='u_login'))
    def post(self,request):
        global send_res
        srch=request.POST.get("search")
        um=UserModel.objects.only('fname','lname','image').exclude(user_id=request.user.id)
        data=[]
        final_result=[]
        for data1 in um:
            if srch.lower() in data1.fname.lower():
                data.append(data1)
        for data2 in um:
            if srch.lower() in data2.email.lower():
                data.append(data2)
        for data3 in um:
            if srch.lower() in data3.username.lower():
                data.append(data3)
        for data4 in data:
            if data4 not in final_result:
                final_result.append(data4)
        import json
        search_result=[]
        for data5 in final_result:
            search_result.append([data5.username,json.dumps(str(data5.image))])

        if search_result:
            send_res={'result':search_result}
        else:
            send_res = {'result': ''}
        return JsonResponse(send_res,content_type="application/json")


class Search_Friends_detail(View):
    @method_decorator(login_required(login_url='u_login'))
    def get(self,request,un=None):
        global um, frm, already_sent_req, frnds, id_for_unfrnd,common_friends
        common_friends=[]
        frnds=None
        frm=None
        already_sent_req=None
        frnd=request.GET.get("f",un)

        id_for_unfrnd=None
        print(frnd)
        try:
            um=UserModel.objects.get(username=frnd)
            frm=FriendRequestModel.objects.get(request_from=UserModel.objects.get(user=request.user),request_to=um.id)      #getting what i request and to whom i request
        except UserModel.DoesNotExist:
            pass
        except FriendRequestModel.DoesNotExist:
            try:
                already_sent_req=FriendRequestModel.objects.get(request_from=um.id,request_to=UserModel.objects.get(user=request.user),status="Pending")    #if request already sent which is in pending status
            except:pass
        try:
            id_for_unfrnd=FriendRequestModel.objects.get(request_from=um.id,request_to=UserModel.objects.get(user=request.user),status="Accepted")        #if someone req to me and i accepted then , frnds
            frnds="Friends"
        except:
            try:
                id_for_unfrnd=FriendRequestModel.objects.get(request_from=UserModel.objects.get(user=request.user), request_to=um.id,
                                           status="Accepted")           #if i requested to someone and status is acepted then , frnds
                frnds = "Friends"
            except:pass
        result=commonQuery(request)

        if frnds:
            um1=UserModel.objects.filter(username=frnd)
            print("um1 is ",um1)
            common_friends=common_friends_search_friends_details(request,um1[0])
            print("common_friends are ",common_friends)

        # myfrndlist = myFriendsList(request)
        all_post = AllPosts.objects.filter(created_by=UserModel.objects.get(username=frnd),status=True).order_by('-date_created')[:5]
        # result = commonQuery(request)
        final_post = []
        global liked
        for post in all_post:
            fop = FilesOnPosts.objects.filter(post=post)
            cop = CommentsOnPost.objects.filter(post=post, liked=False).order_by('-date_commented')
            cop.reverse()
            liked = CommentsOnPost.objects.filter(post=post, liked=True,
                                                  comm_by=UserModel.objects.get(username=request.user)).order_by(
                '-date_commented')
            no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
            no_of_comments = CommentsOnPost.objects.filter(post=post, liked=False).count()
            final_post.append([post, fop, cop, liked, no_of_likes, no_of_comments])

        return render(request,"user/search_profile.html",{"details":um,"request_sent":frm,"already":already_sent_req,"frnd":frnds,
                                                          "udata":result[3],"noti_count":result[2],"total_req":result[0],
                                                          "id_for_unfrnd":id_for_unfrnd,"common_friends":common_friends,"all_post": final_post})


def common_friends_search_friends_details(request,other_user):
    u_data = UserModel.objects.filter(username=request.user)
    my_friends = FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),
                                                   status="Accepted")
    my_frnds_list = []
    other_frnds_list=[]
    common_frnds_list=[]
    for res in my_friends:
        if res.request_from == u_data[0]:
            my_frnds_list.append(res.request_to)
        else:
            my_frnds_list.append(res.request_from)
    # print(my_frnds_list)

    frm=FriendRequestModel.objects.filter(Q(request_from=other_user)|Q(request_to=other_user),status="Accepted")
    for frnd in frm:
        if frnd.request_from==other_user:
            other_frnds_list.append(frnd.request_to)
        else:
            other_frnds_list.append(frnd.request_from)
    # print("other frnd list is ",other_frnds_list)

    for f in my_frnds_list:
        if f in other_frnds_list:
            common_frnds_list.append(f)
    return common_frnds_list


# @login_required(login_url='u_login')
@method_decorator(csrf_exempt,name='dispatch')
def addfriends(request):
    global mid, fid
    try:
        fid=UserModel.objects.get(user=request.POST.get("fid"))
        mid=UserModel.objects.get(user=request.user)
        try:
            FriendRequestModel.objects.get(request_from=mid,request_to=fid).delete()
            result = {"msg": "del"}
        except:
            FriendRequestModel(request_from=mid, request_to=fid).save()
            save_notification(request,"Friend Request",mid,fid)
            result = {"msg": "ok"}
    except FriendRequestModel.DoesNotExist:
        result = {"msg": "not ok"}
    return JsonResponse(result)


@method_decorator(csrf_exempt,name='dispatch')
def acceptRequest(request):
    global result
    import datetime
    result=None
    reqid=request.POST.get("req_id")
    try:
        FriendRequestModel.objects.filter(idno=reqid).update(status="Accepted",request_accepted_date=datetime.datetime.now())
        frm = FriendRequestModel.objects.get(idno=reqid)
        save_notification(request, "Request Accepted",
                          UserModel.objects.get(user=request.user),
                          UserModel.objects.get(username=frm.request_from.username))
        result={"msg":"ok"}
    except:print("exce")
    return JsonResponse(result,safe=False)

@method_decorator(csrf_exempt,name='dispatch')
def cancelRequest(request):
    global result
    result = None
    reqid = request.POST.get("req_id")
    try:
        frm = FriendRequestModel.objects.get(idno=reqid)
        save_notification(request, "Request Cancelled",
                          UserModel.objects.get(user=request.user),
                          UserModel.objects.get(username=frm.request_from.username))
        FriendRequestModel.objects.filter(idno=reqid).delete()
        result = {"msg": "ok"}
    except:
        print("exce")
    return JsonResponse(result,safe=False)


def notifications_page(request):
    usr_id=[ud.pk for ud in UserModel.objects.all()]
    noti=[]
    for data1 in usr_id:
        try:
            dta=AllNotification.objects.filter(noti_to=data1).exclude(Q(not_type="Request Cancelled") | Q(not_type="Unfriend" ) | Q(not_type="Commented on own post") | Q(not_type="Liked on own") | Q(not_type="Commented on own profile")).order_by('-noti_date')[:10]
            for data2 in dta:
                if data2 not in noti:
                    noti.append(data2)
        except:
            continue
    curr_usr_noti=AllNotification.objects.filter(noti_to=UserModel.objects.get(username=request.user)).exclude(Q(not_type="Request Cancelled") | Q(not_type="Unfriend") | Q(
                    not_type="Liked on own") | Q(not_type="Commented on own profile"))
    result=commonQuery(request)
    return render(request,"user/all_notification.html",{"udata":result[3],"all_noti":noti,"noti_count":result[2],
                                                        "curr_usr_noti":curr_usr_noti,"total_req":result[0],"myFriendsList":result[4]})


def read_noti(request):
    not_id=request.GET.get("idnt")
    allnot=AllNotification.objects.get(idno=not_id)
    if allnot.status=="unread":
        allnot.status = "read"
        allnot.save()
    if allnot.not_type=="Friend Request" or allnot.not_type=="Request Accepted":
        return Search_Friends_detail.as_view()(request,allnot.noti_from.username)


def read_acti(request):
    not_id=request.GET.get("idnt")
    allnot=AllNotification.objects.get(idno=not_id)
    if allnot.status=="unread":
        allnot.status = "read"
        allnot.save()
    if allnot.not_type=="Friend Request" or allnot.not_type=="Request Accepted":
        return Search_Friends_detail.as_view()(request,allnot.noti_to.username)


@method_decorator(csrf_exempt,name='dispatch')
def load_notification(request):
    lst_date = request.POST.get("date")
    final_date=dateutil.parser.parse(lst_date)
    all_noti=AllNotification.objects.filter(noti_to=UserModel.objects.get(username=request.user),noti_date__lt=final_date).exclude(Q(not_type="Request Cancelled") | Q(not_type="Unfriend") | Q(not_type="Commented on own post") | Q(not_type="Liked on own") | Q(not_type="Commented on own profile")).order_by('-noti_date')[:10]
    result=[]
    for data in all_noti:
        try:
            dta = [data.idno, data.not_type,data.notification,str(data.noti_from_id), str(data.noti_to_id), data.status, str(data.noti_date),data.noti_from.image.url,str(data.post_id.post_id)]
            result.append(dta)
        except:
            dta = [data.idno, data.not_type, data.notification, str(data.noti_from_id), str(data.noti_to_id),
                   data.status, str(data.noti_date), data.noti_from.image.url]
            result.append(dta)
    final_rslt={"result":result}
    if not all_noti:
        final_rslt={"result":""}
    return JsonResponse(final_rslt)


def my_profile(request):
    result=commonQuery(request)
    return render(request,"user/my_profile.html",{"udata":result[3],"noti_count":result[2],"total_req":result[0],"total_friends":result[1]})



async def update_profile(request):
    try:
        img = request.FILES.get('profileimg')
        u_data=await sync_to_async(UserModel.objects.get)(username=request.user)
        if img:
            um = u_data
            um.image = img
            um.save()
        global text
        text=""
        if u_data.gender=="Male":
            text=" updated his profile picture on "
        elif u_data.gender=="Female":
            text=" updated her profile picture on "
        else:
            text=" updated profile picture on "
        post=await sync_to_async(AllPosts.objects.create)(description="",created_by=u_data,post_header=text)
        await sync_to_async(FilesOnPosts.objects.create)(post=post,file_data=img)
        loop=asyncio.get_event_loop()
        loop.create_task(save_noti_background(request,post,type="Updated Profile"))
    except:pass
    return my_profile(request)


def friends_tab(request):
    global all_and_common_friends,req_and_common_friends,req_sent_and_common_friends
    all_and_common_friends=[]
    req_and_common_friends=[]
    req_sent_and_common_friends=[]
    u_data = UserModel.objects.filter(username=request.user)
    frnd_req=FriendRequestModel.objects.filter(request_to=u_data[0],status="Pending").order_by('-request_date')[:2]
    for req in frnd_req:
        cf=common_Friends_Accepted(request,req)
        req_and_common_friends.append([req, cf])
    # print("req_and_common_friends is ",req_and_common_friends)

    all_friends=FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),status="Accepted").order_by('-request_accepted_date')[:2]       #here Q and "|" (or operator) is working to find the total friends.
    for res in all_friends:
        cf=common_Friends_Accepted(request,res)
        all_and_common_friends.append([res,cf])

    my_sent_req=FriendRequestModel.objects.filter(request_from=UserModel.objects.get(username=request.user),status="Pending").order_by('-request_date')
    for my_sent in my_sent_req:
        cf=common_Friends_Accepted(request,my_sent)
        req_sent_and_common_friends.append([my_sent,cf])

    print("req_sent_and_common_friends is ", req_sent_and_common_friends)

    result = commonQuery(request)
    return render(request,"user/friends.html",{"udata":result[3],"noti_count":result[2],"frnd_req":req_and_common_friends,"all_friends":all_and_common_friends,
                                               "total_req":result[0],"total_friends":result[1],"my_sent_req":req_sent_and_common_friends[:2],"total_sent":len(my_sent_req),
                                               "myFriendsList":result[4]})


def common_Friends_Accepted(request, data):
    u_data = UserModel.objects.filter(username=request.user)
    my_friends = FriendRequestModel.objects.filter(Q(request_to=u_data[0]) | Q(request_from=u_data[0]),
                                                   status="Accepted")
    my_frnds_list=[]
    for res in my_friends:
        if res.request_from==u_data[0]:
            my_frnds_list.append(res.request_to)
        else:
            my_frnds_list.append(res.request_from)
    # print("My friend list ",my_frnds_list)
    # print("data is ",data)
    other_frndlist=[]
    if data.request_from.id==u_data[0].id:
        # print("if")
        frm = FriendRequestModel.objects.filter(Q(request_from=data.request_to) | Q(request_to=data.request_to),
                                                status="Accepted")
        # print("frm is ",frm)
        for fr in frm:
            if fr.request_from == data.request_to:
                other_frndlist.append(fr.request_to)
            else:
                other_frndlist.append(fr.request_from)
    else:
        # print("else")
        # print(data.request_to.id)
        frm1=FriendRequestModel.objects.filter(Q(request_from=data.request_from)|Q(request_to=data.request_from),status="Accepted")
        # print("Common is ", data.request_from.username)
        # print("frm1 is ",frm1)
        for fr1 in frm1:
            if fr1.request_to == data.request_from:
                # print('inside if')
                other_frndlist.append(fr1.request_from)
            else:
                # print('inside else')
                other_frndlist.append(fr1.request_to)
        # print("other_frndlist ",other_frndlist)
    # print("Other friend list ",other_frndlist)
    common_friends=[]
    for frnd in my_frnds_list:
        if frnd in other_frndlist:
            common_friends.append(frnd)
    # print("Common Friend is ",common_friends )
    return common_friends


@method_decorator(csrf_exempt,name='dispatch')
def unfriend(request):
    global result
    result = None
    idno = request.POST.get("idno")
    try:
        frm = FriendRequestModel.objects.get(idno=idno)
        save_notification(request, "Unfriend",
                          UserModel.objects.get(user=request.user),
                          UserModel.objects.get(username=frm.request_from.username),frm)
        FriendRequestModel.objects.filter(idno=idno).delete()
        result = {"msg": "ok"}
    except:
        print("exce")
    return JsonResponse(result,safe=False)


def mark_all_read(request):
    try:
        AllNotification.objects.filter(noti_to=UserModel.objects.get(username=request.user)).exclude(Q(not_type="Request Cancelled")|Q(not_type="Unfriend")).update(status="read")
    except:
        print("exce")
    return notifications_page(request)
    # pass


@method_decorator(csrf_exempt,name="dispatch")
def load_more_request(request):
    dte=request.POST.get("date")
    u_data = UserModel.objects.filter(username=request.user)
    lst_date=dateutil.parser.parse(dte)
    more_req = FriendRequestModel.objects.filter \
        (Q(request_date__second=lst_date.second)|Q(request_date__minute=lst_date.minute)|Q(request_date__lt=datetime(lst_date.year,lst_date.month,lst_date.day,lst_date.hour,lst_date.minute,lst_date.second)),
         request_to=UserModel.objects.get(username=request.user), status="Pending").order_by('-request_date')[:10]
    result = []
    for data in more_req:
        new_dt=dateutil.parser.parse(datetime.strftime(data.request_date,'%Y-%m-%d %I:%M:%S'))
        if lst_date==new_dt or new_dt>lst_date:
            pass
        else:
            cf = common_Friends_Accepted(request, data)
            global common_frnds
            common_frnds = []
            for un_and_img in cf:
                common_frnds.append([un_and_img.username, un_and_img.image.url])
            if data.request_from == u_data[0]:
                dta = [data.idno, data.request_date, str(data.request_to_id), data.request_to.username,
                       str(data.request_from_id), data.request_to.image.url, common_frnds]
                result.append(dta)
            else:
                dta = [data.idno, data.request_date, str(data.request_from_id), data.request_from.username,
                       str(data.request_to_id), data.request_from.image.url, common_frnds]
                result.append(dta)

    final_rslt = {"result": result}
    if not more_req or not result:
        final_rslt = {"result": ""}
    return JsonResponse(final_rslt)


@method_decorator(csrf_exempt,name="dispatch")
def load_more_friends(request):
    dte=request.POST.get("date")
    u_data = UserModel.objects.filter(username=request.user)
    # print(dte)
    lst_date=dateutil.parser.parse(dte)
    # print(dte)
    # print(lst_date)
    # lst_date2=dateutil.parser.parse(dte) + timedelta(minutes=1)
    more_frnd = FriendRequestModel.objects.filter \
        (Q(request_accepted_date__lte=datetime(lst_date.year,lst_date.month,lst_date.day,lst_date.hour,lst_date.minute,lst_date.second)),
         (Q(request_to=u_data[0])|Q(request_from=u_data[0])), status="Accepted").order_by('-request_accepted_date')[:10]
    result = []
    # print("result early is",result)
    # print("more req ",more_frnd)
    for data in more_frnd:
        new_dt=dateutil.parser.parse(datetime.strftime(data.request_accepted_date,'%Y-%m-%d %I:%M:%S'))

        if lst_date==new_dt or new_dt>lst_date:
            pass
        else:
            cf=common_Friends_Accepted(request,data)
            global common_frnds
            common_frnds=[]
            for un_and_img in cf:
                common_frnds.append([un_and_img.username,un_and_img.image.url])
            if data.request_from==u_data[0]:
                dta = [data.idno, data.request_date, str(data.request_to_id), data.request_to.username,
                       str(data.request_from_id), data.request_to.image.url,common_frnds]
                result.append(dta)
            else:
                dta = [data.idno, data.request_date, str(data.request_from_id), data.request_from.username, str(data.request_to_id), data.request_from.image.url,common_frnds]
                result.append(dta)
    final_rslt = {"result": result}
    if not more_frnd or not result:
        final_rslt = {"result": ""}
    # print(result)
    # print(final_rslt)
    return JsonResponse(final_rslt)


@method_decorator(csrf_exempt,name="dispatch")
def load_more_sent_req(request):
    dte=request.POST.get("date")
    # print(dte)
    u_data = UserModel.objects.filter(username=request.user)
    lst_date=dateutil.parser.parse(dte)
    print(dte)
    print(lst_date)
    # lst_date2=dateutil.parser.parse(dte) + timedelta(minutes=1)
    more_frnd = FriendRequestModel.objects.filter \
        (Q(request_date__second=lst_date.second)|Q(request_date__minute=lst_date.minute)|Q(request_date__lt=datetime(lst_date.year,lst_date.month,lst_date.day,lst_date.hour,lst_date.minute,lst_date.second)),
         request_from=UserModel.objects.get(username=request.user), status="Pending").order_by('-request_date')[:10]
    result = []
    print("result early is",result)
    print("more req ",more_frnd)
    for data in more_frnd:
        new_dt=dateutil.parser.parse(datetime.strftime(data.request_date,'%Y-%m-%d %I:%M:%S'))

        if lst_date==new_dt or new_dt>lst_date:
            pass
        else:
            cf = common_Friends_Accepted(request, data)
            global common_frnds
            common_frnds = []
            for un_and_img in cf:
                common_frnds.append([un_and_img.username, un_and_img.image.url])
            if data.request_from == u_data[0]:
                dta = [data.idno, data.request_date, str(data.request_to_id), data.request_to.username,
                       str(data.request_from_id), data.request_to.image.url, common_frnds]
                result.append(dta)
            else:
                dta = [data.idno, data.request_date, str(data.request_from_id), data.request_from.username,
                       str(data.request_to_id), data.request_from.image.url, common_frnds]
                result.append(dta)
    final_rslt = {"result": result}
    if not more_frnd or not result:
        final_rslt = {"result": ""}
    # print(result)
    # print(final_rslt)
    return JsonResponse(final_rslt)


async def save_noti_background(request,post,type):
    u_data = await sync_to_async(UserModel.objects.filter)(username=request.user)
    my_friends = await sync_to_async(FriendRequestModel.objects.filter)((Q(request_to=u_data[0]) | Q(request_from=u_data[0])),
                                                   status="Accepted")
    print(my_friends)
    print("Hello")
    my_frnds_list = []
    for res in my_friends:
        if res.request_from == u_data[0]:
            my_frnds_list.append(res.request_to)
        else:
            my_frnds_list.append(res.request_from)
    if type=="Post Created":
        for data in my_frnds_list:
            # await asyncio.sleep(1)
            an=await sync_to_async(AllNotification.objects.create)(not_type="Post Created", notification=str(
                request.user) + " created a post. Have a look.",
                                                                my_notification="You created a post.", noti_from=u_data[0], noti_to=data,
                                                                post_id=post)

            payload = {"head": type, "body": str(request.user) + " created a post. Have a look.",
                       "icon": u_data[0].image.url, "url": "/u/view_post/?idnt=" + str(post.post_id) + "&nid=" + str(an.idno)}
            send_user_notification(user=data.user, payload=payload, ttl=1000, )
            print("Saved for" + str(data))

        print('secondary finish')

    elif type=="Updated Profile":
        global word
        if u_data[0].gender == "Male":
            word = "his"
        elif u_data[0].gender == "Female":
            word = "her"
        else:
            word = ""
        for data in my_frnds_list:
            an=await sync_to_async(AllNotification.objects.create)(not_type="Updated Profile", notification=str(
                request.user) + " updated "+word+" profile picture.",
                                                                my_notification="You changed your profile picture.", noti_from=u_data[0], noti_to=data,
                                                                post_id=post)

            payload = {"head": type, "body": str(request.user) + " updated "+word+" profile picture.",
                       "icon": u_data[0].image.url,
                       "url": "/u/view_post/?idnt=" + str(post.post_id) + "&nid=" + str(an.idno)}
            send_user_notification(user=data.user, payload=payload, ttl=1000, )
            print("Saved for" + str(data))



async def createPost(request):
    global content
    content=request.POST.get("post_content")
    if not content:
        content=""
    files_data=request.FILES.getlist('choose-file')
    curr_user=await sync_to_async(UserModel.objects.get)(username=request.user)
    post=await sync_to_async(AllPosts.objects.create)(description=content,created_by=curr_user,post_header=" created a post on ")
    if files_data:
        for file in files_data:
            await sync_to_async(FilesOnPosts.objects.create)(post=post,file_data=file)

    loop = asyncio.get_event_loop()
    loop.create_task(save_noti_background(request,post,type="Post Created"))
    print('main finish')
    return redirect('homepage')


@method_decorator(csrf_exempt,name="dispatch")
def commentOnPost(request):
    post_id=request.POST.get('post_id')
    comment=request.POST.get('comment')
    u_data=UserModel.objects.get(username=request.user)
    try:
        post = AllPosts.objects.get(post_id=post_id)
        cp = CommentsOnPost.objects.create(post=post, description=comment, comm_by=u_data)
        if cp.comm_by == post.created_by:
            if "profile picture" in post.post_header:
                save_notification(request, typ="Commented on own profile", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
            else:
                save_notification(request, typ="Commented on own post", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
        else:
            if "profile picture" in post.post_header:
                save_notification(request, typ="Commented on profile", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
            else:
                save_notification(request, typ="Commented on post", log_usr=u_data, othr_usr=post.created_by, frm_idno=cp)
        cop = CommentsOnPost.objects.filter(post_id=post_id,liked=False).order_by('-date_commented')[:2]
        global result
        result = []
        for comm in cop:
            result.append([comm.comm_by.image.url, comm.comm_by.username, comm.description, comm.date_commented])
        global final_result
        no_of_comments = CommentsOnPost.objects.filter(post=post, liked=False).count()
        if result:
            final_result = {"result": result, 'no_of_comments': no_of_comments}
        else:
            final_result = {"result": "", 'no_of_comments': no_of_comments}
        return JsonResponse(final_result)
    except:
        return redirect('homepage')


def redirect_me(request):
    try:
        u=request.GET.get('u')
        if str(request.user)==u:
            return redirect('my_profile')
        else:
            return Search_Friends_detail.as_view()(request,u)
    except:pass


@method_decorator(csrf_exempt,name="dispatch")
def likeOnPost(request):
    post_id = request.POST.get('post_id')
    post = AllPosts.objects.get(post_id=post_id)
    usr = UserModel.objects.get(username=request.user)
    try:
        CommentsOnPost.objects.get(post=post,comm_by=usr,liked=True).delete()
        try:
            AllNotification.objects.get(noti_from=usr, noti_to=post.created_by, post_id=post).delete()
        except:
            try:
                AllNotification.objects.get(not_type="Liked on own",noti_from=usr, noti_to=post.created_by, post_id=post).delete()
            except:pass
        no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
        result={'no_of_likes':no_of_likes}
        return JsonResponse(result)
    except CommentsOnPost.DoesNotExist:
        cop1=CommentsOnPost.objects.create(post=post, comm_by=usr,liked=True)
        no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
        result = {'no_of_likes': no_of_likes}
        if usr==post.created_by:
            save_notification(request,typ="Liked on own",log_usr=usr,othr_usr=post.created_by,frm_idno=post)
        else:
            save_notification(request,typ="Liked",log_usr=usr,othr_usr=post.created_by,frm_idno=post)
        return JsonResponse(result)


@method_decorator(csrf_exempt,name="dispatch")
def smpl(request):
    dta=request.POST.get('string_data')
    print(dta)


def viewPost(request):
    try:
        post_id=request.GET.get('idnt')
        nid=request.GET.get('nid')
        AllNotification.objects.filter(idno=nid).update(status="read")
        return viewPostr(request,post_id)
    except:
        return redirect('homepage')


def viewPostr(request,post_id=None):
    global post
    pid=request.GET.get('idnt',post_id)
    myfrnds = myFriendsList(request)
    try:
        print('inside try')
        post = AllPosts.objects.filter(Q(created_by__in=myfrnds[0]) | Q(created_by__in=myfrnds[1]),
                                       status=True,post_id=pid)
    except AllPosts.DoesNotExist:
        print('does')
    except: return redirect('homepage')
    if not post:
        return render(request, "user/det_pst.html", {"msg": "Post Deleted"})
    result = commonQuery(request)
    final_post = []
    global liked
    for pst in post:
        fop = FilesOnPosts.objects.filter(post=pst)
        cop = CommentsOnPost.objects.filter(post=pst, liked=False).order_by('-date_commented')
        cop.reverse()
        liked = CommentsOnPost.objects.filter(post=pst, liked=True,
                                              comm_by=UserModel.objects.get(username=request.user)).order_by(
            '-date_commented')
        no_of_likes = CommentsOnPost.objects.filter(post=pst, liked=True).count()
        no_of_comments = CommentsOnPost.objects.filter(post=pst, liked=False).count()
        final_post.append([pst, fop, cop, liked, no_of_likes, no_of_comments])

    return render(request,'user/det_pst.html',{'udata':result[3],"noti_count":result[2],
                                                "total_req":result[0],"all_friends":result[1],
                                                "all_post":final_post})


@method_decorator(csrf_exempt,name="dispatch")
def deletePost(request):
    try:
        post_id=request.POST.get('post_id')
        ap=AllPosts.objects.get(post_id=post_id)
        ap.delete()
        return HttpResponse("ok")
    except:
        return HttpResponse("not ok")


@method_decorator(csrf_exempt,name="dispatch")
def modalPost(request):
    pid=request.POST.get('post_id')
    global final_post,post,result
    final_post=[]
    try:
        post=AllPosts.objects.filter(post_id=pid)
    except:pass
    if post:
        for pst in post:
            fop = FilesOnPosts.objects.filter(post=pst)
            cop = CommentsOnPost.objects.filter(post=pst, liked=False).order_by('-date_commented')
            cop.reverse()
            liked = CommentsOnPost.objects.filter(post=pst, liked=True,
                                                  comm_by=UserModel.objects.get(username=request.user)).order_by(
                '-date_commented')
            no_of_likes = CommentsOnPost.objects.filter(post=pst, liked=True).count()
            no_of_comments = CommentsOnPost.objects.filter(post=pst, liked=False).count()

            pst1=[pst.post_id,pst.description,pst.date_created,pst.created_by.username,pst.created_by.image.url,pst.post_header]
            fop1=[]
            for fle in fop:
                f_data=fle.file_data
                ext=fle.extension()
                fname=fle.getFileName()
                fop1.append([str(f_data),ext,fname])
            cop1=[[comm.comm_by.image.url,comm.comm_by.username,comm.description,comm.date_commented,] for comm in cop ]
            liked1=[]
            if liked:
                liked1.append(True)
            else:
                liked1.append(False)

            all_likes=CommentsOnPost.objects.filter(liked=True,post=post[0]).order_by('-date_commented')
            all_likes1=[]
            for lik in all_likes:
                all_likes1.append([lik.comm_by.username, lik.comm_by.image.url])
            final_post.append([pst1, fop1, liked1, no_of_likes, no_of_comments,all_likes1,cop1])
        result={'result':final_post}
    else:
        result={'result':""}
    return JsonResponse(result)


@method_decorator(csrf_exempt,name="dispatch")
def likeOnModalPost(request):
    post_id = request.POST.get('post_id')
    post = AllPosts.objects.get(post_id=post_id)
    usr = UserModel.objects.get(username=request.user)
    try:
        CommentsOnPost.objects.get(post=post, comm_by=usr, liked=True).delete()
        try:
            AllNotification.objects.get(noti_from=usr, noti_to=post.created_by, post_id=post).delete()
        except:
            try:
                AllNotification.objects.get(not_type="Liked on own", noti_from=usr, noti_to=post.created_by,
                                            post_id=post).delete()
            except:
                pass
        no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
        all_likes1 = CommentsOnPost.objects.filter(post=post, liked=True).order_by('-date_commented')
        all_likes2=[[like.comm_by.image.url, like.comm_by.username] for like in all_likes1]
        result = {'no_of_likes': no_of_likes,'all_likes':all_likes2}
        return JsonResponse(result)
    except:
        cop1 = CommentsOnPost.objects.create(post=post, comm_by=usr, liked=True)
        no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
        all_likes1 = CommentsOnPost.objects.filter(post=post, liked=True).order_by('-date_commented')
        all_likes2 = [[like.comm_by.image.url, like.comm_by.username] for like in all_likes1]
        result = {'no_of_likes': no_of_likes,'all_likes':all_likes2}
        if usr == post.created_by:
            save_notification(request, typ="Liked on own", log_usr=usr, othr_usr=post.created_by, frm_idno=post)
        else:
            save_notification(request, typ="Liked", log_usr=usr, othr_usr=post.created_by, frm_idno=post)
        return JsonResponse(result)


@method_decorator(csrf_exempt,name="dispatch")
def commentOnModalPost(request):
    post_id=request.POST.get('post_id')
    comment=request.POST.get('comment')
    u_data=UserModel.objects.get(username=request.user)
    try:
        post = AllPosts.objects.get(post_id=post_id)
        cp = CommentsOnPost.objects.create(post=post, description=comment, comm_by=u_data)
        if cp.comm_by == post.created_by:
            if "profile picture" in post.post_header:
                save_notification(request, typ="Commented on own profile", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
            else:
                save_notification(request, typ="Commented on own post", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
        else:
            if "profile picture" in post.post_header:
                save_notification(request, typ="Commented on profile", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
            else:
                save_notification(request, typ="Commented on post", log_usr=u_data, othr_usr=post.created_by,
                                  frm_idno=cp)
        cop = CommentsOnPost.objects.filter(post_id=post_id,liked=False).order_by('-date_commented')
        global result
        result = []
        for comm in cop:
            result.append([comm.comm_by.image.url, comm.comm_by.username, comm.description, comm.date_commented])
        global final_result
        no_of_comments = CommentsOnPost.objects.filter(post=post, liked=False).count()
        if result:
            final_result = {"result": result, 'no_of_comments': no_of_comments}
        else:
            final_result = {"result": "", 'no_of_comments': no_of_comments}
        print(final_result)
        return JsonResponse(final_result)
    except:
        return redirect('homepage')


def myposts(request):
    all_post = AllPosts.objects.filter(created_by=UserModel.objects.get(username=request.user),status=True).order_by('-date_created')[:2]
    result = commonQuery(request)
    final_post = []
    global liked
    for post in all_post:
        fop = FilesOnPosts.objects.filter(post=post)
        cop = CommentsOnPost.objects.filter(post=post, liked=False).order_by('-date_commented')
        cop.reverse()
        liked = CommentsOnPost.objects.filter(post=post, liked=True,
                                              comm_by=UserModel.objects.get(username=request.user)).order_by(
            '-date_commented')
        no_of_likes = CommentsOnPost.objects.filter(post=post, liked=True).count()
        no_of_comments = CommentsOnPost.objects.filter(post=post, liked=False).count()
        final_post.append([post, fop, cop, liked, no_of_likes, no_of_comments])
    return render(request, "user/myposts.html", {'udata': result[3], "noti_count": result[2],
                                                  "total_req": result[0], "all_friends": result[1],
                                                  "all_post": final_post,"myFriendsList":result[4]})

@method_decorator(csrf_exempt,name="dispatch")
def checkUsername(request):
    uname=request.POST.get('un')
    um=UserModel.objects.filter(username=uname)
    if um:
        if um.count()==1 and um[0].username==request.user.username:
            result={'msg':True}
            return JsonResponse(result)
        else:
            result = {'msg': False}
            return JsonResponse(result)
    else:
        result={'msg':True}
        return JsonResponse(result)

@method_decorator(csrf_exempt,name="dispatch")
def checkUseremail(request):
    uemail = request.POST.get('ue')
    um = UserModel.objects.filter(email=uemail)
    if um:
        log_user=UserModel.objects.get(username=request.user)
        if um.count() == 1 and um[0].email == log_user.email:
            result = {'msg': True}
            return JsonResponse(result)
        else:
            result = {'msg': False}
            return JsonResponse(result)
    else:
        result = {'msg': True}
        return JsonResponse(result)


def updateDetails(request):
    log_user=UserModel.objects.get(username=request.user)
    try:
        username = request.POST.get("username")
        email = request.POST.get("email")
        fname = request.POST.get("fname")
        lname = request.POST.get("lname")
        work = request.POST.get("working")
        live = request.POST.get("living")
        about = request.POST.get("about")
        um=UserModel.objects.get(username=request.user)
        um.username=username
        um.email=email
        um.fname=fname
        um.lname=lname
        um.working_as=work
        um.lives_in=live
        um.about=about
        um.save()
        absUser=User.objects.get(username=log_user.username)
        absUser.username=request.POST.get("username")
        absUser.save()
        logout(request)
        user = authenticate(request, username=username, password=log_user.password)
        login(request, user)
        return redirect('my_profile')
    except:
        return redirect('homepage')


@method_decorator(csrf_exempt,name="dispatch")
def loadMorePost(request):
    try:
        postType = request.POST.get("postType")
        searchedUser = request.POST.get("searchedUser")
        lastPost = dateutil.parser.parse(request.POST.get("lastPost"))
        myfrndlist = myFriendsList(request)
        global post
        # print(postType)
        # print(type(postType))
        if postType == "0":
            post = AllPosts.objects.filter(Q(created_by__in=myfrndlist[0]) | Q(created_by__in=myfrndlist[1]),
                                           status=True,
                                           date_created__lt=datetime(lastPost.year, lastPost.month, lastPost.day,
                                                                     lastPost.hour, lastPost.minute,
                                                                     lastPost.second)).order_by('-date_created')[:5]
        elif postType=="1":
            post = AllPosts.objects.filter(created_by=UserModel.objects.get(username=request.user), status=True,
                                           date_created__lt=datetime(lastPost.year, lastPost.month, lastPost.day,
                                                                     lastPost.hour, lastPost.minute,
                                                                     lastPost.second)).order_by('-date_created')[:5]
        else:
            post = AllPosts.objects.filter(created_by=UserModel.objects.get(username=searchedUser), status=True,
                                           date_created__lt=datetime(lastPost.year, lastPost.month, lastPost.day,
                                                                     lastPost.hour, lastPost.minute,
                                                                     lastPost.second)).order_by('-date_created')[:5]
        final_post = []
        if post:
            for pst in post:
                fop = FilesOnPosts.objects.filter(post=pst)
                cop = CommentsOnPost.objects.filter(post=pst, liked=False).order_by('-date_commented')[:2]
                cop1 = [[comm.comm_by.image.url, comm.comm_by.username, comm.description, comm.date_commented, ] for
                        comm in
                        cop]
                liked = CommentsOnPost.objects.filter(post=pst, liked=True,
                                                      comm_by=UserModel.objects.get(username=request.user)).order_by(
                    '-date_commented')
                no_of_likes = CommentsOnPost.objects.filter(post=pst, liked=True).count()
                no_of_comments = CommentsOnPost.objects.filter(post=pst, liked=False).count()

                pst1 = [pst.post_id, pst.description, pst.date_created, pst.created_by.username,
                        pst.created_by.image.url,
                        pst.post_header]
                fop1 = []
                for fle in fop:
                    f_data = fle.file_data
                    ext = fle.extension()
                    fname = fle.getFileName()
                    fop1.append([str(f_data), ext, fname])
                liked1 = []
                if liked:
                    liked1.append(True)
                else:
                    liked1.append(False)

                final_post.append([pst1, fop1, liked1, no_of_likes, no_of_comments, cop1])
            result = {'result': final_post}
        else:
            result = {'result': ""}

        print(result)
        return JsonResponse(result)
    except:pass



#Chat View
class ThreadView(View):
    template_name = 'user/chat.html'

    def get_queryset(self):
        return Thread.objects.by_user(self.request.user)

    def get_object(self):
        other_username  = self.kwargs.get("username")
        self.other_user = get_user_model().objects.get(username=other_username)
        obj = Thread.objects.get_or_create_personal_thread(self.request.user, self.other_user)
        if obj == None:
            raise Http404
        return obj

    def get_context_data(self, **kwargs):
        context = {}
        context['me'] = self.request.user
        context['thread'] = self.get_object()
        context['user'] = self.other_user
        context['messages'] = self.get_object().message_set.all()
        return context

    def get(self, request, **kwargs):
        try:
            context = self.get_context_data(**kwargs)

            myfrnd = myFriendsList(request)
            frnd=False
            for frnds in myfrnd[0]:
                if frnds.username==str(context['user']):
                    frnd=True
                    break
                else:
                    continue
            if frnd:pass
            else:
                raise User.DoesNotExist


            result = commonQuery(request)
            frnds_with_last_msg = []
            for data in myfrnd[0]:
                # User.objects.get(username=data.username)
                obj = Thread.objects.get_or_create_personal_thread(request.user,
                                                                   User.objects.get(
                                                                       username=data.username)).message_set.all()
                if obj:
                    frnds_with_last_msg.append([data, obj.last().text, obj.last().sender,obj.last().created_at])
                else:
                    frnds_with_last_msg.append([data, None, None])


            context.__setitem__('myfrnds',frnds_with_last_msg)
            chat_to_me=UserModel.objects.filter(username=str(context['me']))
            chat_to_user=UserModel.objects.get(username=str(context['user']))
            context.__setitem__('chat_to_user',chat_to_user)
            context.__setitem__('chat_to_me',chat_to_me)

            return render(request, self.template_name, context=context)
        except User.DoesNotExist:
            return render(request,"user/error.html")


    def post(self, request, **kwargs):
        self.object = self.get_object()
        thread = self.get_object()
        data = request.POST
        user = request.user
        text = data.get("message")
        Message.objects.create(sender=user, thread=thread, text=text)
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context=context)


def myChats(request):
    myfrnds=myFriendsList(request)
    result = commonQuery(request)


    frnds_with_last_msg=[]
    for data in myfrnds[0]:
        # User.objects.get(username=data.username)
        obj = Thread.objects.get_or_create_personal_thread(request.user,
                                                           User.objects.get(username=data.username)).message_set.all()
        # print(obj.last().text)
        if obj:
            frnds_with_last_msg.append([data,obj.last().text,obj.last().sender,obj.last().created_at])
        else:
            frnds_with_last_msg.append([data,None,None])
    print(frnds_with_last_msg)
    return render(request,"user/mychats.html",{"frnd":frnds_with_last_msg,'udata':result[3],"noti_count":result[2],
                                                "total_req":result[0]})


def myActivity(request):
    noti = []
    new_noti=AllNotification.objects.filter(noti_from=UserModel.objects.get(username=request.user)).exclude(
        Q(not_type="Request Cancelled") | Q(not_type="Unfriend")).order_by('-noti_date')

    sample=[]
    for dt in new_noti:                                         #If post created or updated profile is multiple then take only 1 and remove others
        if dt.not_type=="Post Created":
            if [dt.not_type,dt.post_id] not in sample:
                sample.append([dt.not_type,dt.post_id])
                noti.append(dt)
        elif dt.not_type=="Updated Profile":
            if [dt.not_type, dt.post_id] not in sample:
                sample.append([dt.not_type, dt.post_id])
                noti.append(dt)
        else:
            noti.append(dt)

    curr_usr_noti = AllNotification.objects.filter(noti_from=UserModel.objects.get(username=request.user)).exclude(
        Q(not_type="Request Cancelled") | Q(not_type="Unfriend"))
    result = commonQuery(request)
    return render(request, "user/myactivity.html", {"udata": result[3], "all_noti": noti[:10], "noti_count": result[2],
                                                          "curr_usr_noti": curr_usr_noti, "total_req": result[0],
                                                          "myFriendsList": result[4]})

@method_decorator(csrf_exempt,name='dispatch')
def load_activity(request):
    lst_date = request.POST.get("date")
    final_date=dateutil.parser.parse(lst_date)
    all_noti=AllNotification.objects.filter(noti_from=UserModel.objects.get(username=request.user),noti_date__lt=final_date).exclude(Q(not_type="Request Cancelled") | Q(not_type="Unfriend")).order_by('-noti_date')
    result=[]
    sample=[]
    global dta
    for data in all_noti:
        if data.post_id is not None:
            dta = [data.idno, data.not_type, data.my_notification, str(data.noti_from_id), str(data.noti_to_id),
               data.status, str(data.noti_date), data.noti_from.image.url,data.post_id.post_id]
        else:
            dta = [data.idno, data.not_type, data.my_notification, str(data.noti_from_id), str(data.noti_to_id),
                   data.status, str(data.noti_date), data.noti_from.image.url]

        if data.not_type=="Post Created":
            if [data.not_type,data.post_id] not in sample:
                sample.append([data.not_type,data.post_id])
                result.append(dta)
        elif data.not_type=="Updated Profile":
            if [data.not_type, data.post_id] not in sample:
                sample.append([data.not_type, data.post_id])
                result.append(dta)
        else:
            result.append(dta)

    final_rslt={"result":result}
    if not all_noti:
        final_rslt={"result":""}
    return JsonResponse(final_rslt)


def photosTab(request):
    imgList=['.jpg' , '.jpeg' , '.png' , '.gif' ,'.webp', '.tiff', '.psd' , '.bmp' ,'.svg','.eps' ,'.tif']
    vdoList=['.webm' , '.mkv' , '.flv' , '.ogg' ,'.avi' ,'.mov' ,'.mp4' ,'.mpg' ,'.mpeg','.3gp' ]
    allpost=AllPosts.objects.filter(created_by=UserModel.objects.get(username=request.user),status=True).order_by('-date_created')
    resultFOP=[]
    for post in allpost:
        fop1=FilesOnPosts.objects.filter(post=post).order_by('-date_created')
        tempFiles=[]
        for files in fop1:
            if files.extension() in imgList or files.extension() in vdoList:
                tempFiles.append(files)
        resultFOP.append([post,[tempFiles]])
        tempFiles=[]
    result = commonQuery(request)

    return render(request,"user/myphotos.html",{"result":resultFOP,'udata':result[3],"noti_count":result[2],
                                                "total_req":result[0],"all_friends":result[1]})
