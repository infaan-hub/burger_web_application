from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import MenuItem, Ingredient


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **kwargs):
        admin, created = User.objects.get_or_create(username='burgeradmin', defaults={'email': 'admin@burgersupreme.com', 'is_staff': True, 'is_superuser': True})
        if not created:
            admin.is_staff = True
            admin.is_superuser = True
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(self.style.SUCCESS(f'Superuser burgeradmin {"created" if created else "updated"}'))

        MenuItem.objects.all().delete()
        Ingredient.objects.all().delete()

        foods = [
            {
                'title': 'Classic Supreme',
                'description': 'Single patty with aged cheddar',
                'price': 9.99, 'calories': 780, 'category': 'food',
                'image_url': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
            },
            {
                'title': 'Double Smash',
                'description': 'Two smashed patties with applewood bacon',
                'price': 13.99, 'calories': 1150, 'category': 'food',
                'image_url': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
            },
            {
                'title': 'Spicy Supreme',
                'description': 'Jalapeño, pepper jack, chipotle aioli',
                'price': 11.99, 'calories': 850, 'category': 'food',
                'image_url': 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
            },
            {
                'title': 'Truffle Melt',
                'description': 'Truffle aioli, caramelized onion, gruyère',
                'price': 14.99, 'calories': 920, 'category': 'food',
                'image_url': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
            },
        ]

        drinks = [
            {
                'title': 'Classic Milkshake',
                'description': 'Vanilla bean milkshake with whipped cream',
                'price': 5.99, 'calories': 450, 'category': 'drink',
                'image_url': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
            },
            {
                'title': 'Chocolate Shake',
                'description': 'Rich chocolate shake with fudge drizzle',
                'price': 6.99, 'calories': 520, 'category': 'drink',
                'image_url': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&q=80',
            },
            {
                'title': 'Strawberry Lemonade',
                'description': 'Fresh strawberry lemonade over ice',
                'price': 4.99, 'calories': 180, 'category': 'drink',
                'image_url': 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80',
            },
            {
                'title': 'Iced Tea',
                'description': 'Southern-style sweet iced tea',
                'price': 3.99, 'calories': 120, 'category': 'drink',
                'image_url': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
            },
        ]

        for item in foods + drinks:
            MenuItem.objects.create(**item)

        ingredients = [
            {'name': 'Angus Beef', 'description': 'Premium dry-aged Angus, ground fresh daily', 'icon_name': 'Beef', 'display_order': 1},
            {'name': 'Artisan Bun', 'description': 'Brioche baked in-house with heritage grains', 'icon_name': 'Wheat', 'display_order': 2},
            {'name': 'House Sauce', 'description': 'Secret recipe aged 48 hours for depth', 'icon_name': 'Sparkles', 'display_order': 3},
        ]

        for ing in ingredients:
            Ingredient.objects.create(**ing)

        self.stdout.write(self.style.SUCCESS(f'Seeded {MenuItem.objects.count()} items and {Ingredient.objects.count()} ingredients'))
