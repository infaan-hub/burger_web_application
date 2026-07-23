from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import MenuItem, Ingredient, ContactMessage, Order, PasswordResetToken
from .serializers import (
    MenuItemSerializer,
    IngredientSerializer,
    ContactMessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    OrderSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


# ─── Menu ───

@api_view(['GET'])
def menu_list(request):
    items = MenuItem.objects.all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def foods_list(request):
    items = MenuItem.objects.filter(category='food')
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def drinks_list(request):
    items = MenuItem.objects.filter(category='drink')
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def menu_item_detail(request, item_id):
    try:
        item = MenuItem.objects.get(id=item_id)
    except MenuItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    serializer = MenuItemSerializer(item)
    return Response(serializer.data)


# ─── Ingredients ───

@api_view(['GET'])
def ingredient_list(request):
    ingredients = Ingredient.objects.all()
    serializer = IngredientSerializer(ingredients, many=True)
    return Response(serializer.data)


# ─── Contact ───

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_submit(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Message sent successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAdminUser])
def contact_messages(request):
    if request.method == 'GET':
        messages = ContactMessage.objects.all()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)

    msg_id = request.query_params.get('id')
    if not msg_id:
        return Response({'error': 'Message id required'}, status=400)
    try:
        msg = ContactMessage.objects.get(id=msg_id)
        msg.delete()
        return Response({'message': 'Message deleted'})
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=404)


# ─── Auth ───

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'user': {'id': user.id, 'username': user.username},
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is not None:
        tokens = get_tokens_for_user(user)
        prof = getattr(user, 'profile', None)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar_url': prof.avatar_url if prof else '',
                'display_name': prof.display_name if prof else '',
                'is_staff': user.is_staff,
            },
            'tokens': tokens,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    prof = getattr(request.user, 'profile', None)
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'avatar_url': prof.avatar_url if prof else '',
        'display_name': prof.display_name if prof else '',
        'is_staff': request.user.is_staff,
    })


# ─── Profile / Settings ───

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    prof = getattr(request.user, 'profile', None)
    if not prof:
        from .models import UserProfile
        prof = UserProfile.objects.create(user=request.user, display_name=request.user.username)

    if request.method == 'GET':
        serializer = UserProfileSerializer(prof)
        return Response(serializer.data)

    serializer = UserProfileSerializer(prof, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # update email on user
        if 'email' in request.data:
            request.user.email = request.data['email']
            request.user.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        tokens = get_tokens_for_user(request.user)
        return Response({'message': 'Password changed successfully', 'tokens': tokens})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Password Reset ───

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.get(username=serializer.validated_data['username'])
        PasswordResetToken.objects.filter(user=user).delete()
        reset_token = PasswordResetToken.objects.create(user=user)
        return Response({
            'message': 'Reset token generated',
            'token': reset_token.token,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.get(username=serializer.validated_data['username'])
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        PasswordResetToken.objects.filter(user=user).delete()
        return Response({'message': 'Password reset successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Admin ───

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is not None and user.is_staff:
        tokens = get_tokens_for_user(user)
        prof = getattr(user, 'profile', None)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar_url': prof.avatar_url if prof else '',
                'display_name': prof.display_name if prof else '',
                'is_staff': user.is_staff,
            },
            'tokens': tokens,
        })
    return Response({'error': 'Invalid admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    total_users = User.objects.count()
    total_menu_items = MenuItem.objects.count()
    total_messages = ContactMessage.objects.count()
    total_orders = Order.objects.count()
    recent_messages = ContactMessage.objects.all()[:5]
    return Response({
        'stats': {
            'total_users': total_users,
            'total_menu_items': total_menu_items,
            'total_messages': total_messages,
            'total_orders': total_orders,
        },
        'recent_messages': ContactMessageSerializer(recent_messages, many=True).data,
    })


def _clean_menu_data(data):
    cleaned = data.copy()
    for key in ('price', 'calories', 'price_tsh'):
        val = cleaned.get(key)
        if val is None or val == '' or (isinstance(val, float) and (val != val)):
            cleaned[key] = 0
    return cleaned


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_food(request):
    try:
        raw = request.data
    except Exception as e:
        return Response({'error': f'Request parse error: {e}'}, status=status.HTTP_400_BAD_REQUEST)
    data = _clean_menu_data(raw if isinstance(raw, dict) else {})
    data['category'] = 'food'
    serializer = MenuItemSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_drink(request):
    try:
        raw = request.data
    except Exception as e:
        return Response({'error': f'Request parse error: {e}'}, status=status.HTTP_400_BAD_REQUEST)
    data = _clean_menu_data(raw if isinstance(raw, dict) else {})
    data['category'] = 'drink'
    serializer = MenuItemSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Admin Menu Items (edit/delete) ───

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_menu_items(request):
    items = MenuItem.objects.all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_menu_item_detail(request, item_id):
    try:
        item = MenuItem.objects.get(id=item_id)
    except MenuItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MenuItemSerializer(item)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = MenuItemSerializer(item, data=_clean_menu_data(request.data), partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        item.delete()
        return Response({'message': 'Item deleted'}, status=status.HTTP_204_NO_CONTENT)


# ─── Admin Users ───

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    users = User.objects.all().order_by('username')
    data = []
    for u in users:
        prof = getattr(u, 'profile', None)
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_staff': u.is_staff,
            'is_active': u.is_active,
            'display_name': prof.display_name if prof else '',
            'avatar_url': prof.avatar_url if prof else '',
        })
    return Response(data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if request.method == 'GET':
        prof = getattr(u, 'profile', None)
        return Response({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_staff': u.is_staff,
            'is_active': u.is_active,
            'display_name': prof.display_name if prof else '',
            'avatar_url': prof.avatar_url if prof else '',
        })

    if request.method == 'PUT':
        u.is_active = request.data.get('is_active', u.is_active)
        u.is_staff = request.data.get('is_staff', u.is_staff)
        u.save()
        return Response({'message': 'User updated'})

    if request.method == 'DELETE':
        if u == request.user:
            return Response({'error': 'Cannot delete yourself'}, status=400)
        u.delete()
        return Response({'message': 'User deleted'})


# ─── Image Upload ───

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_image(request):
    file = request.FILES.get('image')
    if not file:
        return Response({'error': 'No image provided'}, status=400)

    import uuid, os
    ext = os.path.splitext(file.name)[1] or '.jpg'
    filename = f'{uuid.uuid4()}{ext}'
    from django.conf import settings
    upload_dir = settings.MEDIA_ROOT / 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    path = upload_dir / filename

    with open(path, 'wb') as f:
        for chunk in file.chunks():
            f.write(chunk)

    url = request.build_absolute_uri(f'{settings.MEDIA_URL}uploads/{filename}')
    return Response({'url': url})


# ─── Orders ───

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        order = serializer.save(user=request.user)
        out = OrderSerializer(order)
        return Response(out.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_orders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    if request.method == 'PATCH':
        status_val = request.data.get('status')
        if status_val:
            valid = [c[0] for c in Order._meta.get_field('status').choices]
            if status_val not in valid:
                return Response({'error': f'Invalid status. Must be one of: {", ".join(valid)}'}, status=400)
            order.status = status_val
            order.save()
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        return Response({'error': 'No status provided'}, status=400)

    if request.method == 'DELETE':
        order.delete()
        return Response({'message': 'Order deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status in ('cancelled', 'order_complete', 'delivered'):
        return Response({'error': f'Cannot cancel order with status: {order.status}'}, status=400)

    order.status = 'cancelled'
    order.save()
    serializer = OrderSerializer(order)
    return Response(serializer.data)
