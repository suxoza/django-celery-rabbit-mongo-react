import asyncio, urllib.request, json, csv, os, sys, asyncio

petition_id = 852458
url = f"https://manifest.ge/api/petitions/{petition_id}/signatures/page-"
hdr = {"User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64)"}

file_name = "data.csv"
if os.path.exists(file_name):
    os.unlink(file_name)

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


def store(jsonData):
    try:
        exists = os.path.exists(file_name)
        with open(file_name, "a", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldNames)
            if not exists:
                writer.writeheader()
            writer.writerows(jsonData)
    except Exception as ex:
        print(ex, type(ex))
        print(jsonData)


def inThread(id, i):
    print(f"{url}{id} - {i}")
    req = urllib.request.Request(f"{url}{id}", headers=hdr)
    response = urllib.request.urlopen(req)
    jsonData = json.load(response)
    return jsonData


async def main():
    interval = 5
    i = 15
    breackFromParentLoop = False
    while not breackFromParentLoop:
        results = []
        res = await asyncio.gather(*(inThread(x, i) for x in range(i, i + interval)))
        for item in res:
            if not item["items"]:
                breackFromParentLoop = True
                break
            results += item["items"]
        store(results)
        i += interval
    return i


# result = asyncio.run(main())
# print(result)


import grequests


def main2():
    interval = 5
    i = 15
    breackFromParentLoop = False
    while breackFromParentLoop:
        print(list(range(i, i + interval)))
        urls = [
            f"https://manifest.ge/api/petitions/{petition_id}/signatures/page-{x}"
            for x in range(i, i + interval)
        ]

        rs = (grequests.get(u) for u in urls)
        results = []
        for itm in grequests.map(rs):
            item = itm.json()
            if not item["items"]:
                breackFromParentLoop = True
                break
            results += item["items"]
        store(results)

        i += interval

        if i < 500:
            break


main2()
# result = asyncio.run(main())
# print(result)
