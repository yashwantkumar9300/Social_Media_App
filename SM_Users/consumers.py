from channels.consumer import SyncConsumer,AsyncConsumer
from django.contrib.auth.models import User
import json

from django.db.models import Q

from SM_Users.models import Thread, Message, UserModel, AllNotification,AllPosts,FriendRequestModel,CommentsOnPost
from channels.db import database_sync_to_async
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync,sync_to_async


class ChatConsumer(AsyncConsumer):
    async def websocket_connect(self,event):
        me=self.scope['user']
        other_username=self.scope['url_route']['kwargs']['username']
        other_user=await sync_to_async(User.objects.get)(username=other_username)
        self.thread_obj=await sync_to_async(Thread.objects.get_or_create_personal_thread)(me,other_user)
        self.room_name=f'personal_thread_{self.thread_obj.id}'

        await self.channel_layer.group_add(self.room_name,self.channel_name)
        await self.send({
            'type': 'websocket.accept'
        })
        print(f'[{self.channel_name}] - You are connected')


    async def websocket_receive(self,event):
        print(f'[{self.channel_name}] - Received message - {event["text"]}')
        msg=json.dumps({'text':event.get('text'),'username':self.scope['user'].username})
        await self.store_message(event.get('text'))
        await self.channel_layer.group_send(self.room_name,{
            'type':'websocket.message','text':msg})

    async def websocket_message(self,event):
        print(f'[{self.channel_name}] - Message Sent - {event["text"]}')

        data=json.loads(event['text'])
        deliver_to=await sync_to_async(UserModel.objects.get)(username=str(data['username']))
        profile_img=json.dumps(deliver_to.image.url)
        result=json.dumps({'text':data['text'],'username':data['username'],'pro':profile_img})

        await self.send({
            'type':'websocket.send','text':result
        })

    async def websocket_disconnect(self,event):
        print(f'[{self.channel_name}] - Disconnected')
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    @database_sync_to_async
    def store_message(self,text):
        Message.objects.create(thread=self.thread_obj,sender=self.scope['user'],text=text)

def checkForUpdate(username):
    u_data=UserModel.objects.filter(username=username)
    frm=len(FriendRequestModel.objects.filter(request_to=u_data[0],status="Pending"))
    noti_count = len(
        AllNotification.objects.filter(noti_to=UserModel.objects.get(username=username), status="unread").exclude(
            Q(not_type="Request Cancelled") | Q(not_type="Unfriend") | Q(not_type="Commented on own post") | Q(not_type="Liked on own") | Q(not_type="Commented on own profile")))

    json_data=json.dumps({'frnd_request':frm,"noti_count":noti_count})
    return json_data
    # return frm,noti_count,u_data

global sendData,sendData2
sendData=[]    #for friend request
sendData2=[]    # for post created
sendData3=[]    # for like and comments



@receiver(post_save,sender=FriendRequestModel)
def notifyFriendRequest(sender,instance,created,**kwargs):
    if created:
        global sendData
        sendData=[]
        sendData.append(instance.request_to)
        print("friend request model created")

@receiver(post_save,sender=AllPosts)
def notifyPostCreated(sender,instance,created,**kwargs):
    if created:
        global sendData2
        sendData2=[]
        sendData2.append(instance.created_by)
        print("Allpost model created")


@receiver(post_save,sender=CommentsOnPost)
def notifyLikeComments(sender,instance,created,**kwargs):
    if created:
        global sendData3
        sendData3=[]
        sendData3.append([instance.post.created_by])
        print("Like/Comment model created")
        # sample()



class EchoConsumer(SyncConsumer):
    def websocket_connect(self,event):
        self.room_name='broadcast'
        self.send({
            'type':'websocket.accept'
        })
        print(f'[{self.channel_name}] - You are connected')


    def websocket_receive(self,event):
        global sendData,sendData2,sendData3
        print(f'[{self.channel_name}] - Received message - {event["text"]}')
        async_to_sync(self.channel_layer.group_send)(self.room_name,{
            'type':'websocket.message','text':event.get('text')})

        um=UserModel.objects.get(username=event["text"])
        if um in sendData:
            data=checkForUpdate(event["text"])
            self.send({
                    'type': 'websocket.send', 'text': data
                })
            sendData=[]
        else:
            pass

        my_friends = FriendRequestModel.objects.filter(Q(request_to=um) | Q(request_from=um),
                                                       status="Accepted").order_by('-request_accepted_date')


        my_frnds_list = []
        for res in my_friends:
            if res.request_from == um:
                my_frnds_list.append(res.request_to)
            else:
                my_frnds_list.append(res.request_from)

        try:
            if sendData2[0] in my_frnds_list:
                data = checkForUpdate(event["text"])
                self.send({
                    'type': 'websocket.send', 'text': data
                })
        except IndexError:
            pass


        try:
            if (sendData3[0][0] == um):
                print('if')
                data = checkForUpdate(event["text"])
                self.send({
                    'type': 'websocket.send', 'text': data
                })
        except IndexError:
            pass


    def websocket_message(self,event):
        print(f'[{self.channel_name}] - Message Sent - {event["text"]}')


    def websocket_disconnect(self,event):
        print(f'[{self.channel_name}] - Disconnected')
        async_to_sync(self.channel_layer.group_add)(self.room_name, self.channel_name)
