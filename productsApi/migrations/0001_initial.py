# Generated by Django 3.2.20 on 2023-08-24 16:49

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Products',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('images', models.ImageField(blank=True, null=True, upload_to='product_images/')),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('shipping_price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('stock', models.PositiveIntegerField()),
                ('discount', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('reviews', models.PositiveIntegerField(default=0)),
            ],
        ),
    ]
