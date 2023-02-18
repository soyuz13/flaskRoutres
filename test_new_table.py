import pony.orm as pny
from datetime import datetime
from models import create_project_table_entity

import re

# db2 = pny.Database("sqlite", "data/equipment.sqlite") #, create_db=True)
# table_name = 'Proj_Zakaz_na_taffi_tramvajnaja_57'
# Project = create_project_table_entity(db2.Entity)
# db2.generate_mapping(create_tables=True)
#
# try:
#     with pny.db_session:
#         db2.execute(f'DROP TABLE {table_name}')
#         deltab = pny.delete(t for t in Project if t.table_name == table_name)
# except Exception as ex:
#     print(ex)

# print(deltab)


# name = "Pr oj_No(v)yj_hr.', enov yj_noven'kij"
#
# name2 = re.sub('\W', '_', name)
#
# print(name2)

# new_table = type(table_name, (db2.Entity,), {
#     'id': pny.PrimaryKey(int, auto=True),
#     'hc_code': pny.Optional(str),
#     'name': pny.Required(str),
#     'price': pny.Optional(float)
# })


def make_men_nouns():
    lst = []
    with open('russian_nouns_with_definition.txt', 'r') as fil:
        while True:
            file_line = fil.readline()
            if not file_line:
                break
            if re.search(': м. ', file_line):
                st = file_line[:re.search(': м. ', file_line).span()[0]]
                lst.append(st + '\n')

    lst[-1] = lst[-1][:-1]
    with open('men_nouns.txt', 'w') as fil:
        fil.writelines(lst)


import random
import time


for i in range(10):

    with open('prilag.txt', 'r') as prilag:
        lines = prilag.readlines()
        pril = str(random.choice(lines)).strip()

    with open('men_nouns.txt', 'r') as noun:
        lines = noun.readlines()
        noun = str(random.choice(lines)).strip()

    print(pril + ' ' + noun)

    time.sleep(1)