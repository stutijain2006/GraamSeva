from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Refresh the daily farmer update database from PIB, mandi, scheme, and loan sources.'

    def add_arguments(self, parser):
        parser.add_argument('--state', default='', help='Optional state for location-aware scheme/mandi filtering.')
        parser.add_argument('--district', default='', help='Optional district for location-aware mandi filtering.')

    def handle(self, *args, **options):
        from voice_agent.views import _refresh_farmer_update_db_if_needed
        from data.models import FarmerUpdate

        request_data = {
            'state': options['state'],
            'district': options['district'],
            'forceRefresh': True,
        }
        refreshed = _refresh_farmer_update_db_if_needed(request_data)
        self.stdout.write(
            self.style.SUCCESS(
                f"Farmer updates refresh complete. refreshed={refreshed}, total_records={FarmerUpdate.objects.count()}"
            )
        )
