# Generated by Django 3.1 on 2020-09-30 07:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SM_Users', '0007_allnotification_friendrequestmodel'),
    ]

    operations = [
        migrations.AddField(
            model_name='friendrequestmodel',
            name='status',
            field=models.CharField(default='Pending', max_length=30),
        ),
    ]