import time, os
from celery import Celery
from celery.utils.log import get_task_logger
import grequests, csv
from datetime import datetime

logger = get_task_logger(__name__)

app = Celery(
    "tasks",
    broker=f"amqp://{os.environ.get('RABBITMQ_DEFAULT_USER')}:{os.environ.get('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672",
    backend="mongodb://mongo_server:27017/test_db",
    # backend="redis://redis_server:6379/0",
)


@app.task()
def generate_file(file_name="test here"):
    try:
        return "from celery-" + file_name
    except Exception as ex:
        pprint(ex)
        return ex


def store(jsonData, file_name):
    fieldNames = [
        "_id",
        "firstname",
        "lastname",
        "country",
        "city",
        "createdAt",
        "__kind",
        "id",
        "author",
    ]
    try:
        exists = os.path.exists(file_name)
        with open(file_name, "a", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldNames)
            if not exists:
                writer.writeheader()
            writer.writerows(jsonData)
    except Exception as ex:
        pprint(ex + " " + type(ex))


def pprint(string):
    try:
        with open("images/log_file", "+a") as w:
            w.write(f"{datetime.now().strftime('%d/%m/%Y %H:%M:%S')} - {str(string)}\n")
    except Exception as ex:
        print(ex)
    print(string)


@app.task()
def parseManifest(petition_id=852458):
    file_name = f"images/data-{petition_id}.csv"
    if os.path.exists(file_name):
        os.unlink(file_name)

    interval = 15
    i = 1
    breackFromParentLoop = True
    t = time.time()
    while breackFromParentLoop:
        pprint(list(range(i, i + interval)))
        urls = [
            f"https://manifest.ge/api/petitions/{petition_id}/signatures/page-{x}"
            for x in range(i, i + interval)
        ]

        rs = (grequests.get(u) for u in urls)
        results = []
        for itm in grequests.map(rs):
            item = itm.json()
            if not item["items"]:
                breackFromParentLoop = False
                break
            results += item["items"]
        store(results, file_name)

        i += interval

        if i > 500:
            break
    return f"status...{round(time.time() - t, 2)}"
