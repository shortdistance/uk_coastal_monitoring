from flask import Blueprint


login = Blueprint('login',__name__)
main = Blueprint('main', __name__)
main_filter = Blueprint('main_filter', __name__)

from . import route_login, route_main


