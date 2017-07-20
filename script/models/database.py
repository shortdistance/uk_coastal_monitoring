# -*- coding: utf-8 -*-

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from math import ceil
from script.config import *
from script.config import PAGESIZE

engine = create_engine(SQLALCHEMY_DATABASE_URI, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

BaseModel = declarative_base()
BaseModel.query = db_session.query_property()


def pager(query, order_by, page_no, page_size=PAGESIZE):
    """
    data page
    """
    row_count = query.count()
    page_count = int(ceil(row_count * 1.0 / page_size))
    page_no = int(page_no)
    if page_no < 1:
        page_no = 1
    if page_no > page_count:
        page_no = page_count
    if page_no == 0:
        page_no = 1
        page_count = 1
    data = query.order_by(order_by).limit(page_size).offset((page_no - 1) * page_size)
    return row_count, page_count, page_no, page_size, data


def drop_database():
    """
    drop all databases
    """
    BaseModel.metadata.drop_all(bind=engine)


def create_database():
    """
    create all databases
    """
    BaseModel.metadata.create_all(bind=engine)
