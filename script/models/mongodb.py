import pymongo
import json


def insert_data(mongodb_url, data):
    client = pymongo.MongoClient(mongodb_url,
                                 connectTimeoutMS=30000,
                                 socketTimeoutMS=None,
                                 socketKeepAlive=True)

    db = client.get_default_database()

    db.my_collection.insert_one(data)


def get_data_by_timedelta(mongodb_url, timedelta_s={}):
    client = pymongo.MongoClient(mongodb_url,
                                 connectTimeoutMS=30000,
                                 socketTimeoutMS=None,
                                 socketKeepAlive=True)

    db = client.get_default_database()

    from datetime import datetime, timedelta
    three_days_ago = datetime.utcnow() - timedelta(days=timedelta_s.get('days'), hours=timedelta_s.get('hours'))
    cursor = db.my_collection.find({
        'created_at': {'$gte': three_days_ago}
    })
    ret_list = []
    for doc in cursor:
        ret_list.append(doc)
    return ret_list
