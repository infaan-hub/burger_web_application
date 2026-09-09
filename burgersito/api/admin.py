from django.contrib import admin
from .models import MenuItem, Ingredient, ContactMessage, PushSubscription, Notification

admin.site.register(MenuItem)
admin.site.register(Ingredient)
admin.site.register(ContactMessage)
admin.site.register(PushSubscription)
admin.site.register(Notification)
