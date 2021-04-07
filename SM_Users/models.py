
import os

from django.db import models
from django.contrib.auth.models import User


class UserModel(models.Model):
    fname=models.CharField(max_length=200)
    lname=models.CharField(max_length=200)
    email=models.CharField(max_length=80,unique=True)
    username=models.CharField(max_length=20,unique=True)
    password = models.CharField(max_length=100)
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    status=models.CharField(max_length=20,default="Active")
    date_registered=models.DateTimeField(auto_now_add=True)
    image=models.ImageField(upload_to="user_profile_image/")
    working_as=models.CharField(max_length=500,default="")
    lives_in=models.CharField(max_length=500,default="")
    about=models.CharField(max_length=500,default="")


class AllPosts(models.Model):
    post_id=models.AutoField(primary_key=True)
    description=models.CharField(max_length=100000)
    date_created=models.DateTimeField(auto_now_add=True)
    created_by=models.ForeignKey(UserModel,on_delete=models.CASCADE)
    status=models.BooleanField(default=True)
    post_header=models.CharField(max_length=500,default="")

class AllNotification(models.Model):
    idno=models.AutoField(primary_key=True)
    not_type=models.CharField(max_length=200)
    notification=models.CharField(max_length=2000)
    my_notification=models.CharField(max_length=2000)
    noti_from=models.ForeignKey(UserModel,on_delete=models.CASCADE,related_name='no_from')
    noti_to=models.ForeignKey(UserModel,on_delete=models.CASCADE,related_name='no_to')
    status=models.CharField(max_length=20,default="unread")
    noti_date=models.DateTimeField(auto_now_add=True)
    post_id=models.ForeignKey(AllPosts,on_delete=models.CASCADE,blank=True, null=True)


class FriendRequestModel(models.Model):
    idno=models.AutoField(primary_key=True)
    request_from=models.ForeignKey(UserModel,on_delete=models.CASCADE,related_name='req_from')
    request_to=models.ForeignKey(UserModel,on_delete=models.CASCADE,related_name='req_to')
    request_date=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=30,default="Pending")
    request_accepted_date=models.DateTimeField(auto_now_add=True)

#Posts---------------------------------------------------------------------------------------------------


class CommentsOnPost(models.Model):
    comm_id=models.AutoField(primary_key=True)
    post=models.ForeignKey(AllPosts,on_delete=models.CASCADE)
    description=models.CharField(max_length=10000,blank=True)
    date_commented=models.DateTimeField(auto_now_add=True)
    comm_by=models.ForeignKey(UserModel,on_delete=models.CASCADE)
    image=models.ImageField(upload_to="%m-%d-%y",blank=True)
    liked=models.BooleanField(default=False)

class FilesOnPosts(models.Model):
    f_id=models.AutoField(primary_key=True)
    post=models.ForeignKey(AllPosts,on_delete=models.CASCADE)
    file_data=models.FileField(upload_to="%d-%m-%y",blank=True)
    date_created=models.DateTimeField(auto_now_add=True)

    def extension(self):
        name, extension = os.path.splitext(self.file_data.name)
        return extension
    def getFileName(self):
        name, extension = os.path.splitext(self.file_data.name)
        fname=name.split('/')
        return fname[-1]+extension


##########################   chat models    ####################################

from SM_Users.managers import ThreadManager
class TrackingModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Thread(TrackingModel):
    THREAD_TYPE = (
        ('personal', 'Personal'),
        ('group', 'Group')
    )

    name = models.CharField(max_length=50, null=True, blank=True)
    thread_type = models.CharField(max_length=15, choices=THREAD_TYPE, default='group')
    users = models.ManyToManyField('auth.User')

    objects = ThreadManager()

    def __str__(self) -> str:
        if self.thread_type == 'personal' and self.users.count() == 2:
            return f'{self.users.first()} and {self.users.last()}'
        return f'{self.name}'

class Message(TrackingModel):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    sender = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    text = models.TextField(blank=False, null=False)

    def __str__(self) -> str:
        return f'From <Thread - {self.thread}>'

