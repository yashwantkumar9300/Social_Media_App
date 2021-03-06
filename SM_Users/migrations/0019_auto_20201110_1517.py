# Generated by Django 3.1 on 2020-11-10 15:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('SM_Users', '0018_allposts_commentsonpost_filesonposts'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='allposts',
            name='comments',
        ),
        migrations.RemoveField(
            model_name='allposts',
            name='files',
        ),
        migrations.AddField(
            model_name='commentsonpost',
            name='post',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='SM_Users.allposts'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='filesonposts',
            name='post',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='SM_Users.allposts'),
            preserve_default=False,
        ),
    ]
