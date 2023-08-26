from django.db import models

class Products(models.Model):
    name = models.CharField(max_length=100)
    images = models.URLField(blank=True, null=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_price = models.DecimalField(max_digits=6, decimal_places=2)
    stock = models.PositiveIntegerField()
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reviews = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name
    