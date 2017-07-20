# -*- coding: utf-8 -*-
from flask import Flask
from flask_mail import Mail
from script.config import SECRET_KEY, DEBUG

mail = Mail()


def create_app():
    app = Flask(__name__)
    app.debug = DEBUG

    # load config file
    app.config.from_pyfile('config.py')

    # config secret key
    app.config['SECRET_KEY'] = SECRET_KEY

    # init app by mail
    mail.init_app(app)

    # config jinja
    # app.jinja_env.variable_start_string = '(('
    # app.jinja_env.variable_end_string = '))'
    app.jinja_env.trim_blocks = True

    # start register module
    from script.controllers import main as main_blueprint
    from script.controllers import main_filter as main_filter_blueprint
    from script.controllers import login as login_blueprint
    from script.api import api as api_blueprint

    app.register_blueprint(main_blueprint)
    app.register_blueprint(main_filter_blueprint)
    app.register_blueprint(login_blueprint)
    app.register_blueprint(api_blueprint, url_prefix='/api')
    # end register module
    return app
