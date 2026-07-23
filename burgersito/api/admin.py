from django.contrib import admin
from .models import MenuItem, Ingredient, ContactMessage

admin.site.register(MenuItem)
admin.site.register(Ingredient)
admin.site.register(ContactMessage)
