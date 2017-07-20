from flask import Blueprint
from script.models.database import db_session

api = Blueprint('api', __name__)

from . import route_api


"""
@api.after_request
def close_session_after_request(response):
    db_session.remove()
    return response
"""