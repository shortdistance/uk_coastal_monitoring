# -*-coding:utf-8-*-
from flask import jsonify, request
from . import api
from script.util import get_waves, get_tides, get_met
from script.models.mongodb import get_data_by_timedelta
from script.config import MONGODB_URI
from datetime import datetime
import json


@api.route('/get_info')
def get_dataset():
    waves_json = get_waves()
    tides_json = get_tides()

    if isinstance(waves_json, str):
        waves_json = json.loads(waves_json)
        tides_json = json.loads(tides_json)

    return jsonify(waves_json=waves_json, tides_json=tides_json)


@api.route('/get_history_info', methods=['POST'])
def get_history_info():
    request.get_json(force=True)
    days = request.json["days"]
    hours = request.json["hours"]

    print(days, hours)
    timedelta = dict(days=days, hours=hours)

    ret_list = get_data_by_timedelta(MONGODB_URI, timedelta)

    waves_array = []
    tides_array = []
    for row in ret_list:
        create_at = row.get('created_at')
        waves_json = row.get('waves_json')
        if waves_json and isinstance(waves_json, dict):
            waves_json['created_at'] = create_at.strftime("%Y-%m-%d %H:%M:%S") if create_at and isinstance(create_at,
                                                                                                           datetime) else ''
            waves_array.append(waves_json)

        tides_json = row.get('tides_json')
        if tides_json and isinstance(tides_json, dict):
            tides_json['created_at'] = create_at.strftime("%Y-%m-%d %H:%M:%S") if create_at and isinstance(create_at,
                                                                                                           datetime) else ''
            tides_array.append(tides_json)

    return jsonify(waves_array=waves_array, tides_array=tides_array)
