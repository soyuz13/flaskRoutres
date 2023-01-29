from models import Equipment, Supplier, Level
import pony.orm as pny
import pandas as pd


df = pd.read_excel('123.xlsx', sheet_name='Лист1')


@pny.db_session
def add_level1():
    level_items = df['header1'].unique().tolist()
    for item in level_items:
        header = Level(name=item, parent_id=0, level=1)


@pny.db_session
def add_level2():
    items_list = df['header2'].unique().tolist()
    for item in items_list:
        parent = df[df['header2'] == item].iloc[0]['header1']
        tekusch = item
        record = Level.get(name=parent)
        level2 = Level(name=tekusch, parent_id=record.id, level=2)


@pny.db_session
def add_level3():
    df['header3'].fillna(0, inplace=True)
    items_list = df['header3'].unique().tolist()
    for i, item in enumerate(items_list):
        if item:
            parent = df[df['header3'] == item].iloc[0]['header2']
            tekusch = item
            record = Level.get(name=parent, level=2)
            level3 = Level(name=tekusch, parent_id=record.id, level=3)
            # print(tekusch, record.id, record.name)


# add_level1()
#
# add_level2()
#
# add_level3()



@pny.db_session
def add_good_level_3():
    df = pd.read_excel('123.xlsx', sheet_name='Sheet1')
    df['name'].fillna(0, inplace=True)
    df = df[df['level'] == 3]

    for row in df.iterrows():
        row = row[1]

        name = row['name']
        price = row['price']
        name_level = row['header3']
        hc_code = row['good_id']
        level_id = Level.get(level=3, name=name_level).id

        if name:
            new_equipment = Equipment(
                name=name,
                price=price,
                level_id=level_id,
                hc_code=hc_code,
                upper_name=str(name).upper()
            )


@pny.db_session
def add_good_level_2():
    df = pd.read_excel('123.xlsx', sheet_name='Sheet1')
    df['name'].fillna(0, inplace=True)
    df = df[df['level'] == 2]

    for row in df.iterrows():
        row = row[1]

        name = row['name']
        price = row['price']
        name_level = row['header2']
        hc_code = row['good_id']
        level_id = Level.get(level=2, name=name_level).id

        if name:
            new_equipment = Equipment(
                name=name,
                price=price,
                level_id=level_id,
                hc_code=hc_code,
                upper_name=str(name).upper()
            )


add_good_level_3()
add_good_level_2()
