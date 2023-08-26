from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Products
from .serializers import ProductsSerializers
from rest_framework import status

class ProductsList(APIView):
    def get(self, request):
        products = Products.objects.all()
        serializer = ProductsSerializers(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductsSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetail(APIView):
    def get(self, request, product_id):
        try:
            product = Products.objects.get(id=product_id)
            serializer = ProductsSerializers(product)
            return Response(serializer.data)
        except Products.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, product_id):
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ProductUpdateView(APIView):
    def put(self, request, product_id):
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductsSerializers(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
