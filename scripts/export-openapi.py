import json

from coucoumeow_api.main import create_app


print(json.dumps(create_app().openapi(), ensure_ascii=False, sort_keys=True))
