from flask import session, redirect, url_for, g


def login_filter():
    if 'accessToken' not in session or session['accessToken'] is None:
        return redirect(url_for('bplogin.login'))
