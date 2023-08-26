from django.urls import path
from .views import ProductsList, ProductDetail,ProductUpdateView

urlpatterns = [
    path('products/', ProductsList.as_view(), name='product-list'),
    path('products/<str:product_id>/', ProductDetail.as_view(), name='product-detail'),
    path('products/<int:product_id>/update/', ProductUpdateView.as_view(), name='product-update'),
]

