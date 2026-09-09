import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class EventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())
        self.group_name = None

        if self.user and not isinstance(self.user, AnonymousUser):
            if self.user.is_staff:
                self.group_name = 'admin_events'
            else:
                self.group_name = f'user_{self.user.id}'

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.channel_layer.group_add('global_events', self.channel_name)
            await self.accept()
            await self.send(text_data=json.dumps({
                'type': 'CONNECTION_ESTABLISHED',
                'data': {'message': 'Connected to real-time events'}
            }))
            logger.info(f'[WebSocket] Connected: user={self.user.username}')
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.channel_layer.group_discard('global_events', self.channel_name)
        if self.user and not isinstance(self.user, AnonymousUser):
            logger.info(f'[WebSocket] Disconnected: user={self.user.username}')

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type', '')
            if msg_type == 'PING':
                await self.send(text_data=json.dumps({'type': 'PONG'}))
        except json.JSONDecodeError:
            pass

    # ─── Group message handlers ───
    async def new_order(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def order_status_changed(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def order_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def new_user(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def user_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def user_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def menu_item_added(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def menu_item_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def menu_item_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def contact_message(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def dashboard_stats(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))

    async def system_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['data']
        }))
