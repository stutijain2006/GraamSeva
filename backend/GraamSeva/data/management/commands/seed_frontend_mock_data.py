import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from data.models import Application, Dashboard, Eligibility, LoanOption, MandiPrice, Scheme


GOV_LEVEL_MAP = {
    "central": "CENTRAL",
    "state": "STATE",
    "central_state": "CENTRAL_STATE",
}


def parse_government_level(value):
    text = (value or "").strip().lower()
    if "central" in text and "state" in text:
        return GOV_LEVEL_MAP["central_state"]
    if "state" in text:
        return GOV_LEVEL_MAP["state"]
    if "central" in text:
        return GOV_LEVEL_MAP["central"]
    return GOV_LEVEL_MAP["state"]


def parse_number_list(text):
    normalized = str(text or "").replace(",", "")
    matches = re.findall(r"\d+(?:\.\d+)?", normalized)
    return [float(m) for m in matches]


def parse_amount_range(text):
    numbers = parse_number_list(text)
    if not numbers:
        return 50000, 500000

    amount_text = str(text or "").lower()
    multiplier = 1
    if "lakh" in amount_text or "लाख" in amount_text:
        multiplier = 100000
    elif "crore" in amount_text or "करोड़" in amount_text:
        multiplier = 10000000

    if len(numbers) >= 2:
        return int(numbers[0] * multiplier), int(numbers[1] * multiplier)
    value = int(numbers[0] * multiplier)
    return value, value


def parse_interest_rate(text):
    numbers = parse_number_list(text)
    if not numbers:
        return 8.5
    if len(numbers) >= 2:
        return round((numbers[0] + numbers[1]) / 2, 2)
    return numbers[0]


def parse_tenure_months(text):
    numbers = parse_number_list(text)
    if not numbers:
        return 36

    normalized = str(text or "").lower()
    has_year = any(token in normalized for token in ["year", "years", "वर्ष", "साल"])

    if len(numbers) >= 2:
        base = (numbers[0] + numbers[1]) / 2
    else:
        base = numbers[0]

    if has_year:
        return int(base * 12)
    return int(base)


def parse_amount_to_int(text, fallback=0):
    numbers = parse_number_list(text)
    if not numbers:
        return fallback
    # Handles values such as "₹68,50,000"
    return int(numbers[0]) if len(numbers) == 1 else int("".join(re.findall(r"\d+", str(text))))


def status_to_application_status(status):
    normalized = str(status or "").strip().lower()
    if normalized == "approved":
        return "APPROVED"
    if normalized in {"processing", "under review", "under_review"}:
        return "UNDER_REVIEW"
    if normalized in {"rejected", "declined"}:
        return "REJECTED"
    return "SUBMITTED"


class Command(BaseCommand):
    help = "Seed backend database from frontend mock data JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            "--seed-file",
            default="data/frontend_mock_seed.json",
            help="Path to seed JSON file (relative to backend/GraamSeva) or absolute path",
        )

    def handle(self, *args, **options):
        seed_file = options["seed_file"]
        file_path = Path(seed_file)
        if not file_path.is_absolute():
            file_path = Path(__file__).resolve().parents[3] / file_path

        if not file_path.exists():
            raise CommandError(f"Seed file not found: {file_path}")

        with file_path.open("r", encoding="utf-8") as fp:
            seed = json.load(fp)

        languages = seed.get("languages", ["en"])

        with transaction.atomic():
            scheme_count = self.seed_schemes(seed, languages)
            mandi_count = self.seed_mandi(seed, languages)
            loan_count = self.seed_loans(seed, languages)
            eligibility_count = self.seed_eligibility(seed, languages)
            application_count = self.seed_applications(seed)
            dashboard_count = self.seed_dashboard(seed)

        self.stdout.write(self.style.SUCCESS("Frontend mock data seeded into backend database."))
        self.stdout.write(
            f"Schemes: {scheme_count}, Mandi: {mandi_count}, Loans: {loan_count}, "
            f"Eligibility: {eligibility_count}, Applications: {application_count}, Dashboard: {dashboard_count}"
        )

    def seed_schemes(self, seed, languages):
        schemes_by_lang = seed.get("schemesByLang", {})
        en_schemes = schemes_by_lang.get("en", [])
        index_by_lang = {
            lang: {item.get("id"): item for item in schemes_by_lang.get(lang, [])}
            for lang in languages
        }

        count = 0
        for en_item in en_schemes:
            scheme_id = int(en_item.get("id"))
            descriptions = {}
            benefits = {}
            how_to_apply = {}
            documents_required = {}

            for lang in languages:
                item = index_by_lang.get(lang, {}).get(scheme_id)
                if not item:
                    continue
                descriptions[lang] = item.get("desc", "")
                benefits[lang] = item.get("benefits", [])
                how_to_apply[lang] = item.get("howToApply", [])
                documents_required[lang] = item.get("documents", [])

            Scheme.objects.update_or_create(
                scheme_id=scheme_id,
                defaults={
                    "name": en_item.get("name", f"Scheme {scheme_id}"),
                    "icon": en_item.get("icon", "🌾"),
                    "details": en_item.get("details", ""),
                    "government_level": parse_government_level(en_item.get("governmentLevel")),
                    "states": en_item.get("states", ["ALL"]),
                    "descriptions": descriptions,
                    "benefits": benefits,
                    "how_to_apply": how_to_apply,
                    "documents_required": documents_required,
                    "eligibility": en_item.get("eligibility", {}),
                    "authority": en_item.get("authority", {}),
                },
            )
            count += 1

        return count

    def seed_mandi(self, seed, languages):
        mandi_by_lang = seed.get("mandiByLang", {})
        en_mandi = mandi_by_lang.get("en", [])
        index_by_lang = {
            lang: {item.get("id"): item for item in mandi_by_lang.get(lang, [])}
            for lang in languages
        }

        count = 0
        for en_item in en_mandi:
            mandi_id = int(en_item.get("id"))
            localized_mandi = {
                lang: index_by_lang.get(lang, {}).get(mandi_id, {}).get("mandi")
                for lang in languages
            }

            crops = []
            for idx, en_crop in enumerate(en_item.get("crops", [])):
                localized_crop = {}
                for lang in languages:
                    lang_item = index_by_lang.get(lang, {}).get(mandi_id, {})
                    lang_crops = lang_item.get("crops", [])
                    if idx < len(lang_crops):
                        localized_crop[lang] = lang_crops[idx]

                crops.append(
                    {
                        "crop": en_crop.get("crop"),
                        "price": en_crop.get("price"),
                        "change": en_crop.get("change"),
                        "trend": en_crop.get("trend", "stable"),
                        "localized": localized_crop,
                    }
                )

            MandiPrice.objects.update_or_create(
                mandi_id=mandi_id,
                defaults={
                    "mandi_name": en_item.get("mandi", f"Mandi {mandi_id}"),
                    "state": en_item.get("state", "Unknown"),
                    "district": en_item.get("state", "Unknown"),
                    "crops": crops,
                },
            )
            count += 1

        return count

    def seed_loans(self, seed, languages):
        loans_by_lang = seed.get("loanByLang", {})
        en_loans = loans_by_lang.get("en", [])
        index_by_lang = {
            lang: {item.get("id"): item for item in loans_by_lang.get(lang, [])}
            for lang in languages
        }

        count = 0
        for en_item in en_loans:
            loan_idx = int(en_item.get("id"))
            min_amount, max_amount = parse_amount_range(en_item.get("amount", ""))
            interest = parse_interest_rate(en_item.get("interest", ""))
            tenure_months = parse_tenure_months(en_item.get("tenure", ""))

            title = (en_item.get("title") or "").lower()
            if "credit" in title or "kcc" in title:
                loan_type = "KISAN_CREDIT"
            elif "tractor" in title or "equipment" in title:
                loan_type = "EQUIPMENT"
            elif "crop" in title:
                loan_type = "AGRICULTURAL"
            else:
                loan_type = "AGRICULTURAL"

            localized_titles = {
                lang: index_by_lang.get(lang, {}).get(loan_idx, {}).get("title")
                for lang in languages
            }

            documents_required = [
                "Aadhaar Card",
                "Land or income proof",
                "Bank account statement",
                json.dumps({"localized_titles": localized_titles}, ensure_ascii=False),
            ]

            LoanOption.objects.update_or_create(
                loan_id=f"MOCK-LOAN-{loan_idx}",
                defaults={
                    "bank_name": en_item.get("title", f"Loan Option {loan_idx}"),
                    "branch_name": "Mock Branch",
                    "loan_type": loan_type,
                    "annual_interest_rate": interest,
                    "tenure_months": max(1, tenure_months),
                    "processing_fee_percent": 1.0,
                    "min_amount": max(1000, min_amount),
                    "max_amount": max(min_amount, max_amount),
                    "prepayment_policy": "As per lender policy",
                    "documents_required": documents_required,
                    "address": "Local service branch",
                    "contact_phone": "+91-00000-00000",
                    "manager_name": "Loan Desk",
                    "website": None,
                    "working_hours": "Mon-Sat 10:00 AM - 4:00 PM",
                },
            )
            count += 1

        return count

    def seed_eligibility(self, seed, languages):
        eligibility_by_lang = seed.get("eligibilityByLang", {})
        by_scheme = {}

        for lang in languages:
            for row in eligibility_by_lang.get(lang, []):
                scheme_id = int(row.get("id"))
                by_scheme.setdefault(scheme_id, {})[lang] = row.get("data", {})

        count = 0
        for scheme_id, localized in by_scheme.items():
            criteria = {
                "title": {lang: data.get("title") for lang, data in localized.items()},
                "description": {lang: data.get("description") for lang, data in localized.items()},
                "requirements": {lang: data.get("requirements", []) for lang, data in localized.items()},
                "documents": {lang: data.get("documents", []) for lang, data in localized.items()},
                "nextSteps": {lang: data.get("nextSteps") for lang, data in localized.items()},
            }

            Eligibility.objects.update_or_create(
                eligibility_id=f"MOCK-ELIG-{scheme_id}",
                defaults={
                    "scheme_id": scheme_id,
                    "criteria": criteria,
                    "min_land_size": None,
                    "max_land_size": None,
                    "max_annual_income": None,
                    "eligible_states": ["ALL"],
                    "eligible_genders": ["All"],
                },
            )
            count += 1

        return count

    def seed_applications(self, seed):
        dashboard = seed.get("dashboardStats", {})
        activities = dashboard.get("recentActivities", [])

        count = 0
        now = timezone.now()

        for idx, activity in enumerate(activities, start=1):
            app_id = f"MOCK-APP-{idx:03d}"
            status = status_to_application_status(activity.get("status"))
            Application.objects.update_or_create(
                application_id=app_id,
                defaults={
                    "scheme_id": idx,
                    "farmer_name": activity.get("name", f"Farmer {idx}"),
                    "farmer_phone": "0000000000",
                    "farmer_aadhar": None,
                    "status": status,
                    "application_data": {
                        "source": "frontend-mock-seed",
                        "activity": activity,
                    },
                    "submitted_at": now,
                    "reviewed_at": now if status in {"APPROVED", "REJECTED", "UNDER_REVIEW"} else None,
                },
            )
            count += 1

        return count

    def seed_dashboard(self, seed):
        dashboard = seed.get("dashboardStats", {})
        schemes = seed.get("schemesByLang", {}).get("en", [])
        latest_offers = seed.get("latestOffersByLang", {}).get("en", [])

        Dashboard.objects.update_or_create(
            dashboard_id="main",
            defaults={
                "total_schemes": len(schemes),
                "trending_schemes": [scheme.get("id") for scheme in schemes[:3]],
                "total_farmers_benefited": parse_amount_to_int(dashboard.get("amountUnlocked"), fallback=0),
                "recent_applications": dashboard.get("recentActivities", []),
                "featured_offers": latest_offers,
            },
        )
        return 1
