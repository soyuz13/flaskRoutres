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


name = "Pr oj_No(v)yj_hr.', enov yj_noven'kij"

name2 = re.sub('\W', '_', name)

print(name2)

# new_table = type(table_name, (db2.Entity,), {
#     'id': pny.PrimaryKey(int, auto=True),
#     'hc_code': pny.Optional(str),
#     'name': pny.Required(str),
#     'price': pny.Optional(float)
# })


