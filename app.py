from flask import Flask, render_template, request
import pandas as pd
from models import Level, Equipment, db
import pony.orm as pny


app = Flask(__name__)
df = pd.read_excel('data/price_list.xlsx', sheet_name='Лист1')


@app.route('/')
def base():
    return render_template('base.html')


@app.route('/combo')
def combo1():
    with pny.db_session:
        data = [(item.id, item.name) for item in Level.select(level=1)]
    return render_template('combo_view.html', data=data)


@app.route('/flat')
def flat():
    return render_template('flat_search_view.html')


@app.route('/flat_search', methods=['POST'])
def flat_search():

    # def ensure_case_insensitive_like(db):
    #     if db.provider.dialect == 'SQLite':
    #         db.execute('PRAGMA case_sensitive_like = OFF')

    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        json_request = request.json['keyword']
    else:
        return ['Content-Type not supported!']

    # делим запрос на части по пробелам. Если меньше трех ключевых слов - дополняем пустыми
    keyword = str(json_request).upper().split(' ')
    keys = keyword + [''] * (3 - len(keyword)) if (len(keyword) <= 3) else keyword[:3]

    with pny.db_session:
        # ensure_case_insensitive_like(db)
        data = [{'label': item.name, 'value': item.id} for item in pny.select(p for p in Equipment if keys[0] in p.upper_name and keys[1] in p.upper_name and keys[2] in p.upper_name)]

        # print(data)

    return data


@app.route('/level2', methods=['POST'])
def combo2():
    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        json_request = request.json['level']
    else:
        return ['Content-Type not supported!']

    with pny.db_session:
        data = [{'label': item.name, 'value': item.id} for item in Level.select(level=2, parent_id=json_request)]

    return data


@app.route('/level3', methods=['POST'])
def combo3():
    print(f'запрошенные данные {request.json}')

    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        json_request = request.json['level']
    else:
        return ['Content-Type not supported!']

    with pny.db_session:
        data = [{'label': item.name, 'value': item.id} for item in Level.select(level=3, parent_id=json_request)]

    return data


@app.route('/goods', methods=['POST'])
def list1():
    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        json_request = request.json['id']
    else:
        return ['Content-Type not supported!']

    print(json_request)

    with pny.db_session:
        if json_request == -1:
            data = [{'label': item.name, 'value': item.id} for item in Equipment.select()]
        else:
            data = [{'label': item.name, 'value': item.id} for item in Equipment.select(level_id=json_request)]

    print(data)
    print(type(data))

    return data


@app.route('/search', methods=['POST'])
def search_good():
    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        json_request = request.json['id']
    else:
        return ['Content-Type not supported!']

    with pny.db_session:
        data = Equipment.get(id=json_request)

    return {"name": data.name, 'price': data.price}


if __name__ == '__main__':
    app.run(debug=True)
