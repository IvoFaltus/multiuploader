import os
import django
import sys

import django

# force project root into Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "multi_uploader.settings")
django.setup()
from django.apps import apps

if len(sys.argv) < 2:
    print("Usage: py cleandb.py ModelName")
    exit()

model_name = sys.argv[1]

# load model dynamically
Model = apps.get_model("api", model_name)

# do something
Model.objects.all().delete()

print(f"Deleted all records from table: {model_name}")