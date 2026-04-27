# Generated for daily farmer update ingestion.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FarmerUpdate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('update_id', models.CharField(db_index=True, max_length=180, unique=True)),
                ('category', models.CharField(choices=[('press_release', 'Press Release'), ('scheme', 'Government Scheme'), ('mandi', 'Mandi Price'), ('loan', 'Loan Option')], db_index=True, max_length=30)),
                ('title', models.CharField(max_length=500)),
                ('description', models.TextField(blank=True)),
                ('source_name', models.CharField(max_length=255)),
                ('source_url', models.URLField(blank=True, max_length=1000)),
                ('published_at', models.CharField(blank=True, max_length=120)),
                ('state', models.CharField(blank=True, db_index=True, max_length=100)),
                ('district', models.CharField(blank=True, db_index=True, max_length=150)),
                ('tags', models.JSONField(default=list)),
                ('payload', models.JSONField(default=dict)),
                ('fetched_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'data_farmer_update',
                'ordering': ['-fetched_at', '-id'],
            },
        ),
    ]
