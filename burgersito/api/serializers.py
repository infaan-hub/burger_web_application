from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import MenuItem, Ingredient, ContactMessage, Order, OrderItem, UserProfile, PasswordResetToken


class MenuItemSerializer(serializers.ModelSerializer):
    image_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = MenuItem
        fields = '__all__'


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, display_name=user.username)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class OrderItemSerializer(serializers.ModelSerializer):
    item_title = serializers.CharField(source='item.title', read_only=True)
    item_image = serializers.URLField(source='item.image_url', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_title', 'item_image', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.ListField(write_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total', 'status', 'delivery_address', 'delivery_lat', 'delivery_lng', 'phone', 'notes', 'created_at', 'order_items', 'items_data', 'username']
        read_only_fields = ['id', 'total', 'status', 'created_at']

    def validate_items_data(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required')
        for entry in value:
            if 'item_id' not in entry or 'quantity' not in entry:
                raise serializers.ValidationError('Each item must have item_id and quantity')
            if not MenuItem.objects.filter(id=entry['item_id']).exists():
                raise serializers.ValidationError(f"Item with id {entry['item_id']} does not exist")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items_data')
        user = validated_data.pop('user', None)
        total = 0
        order = Order.objects.create(user=user, **validated_data)
        for entry in items_data:
            item = MenuItem.objects.get(id=entry['item_id'])
            price = float(item.price) * entry['quantity']
            total += price
            OrderItem.objects.create(order=order, item=item, quantity=entry['quantity'], price=price)
        order.total = total
        order.save()
        return order


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=False, required=False)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'avatar_url', 'display_name', 'phone', 'address']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if 'email' in user_data:
            instance.user.email = user_data['email']
            instance.user.save()
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError('User not found')
        return value


class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(username=data['username'])
            reset_token = PasswordResetToken.objects.get(user=user, token=data['token'])
            if not reset_token.is_valid():
                raise serializers.ValidationError('Token has expired')
        except (User.DoesNotExist, PasswordResetToken.DoesNotExist):
            raise serializers.ValidationError('Invalid token or username')
        return data
