# Generated by Django 4.2.5 on 2024-01-09 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0007_mymodel'),
    ]

    operations = [
        migrations.DeleteModel(
            name='MyModel',
        ),
        migrations.AddField(
            model_name='email',
            name='labels',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='email',
            name='spam',
            field=models.BooleanField(default=False),
        ),
    ]
