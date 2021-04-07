from channels.routing import ProtocolTypeRouter,URLRouter
from django.urls import path
from SM_Users.consumers import EchoConsumer,ChatConsumer
from channels.auth import AuthMiddlewareStack

application=ProtocolTypeRouter({
    'websocket':AuthMiddlewareStack(URLRouter([
        path('ws/u/chat/<str:username>/',ChatConsumer.as_asgi()),
        path('ws/connect/',EchoConsumer.as_asgi())
    ])
    )
})
