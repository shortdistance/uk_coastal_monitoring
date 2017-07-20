import requests
import json
from xml.etree.ElementTree import fromstring
from xmljson import parker, Parker


def xml_format(xml):
    xml = xml.replace(b'   xmlns:ms="http://mapserver.gis.umn.edu/mapserver"', b'')
    xml = xml.replace(b'   xmlns:wfs="http://www.opengis.net/wfs"', b'')
    xml = xml.replace(b'   xmlns:gml="http://www.opengis.net/gml"', b'')
    xml = xml.replace(b'   xmlns:ogc="http://www.opengis.net/ogc"', b'')
    xml = xml.replace(b'   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"', b'')
    xml = xml.replace(
        b'   xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic3.xsd"', b'')
    xml = xml.replace(b'ms:', b'')
    xml = xml.replace(b'wfs:', b'')
    xml = xml.replace(b'gml:', b'')
    xml = xml.replace(b'ogc:', b'')
    xml = xml.replace(b'xsi:', b'')
    xml = xml.replace(b'schemaLocation:', b'')
    xml = xml.replace(b'FeatureCollection ', b'FeatureCollection')
    xml = xml.replace(b'\r', b'')
    xml = xml.replace(b'\n', b'')
    return xml


def http_api_get(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'Referer': 'http://iotobservatory.io',
        'Content-Type': 'application/json'}
    try:
        r = requests.get(url, headers=headers)
        ret = r.content
        ret = xml_format(ret)
        ret_json = json.dumps(parker.data(fromstring(ret)))
    except Exception as e:
        print(e)
        ret_json = {}

    return ret_json


def get_waves():
    url1 = 'http://data.channelcoast.org/observations/waves/latest?key=dfjn4ty1jdpm5qrgc6jwpdmk9gh7gf6u'
    return http_api_get(url1)


"""
   "featureMember":[  
      {  
         "waves":{  
            "boundedBy":{  
               "Box":{  
                  "coordinates":"-4.2766000000,51.0581200000 -4.2766000000,51.0581200000"
               }
            },
            "msGeometry":{  
               "Point":{  
                  "coordinates":"-4.2766000000,51.0581200000"
               }
            },
            "msGeometryOSGB":{  
               "Point":{  
                  "coordinates":"240538.000,131226.000"
               }
            },
            "id":97,
            "sensor":"Bideford Bay",
            "date":"20170702#213000",
            "value":271.4,
            "hs":0.74,
            "type":"waves",
            "sst":16.95
         }
      },
    ]
"""


def get_tides():
    url2 = 'http://data.channelcoast.org/observations/tides/latest?key=dfjn4ty1jdpm5qrgc6jwpdmk9gh7gf6u'
    return http_api_get(url2)


"""
"featureMember":[  
      {  
         "tide":{  
            "boundedBy":{  
               "Box":{  
                  "coordinates":"-0.4906100000,50.7699500000 -0.4906100000,50.7699500000"
               }
            },
            "msGeometry":{  
               "Point":{  
                  "coordinates":"-0.4906100000,50.7699500000"
               }
            },
            "msGeometryOSGB":{  
               "Point":{  
                  "coordinates":"506425.000,97779.000"
               }
            },
            "id":86,
            "sensor":"Arun Platform",
            "date":"20170702#222500",
            "value":3.143,
            "type":"tides"
         }
      },
    ]
"""


def get_met():
    url3 = 'http://data.channelcoast.org/observations/met/latest?key=dfjn4ty1jdpm5qrgc6jwpdmk9gh7gf6u'
    return http_api_get(url3)


"""
"featureMember":[  
      {  
         "tide":{  
            "boundedBy":{  
               "Box":{  
                  "coordinates":"-0.490610000000000,50.769950000000000 -0.490610000000000,50.769950000000000"
               }
            },
            "msGeometry":{  
               "Point":{  
                  "coordinates":"-0.490610000000000,50.769950000000000"
               }
            },
            "msGeometryOSGB":{  
               "Point":{  
                  "coordinates":"506425,97779"
               }
            },
            "id":86,
            "sensor":"Arun Platform",
            "date":"20170702#222500",
            "temp":17.0,
            "value":7.0941,
            "type":"met",
            "dir":279.3,
            "gust":7.768
         }
      },
    ]
"""

