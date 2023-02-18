import datetime
import random

from flask import Flask, render_template, request, redirect, send_file, url_for
import pandas as pd
import sqlite3
from models import Level, Equipment, Project, db, create_project_table_entity, Kit
import pony.orm as pny
from transliterate import translit
import re

app = Flask(__name__)

app.config.update({
    'PROJ_ID': -1,
    'PROJ_TABLE_NAME': None,
    'PROJ_NAME': None,
})


def get_project_table(table_name=''):
    if not table_name:
        with pny.db_session:
            table_name = Project.get(id=app.config['PROJ_ID']).table_name

    db2 = pny.Database("sqlite", "data/equipment.sqlite")  # , create_db=True)
    project_table = type(table_name, (db2.Entity,), {
        'id': pny.PrimaryKey(int, auto=True),
        'hc_code': pny.Optional(str),
        'name': pny.Required(str),
        'price': pny.Optional(float),
        'date_add': pny.Required(datetime.datetime)
    })
    db2.generate_mapping(create_tables=True)
    return project_table


# df = pd.read_excel('data/price_list.xlsx', sheet_name='Лист1')


@app.route('/', methods=['POST', 'GET'])
def base():
    if request.method == 'POST':
        content_type = request.headers.get('Content-Type')
        if content_type == 'application/json':
            print('json')
            json_request = request.json['project_id']
            app.config.update({'PROJ_ID': json_request})
        else:
            print('not json')
            return ['Content-Type not supported!']

    with pny.db_session:
        print(f'proj - {app.config["PROJ_ID"]}')
        app.config.update({'PROJ_NAME': Project.get(id=app.config['PROJ_ID']).name})
        data = [(t.id, t.name) for t in Project.select().order_by(pny.desc(Project.create_date)) if t.id > 0]
        app.config.update({'PROJ_LIST': data})
    return render_template('base.html', data={'project_list': data, 'project_name': app.config['PROJ_NAME']})
    # return redirect(url_for('kit_list'))


@app.route('/kit_list', methods=['POST', 'GET'])
def kit_list():
    if request.method == 'POST':
        data = {}
        with pny.db_session:
            parent_ids = list(pny.select(row.parent_id for row in Kit))
            for parent_id in parent_ids:
                # берем каждый родительский id и получаем все id его наборов
                package_ids = list(pny.select(row.package_id for row in Kit if row.parent_id == parent_id))
                package_data = {}
                for package_id in package_ids:
                    # берем каждый набор и получаем его состав: id и кол-во
                    sub_equip_ids_counts = list(pny.select((row.sub_equip_id, row.quantity) for row in Kit if row.package_id == package_id))
                    equipment_data = [{'name': Equipment.get(id=sub[0]).name, 'quantity': sub[1]} for sub in sub_equip_ids_counts]
                    kit_name = list(Kit.select(package_id=package_id))[0].package_name
                    package_data.update({kit_name: equipment_data})
                parent_name = Equipment.get(id=parent_id).name
                data.update({parent_name: package_data})
            print(data)
        return data
    return render_template('kit_list.html', data={'project_list': app.config['PROJ_LIST'], 'project_name': app.config['PROJ_NAME']})


@app.route('/combo')
def combo1():
    print('combo')
    with pny.db_session:
        data = [(item.id, item.name) for item in Level.select(level=1)]
    return render_template('combo_view.html',
                           data={'project_list': app.config['PROJ_LIST'], 'project_name': app.config['PROJ_NAME'], 'data': data})


@app.route('/level2', methods=['POST'])
def combo2():
    print('level2')
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


@app.route('/flat')
def flat():
    return render_template('flat_search_view.html',
                           data={'project_list': app.config['PROJ_LIST'], 'project_name': app.config['PROJ_NAME']})


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


@app.route('/search', methods=['POST'])
def search_good():
    """Поиск товара в БД оборудования => добавление его в таблицу спецификации => получение из этой таблицы id
    только что добавленной позиции => возврат полной записи в JS"""
    content_type = request.headers.get('Content-Type')
    if content_type == 'application/json':
        json_request = request.json['id']
        for_specification = request.json['for_specification']
    else:
        return ['Content-Type not supported!']
    with pny.db_session:
        data = Equipment.get(id=json_request)
    request_data = {"name": data.name, 'price': int(data.price), 'hc-code': data.hc_code}

    print(f'in_specification: {for_specification}')

    if for_specification:
        request_data.update({'id': add_row(**request_data)})

    return request_data


@app.route('/new_project', methods=['POST'])
def new_project():
    content_type = request.headers.get('Content-Type')

    if content_type == 'application/json':
        project_name = request.json['name']
        project_customer = request.json['customer']
    else:
        return ['Content-Type not supported!']

    table_name = 'Proj_' + translit(project_name, 'ru', reversed=True).capitalize().strip()
    table_name = re.sub('\W', '_', table_name)
    create_date = datetime.datetime.now()
    modify_date = create_date

    try:
        get_project_table(table_name=table_name)
        with pny.db_session:
            project = Project(name=project_name,
                              table_name=table_name,
                              create_date=create_date,
                              modify_date=modify_date,
                              customer=project_customer)
    except Exception as ex:
        print(ex)
        return ['Не удалось создать новый проект!']

    return 'Ok', 200


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


@app.route('/get_project', methods=['POST'])
def get_project():
    print('get project')
    try:
        project_table = get_project_table()
        print(f'table: {project_table}')
        with pny.db_session:
            data = [{'id': item.id, 'hc-code': item.hc_code, 'name': item.name, 'price': item.price} for item in
                    pny.select(row for row in project_table)]
    except Exception as ex:
        print(ex)
        return ['Не удалось создать новый проект!']

    print(data)

    return data


def add_row(**data):
    project_table = get_project_table()
    with pny.db_session:
        new_row = project_table(hc_code=data['hc-code'], name=data['name'], price=data['price'],
                                date_add=datetime.datetime.now())
    return new_row.id


@app.route('/delete_row', methods=['POST'])
def delete_row():
    content_type = request.headers.get('Content-Type')
    if content_type == 'application/json':
        row_id = request.json['id']
    else:
        return ['Content-Type not supported!']

    print(f'delete id={row_id}')

    project_table = get_project_table()
    with pny.db_session:
        project_table[row_id].delete()

    return {'ok': 1}


@app.route('/export')
def export():
    print('export')
    with pny.db_session:
        project_table_name = Project.get(id=app.config['PROJ_ID']).table_name
        project_name = Project.get(id=app.config['PROJ_ID']).name
    conn = sqlite3.connect("data/equipment.sqlite")
    df = pd.read_sql(f'SELECT * FROM {project_table_name}', conn)
    df.to_excel('project_export.xlsx', index=False)

    return send_file(
            'project_export.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            download_name=f'{project_name}.xlsx',
            as_attachment=True
        )


@app.route('/new_kit', methods=['GET', 'POST'])
def new_kit():

    def get_new_kit_name():
        with open('prilag.txt', 'r') as prilag:
            lines = prilag.readlines()
            pril = str(random.choice(lines)).strip()
        with open('men_nouns.txt', 'r') as noun:
            lines = noun.readlines()
            noun = random.choice(lines)
        return pril + ' ' + noun

    if request.method == 'POST':
        content_type = request.headers.get('Content-Type')
        if content_type == 'application/json':
            kit_list = request.json['data']
            kit_name = request.json['name'] if request.json['name'] else get_new_kit_name()
            parent_id = request.json['parent_id']

            print('-----------------------')
            print(kit_list)
            print(parent_id)
            print(kit_name)

            # package_id = Required(int)
            # package_name = Required(str)
            # sub_equip_id = Required(int)
            # parent_id = Required(int)
            # quantity = Required(float)

            with pny.db_session:
                max_kit_id = max(pny.select(p.package_id for p in Kit)) if pny.select(p.package_id for p in Kit) else 0
                print(max_kit_id)
                for item in kit_list:
                    new_kit = Kit(package_id=max_kit_id+1,
                                  package_name=kit_name,
                                  sub_equip_id=item['id'],
                                  parent_id=parent_id,
                                  quantity=item['quantity']
                                  )

            exit(0)
        else:
            return ['Content-Type not supported!']


    return render_template('new_kit.html', data={'project_list': app.config['PROJ_LIST'], 'project_name': app.config['PROJ_NAME']})


if __name__ == '__main__':
    app.run(debug=True, port=5001)


dd = {
    'Деталь1': {
        "Набор 1": [
            {'название': "шпилька1", "количество": 6},
            {'название': "шпилька2", "количество": 4},
        ]
    }
}