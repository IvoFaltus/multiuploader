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

models = []

def deleteTables():
    



    if len(models)==0:
        try:
            for m in sys.argv[1:]:
                models.append(apps.get_model("api", m))
        except Exception as e:
            print(f"Error: {e}")        




    try:
        for m in models:
            m.objects.all().delete()
    except Exception as e:
        print(f"Error: {e}")
    print(f"Deleted all records from tables: {[m._meta.model.__name__ for m in models]}")      



if sys.argv[1] == "a":
    models = [apps.get_model("api", "listing"),apps.get_model("api", "listingimage"),apps.get_model("api", "listingplatform")]
    deleteTables()
else:
    models=[]
    deleteTables()    



      


