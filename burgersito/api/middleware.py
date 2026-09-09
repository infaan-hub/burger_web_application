from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from urllib.parse import parse_qs


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])
        user = AnonymousUser()

        if token_list:
            try:
                token = token_list[0]
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                user = await get_user(user_id)
            except Exception:
                user = AnonymousUser()

        scope['user'] = user
        return await super().__call__(scope, receive, send)
