from script.config import REDIS_URL, RABBITMQ_BIGWIG_URL, MONGODB_URI, SECONDS
from datetime import timedelta
from celery import Celery
from celery.task import periodic_task
from celery.schedules import crontab

from script.util import get_waves, get_tides
from script.models.mongodb import insert_data
from datetime import datetime
import json
import os

redis_url = os.environ.get('REDIS_URL') or REDIS_URL
rabbit_url = os.environ.get('RABBITMQ_BIGWIG_URL') or RABBITMQ_BIGWIG_URL
mongodb_url = os.environ.get('MONGODB_URI') or MONGODB_URI

app = Celery('tasks',
             broker=rabbit_url)
app.conf.timezone = 'Europe/London'


@periodic_task(run_every=crontab(minute='*/15'))
def a():
    msg = {'msg': ''}
    try:
        waves_json = get_waves()
        tides_json = get_tides()

        if isinstance(waves_json, str):
            waves_json = json.loads(waves_json)

        if isinstance(tides_json, str):
            tides_json = json.loads(tides_json)

        json_data = {}
        if waves_json and tides_json:
            dt = datetime.now()
            json_data = dict(created_at=dt, waves_json=waves_json, tides_json=tides_json)
            insert_data(mongodb_url, json_data)
            msg['msg'] = 'OK'
        else:
            msg['msg'] = 'BLANK'
    except Exception as e:
        msg['msg'] = e.__str__()

    return msg


'''
worker: celery worker -l info -A tasks:app --beat
'''
