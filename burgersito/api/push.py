import json
import logging
from django.conf import settings
from pywebpush import webpush, WebPushException

logger = logging.getLogger(__name__)


def _get_vapid_private_key():
    key = getattr(settings, 'VAPID_PRIVATE_KEY', '')
    if not key:
        return None
    return key


def _get_vapid_claims():
    return {'sub': getattr(settings, 'VAPID_CLAIM_EMAIL', 'mailto:admin@burgersupreme.com')}


def send_push_notification(subscription_info, title, body, url=''):
    private_key = _get_vapid_private_key()
    if not private_key:
        logger.warning('[Push] VAPID private key not configured')
        return False

    payload = {
        'title': title,
        'body': body,
        'url': url,
        'icon': '/favicon.svg',
        'badge': '/favicon.svg',
    }

    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=private_key,
            vapid_claims=_get_vapid_claims(),
        )
        logger.info(f'[Push] Notification sent: {title}')
        return True
    except WebPushException as e:
        status_code = getattr(e, 'response', None)
        if status_code is not None:
            status_code = getattr(status_code, 'status_code', None)
        if status_code == 404 or status_code == 410:
            logger.info(f'[Push] Invalid subscription (status={status_code}), removing')
            return 'INVALID'
        logger.error(f'[Push] Send failed: {e}')
        return False


def send_push_to_user(user, title, body, url=''):
    from .models import PushSubscription
    subs = PushSubscription.objects.filter(user=user, active=True)
    removed = 0
    sent = 0
    for sub in subs:
        sub_info = {
            'endpoint': sub.endpoint,
            'keys': {
                'p256dh': sub.p256dh,
                'auth': sub.auth,
            },
        }
        result = send_push_notification(sub_info, title, body, url)
        if result == 'INVALID':
            sub.active = False
            sub.save(update_fields=['active', 'updated_at'])
            removed += 1
        elif result:
            sent += 1
    if removed:
        logger.info(f'[Push] Removed {removed} invalid subscriptions for user {user.username}')
    return sent


def send_push_to_admins(title, body, url=''):
    from django.contrib.auth.models import User
    admins = User.objects.filter(is_staff=True, is_active=True)
    total_sent = 0
    for admin in admins:
        total_sent += send_push_to_user(admin, title, body, url)
    return total_sent
