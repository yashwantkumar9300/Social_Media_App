# Generated by Django 3.1 on 2020-11-19 12:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SM_Users', '0019_auto_20201110_1517'),
    ]

    operations = [
        migrations.AddField(
            model_name='commentsonpost',
            name='liked',
            field=models.BooleanField(default=False),
        ),
    ]
