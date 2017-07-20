# -*- coding: utf-8 -*-
# Project Name
PROJECT_NAME = 'uk_coastal_monitoring'

# Determine system whether start with debug mode
DEBUG = True

# Cookie security key
SECRET_KEY = 'AIzaSyAlpjgnmPOM99xvTK_KzGCvVWLMXC_MaA0'
# Session timeout time
SESSION_TIMEOUT = 60 * 60

# Use google cloud or not
SQLALCHEMY_DATABASE_URI = 'sqlite:///projdb.sqlite'

# Record number displayed in single page.
PAGESIZE = 20

# the flag whether open email notification
ENABLE_MAIL_NOTICE = False

# the host of mail server
SMTP_HOST = 'smtp.163.com'

# default sender
EMAIL_SENDER = 'xxxxxx'

# the password of default sender
SENDER_PASS = 'xxxxxx'

# email subject prefix
MAIL_SUBJECT_PREFIX = '[' + PROJECT_NAME.capitalize() + ']'

# The max distance between users can be found
MAX_FOUND_DISTANCE_BETWEEN_USERS = 2000

# channel coast api key
CHANNNEL_COAST_API_KEY = 'dfjn4ty1jdpm5qrgc6jwpdmk9gh7gf6u'


SECONDS = 900
