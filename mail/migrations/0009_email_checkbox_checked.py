# Generated by Django 4.2.5 on 2024-01-10 20:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0008_delete_mymodel_email_labels_email_spam'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='checkbox_checked',
            field=models.BooleanField(default=False),
        ),
    ]