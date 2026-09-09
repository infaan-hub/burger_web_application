import logging
import uuid
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


def _get_channel_layer():
    try:
        return get_channel_layer()
    except Exception:
        logger.warning('[Events] Channel layer not available')
        return None


def _send_to_group(group, event_type, data, handler='system_notification'):
    layer = _get_channel_layer()
    if not layer:
        return
    try:
        data_with_id = {**data, 'event_id': str(uuid.uuid4())}
        async_to_sync(layer.group_send)(
            group,
            {
                'type': handler,
                'event_type': event_type,
                'data': data_with_id,
            }
        )
    except Exception as e:
        logger.error(f'[Events] Failed to send to group {group}: {e}')


def _persist_notification(user, title, message, notif_type='system', link=''):
    try:
        from .models import Notification
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notif_type,
            link=link,
        )
    except Exception as e:
        logger.error(f'[Events] Failed to persist notification: {e}')


def _send_push(user, title, body, url=''):
    try:
        from .push import send_push_to_user
        send_push_to_user(user, title, body, url)
    except Exception as e:
        logger.error(f'[Events] Push failed for {user.username}: {e}')


def emit_new_order(order, user):
    logger.info(f'[Events] NEW_ORDER: #{order.id} by {user.username}')
    _send_to_group('admin_events', 'NEW_ORDER', {
        'order_id': order.id,
        'user_id': user.id,
        'username': user.username,
        'status': order.status,
        'total': str(order.total),
        'delivery_address': order.delivery_address or '',
        'phone': order.phone or '',
        'created_at': order.created_at.isoformat() if order.created_at else '',
    }, handler='new_order')

    from django.contrib.auth.models import User
    admins = User.objects.filter(is_staff=True, is_active=True)
    for admin in admins:
        _persist_notification(admin, 'New Order', f'Order #{order.id} by {user.username}', 'order_update', f'/admin/orders')
        _send_push(admin, 'New Order', f'Order #{order.id} by {user.username}', '/admin/orders')


def emit_order_status_changed(order):
    logger.info(f'[Events] ORDER_STATUS_CHANGED: #{order.id} -> {order.status}')
    _send_to_group('admin_events', 'ORDER_STATUS_CHANGED', {
        'order_id': order.id,
        'username': order.user.username,
        'user_id': order.user_id,
        'status': order.status,
        'total': str(order.total),
    }, handler='order_status_changed')
    _send_to_group(f'user_{order.user_id}', 'ORDER_STATUS_CHANGED', {
        'order_id': order.id,
        'status': order.status,
        'total': str(order.total),
    }, handler='order_status_changed')

    status_messages = {
        'confirmed': 'Your order has been confirmed!',
        'preparing': 'Your order is being prepared.',
        'ready': 'Your order is ready for pickup!',
        'delivered': 'Your order has been delivered.',
        'cancelled': 'Your order has been cancelled.',
        'order_complete': 'Your order is complete.',
    }
    msg = status_messages.get(order.status, f'Order status: {order.status}')
    _persist_notification(order.user, f'Order #{order.id} Update', msg, 'order_update', f'/order')
    _send_push(order.user, f'Order #{order.id} - {order.status.title()}', msg, '/order')


def emit_order_deleted(order):
    logger.info(f'[Events] ORDER_DELETED: #{order.id}')
    _send_to_group('admin_events', 'ORDER_DELETED', {
        'order_id': order.id,
        'user_id': order.user_id,
    }, handler='order_deleted')
    _send_to_group(f'user_{order.user_id}', 'ORDER_DELETED', {
        'order_id': order.id,
    }, handler='order_deleted')


def emit_new_user(user):
    logger.info(f'[Events] NEW_USER: {user.username}')
    _send_to_group('admin_events', 'NEW_USER', {
        'user_id': user.id,
        'username': user.username,
    }, handler='new_user')

    from django.contrib.auth.models import User
    admins = User.objects.filter(is_staff=True, is_active=True)
    for admin in admins:
        _persist_notification(admin, 'New User', f'{user.username} has registered', 'system', '/admin/users')
        _send_push(admin, 'New User', f'{user.username} has registered', '/admin/users')


def emit_user_updated(user):
    logger.info(f'[Events] USER_UPDATED: {user.username}')
    _send_to_group('admin_events', 'USER_UPDATED', {
        'user_id': user.id,
        'username': user.username,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
    }, handler='user_updated')


def emit_user_deleted(user_id):
    logger.info(f'[Events] USER_DELETED: id={user_id}')
    _send_to_group('admin_events', 'USER_DELETED', {
        'user_id': user_id,
    }, handler='user_deleted')


def emit_menu_item_added(item):
    logger.info(f'[Events] MENU_ITEM_ADDED: {item.title}')
    _send_to_group('global_events', 'MENU_ITEM_ADDED', {
        'item_id': item.id,
        'title': item.title,
        'category': item.category,
        'price': str(item.price),
        'price_tsh': str(item.price_tsh),
        'calories': item.calories,
        'image_url': item.image_url or '',
        'description': item.description,
    }, handler='menu_item_added')


def emit_menu_item_updated(item):
    logger.info(f'[Events] MENU_ITEM_UPDATED: {item.title}')
    _send_to_group('global_events', 'MENU_ITEM_UPDATED', {
        'item_id': item.id,
        'title': item.title,
        'category': item.category,
        'price': str(item.price),
        'price_tsh': str(item.price_tsh),
        'calories': item.calories,
        'image_url': item.image_url or '',
        'description': item.description,
    }, handler='menu_item_updated')


def emit_menu_item_deleted(item_id):
    logger.info(f'[Events] MENU_ITEM_DELETED: id={item_id}')
    _send_to_group('global_events', 'MENU_ITEM_DELETED', {
        'item_id': item_id,
    }, handler='menu_item_deleted')


def emit_contact_message(message):
    logger.info(f'[Events] CONTACT_MESSAGE: from {message.name}')
    _send_to_group('admin_events', 'CONTACT_MESSAGE', {
        'message_id': message.id,
        'name': message.name,
        'email': message.email,
        'message': message.message,
        'created_at': message.created_at.isoformat() if message.created_at else '',
    }, handler='contact_message')

    from django.contrib.auth.models import User
    admins = User.objects.filter(is_staff=True, is_active=True)
    for admin in admins:
        _persist_notification(admin, 'New Message', f'From {message.name}: {message.message[:80]}', 'system', '/admin/messages')
        _send_push(admin, 'New Message', f'From {message.name}', '/admin/messages')


def emit_dashboard_stats(stats):
    _send_to_group('admin_events', 'DASHBOARD_STATS', stats, handler='dashboard_stats')


def emit_system_notification(group, title, message):
    _send_to_group(group, 'SYSTEM_NOTIFICATION', {
        'title': title,
        'message': message,
    })
