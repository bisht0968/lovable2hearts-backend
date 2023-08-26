from .models import Products
from rest_framework import serializers

class ProductsSerializers(serializers.ModelSerializer):
    class Meta:
        model=Products
        fields = '__all__'
        