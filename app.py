import datetime

from flask import Flask, render_template, request, redirect
import pandas as pd
from models import Level, Equipment, Project, db, create_project_table_entity
import pony.orm as pny
from transliterate import translit
import re

app = Flask(__name__)

app.config.update({'PROJ_ID': -1})


# df = pd.read_excel('data/price_list.xlsx', sheet_name='Лист1')


@app.route('/', methods=['POST', 'GET'])
def base():
    if request.method == 'POST':
        content_type = request.headers.get('Content-Type')
        if content_type == 'application/json':
            json_request = request.json['project_id']
            app.config.update({'PROJ_ID': json_request})
        else:
            return ['Content-Type not supported!']

    with pny.db_session:
        app.config.update({'PROJ_NAME': Project.get(id=app.config['PROJ_ID']).name})
        data = [(t.id, t.name) for t in Project.select().order_by(pny.desc(Project.create_date)) if t.id > 0]
        app.config.update({'PROJ_LIST': data})
    return render_template('base.html', data={'project_list': data, 'project_name': app.config['PROJ_NAME']})


@app.route('/combo')
def combo1():
    with pny.db_session:
        data = [(item.id, item.name) for item in Level.select(level=1)]
    return render_template('combo_view.html', data=data)


@app.route('/flat')
def flat():
    return render_template('flat_search_view.html', data={'project_list': app.config['PROJ_LIST'], 'project_name': app.config['PROJ_NAME']})


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
        data = [{'label': item.name, 'value': item.id} for item in pny.select(
            p for p in Equipment if keys[0] in p.upper_name and keys[1] in p.upper_name and keys[2] in p.upper_name)]

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

    return {"name": data.name, 'price': int(data.price)}


@app.route('/new_project', methods=['POST'])
def new_project():
    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        project_name = request.json['name']
        project_customer = request.json['customer']
    else:
        return ['Content-Type not supported!']

    table_name = 'Proj_' + translit(project_name, 'ru', reversed=True).\
        capitalize().\
        strip()
    table_name = re.sub('\W', '_', table_name)
    create_date = datetime.datetime.now()
    modify_date = create_date

    try:
        db2 = pny.Database("sqlite", "data/equipment.sqlite")  # , create_db=True)
        new_table = type(table_name, (db2.Entity,), {
            'id': pny.PrimaryKey(int, auto=True),
            'hc_code': pny.Optional(str),
            'name': pny.Required(str),
            'price': pny.Optional(float)
        })
        db2.generate_mapping(create_tables=True)

        with pny.db_session:
            project = Project(name=project_name,
                              table_name=table_name,
                              create_date=create_date,
                              modify_date=modify_date,
                              customer=project_customer)
    except Exception as ex:
        print(ex)
        return ['Не удалось создать новый проект!']

    return {"table_name": table_name, "project_name": project_name}


@app.route('/delete_project')
def delete_project():
    with pny.db_session:
        deleted_table = Project.get(id=app.config['PROJ_ID']).table_name

    db2 = pny.Database("sqlite", "data/equipment.sqlite")
    Project2 = create_project_table_entity(db2.Entity)
    db2.generate_mapping(create_tables=True)

    try:
        with pny.db_session:
            db2.execute(f'DROP TABLE {deleted_table}')
            pny.delete(t for t in Project2 if t.table_name == deleted_table)
            app.config.update({'PROJ_ID': -1})
    except Exception as ex:
        print(ex)

    return redirect('/')


@app.route('/get_project')
def get_project():
    print(1)
    with pny.db_session:
        project_table_name = Project.get(id=app.config['PROJ_ID']).table_name

    try:
        db2 = pny.Database("sqlite", "data/equipment.sqlite")  # , create_db=True)
        project_table_data = type(project_table_name, (db2.Entity,), {
            'id': pny.PrimaryKey(int, auto=True),
            'hc_code': pny.Optional(str),
            'name': pny.Required(str),
            'price': pny.Optional(float)
        })
        db2.generate_mapping(create_tables=True)

        with pny.db_session:
            dat = pny.select(row for row in project_table_data)
            print(dat)
            exit(0)

    except Exception as ex:
        print(ex)
        return ['Не удалось создать новый проект!']

    return redirect('/')


if __name__ == '__main__':
    app.run(debug=True, port=5001)
