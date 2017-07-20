from flask import render_template, request, redirect, url_for
from . import main, main_filter
from script.controllers.filter import login_filter
from script.models.database import db_session
import requests

main_filter.before_request(login_filter)


@main.route('/')
def index():
    return render_template('fetch_data_demo.html')
