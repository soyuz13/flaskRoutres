from pony.orm import *
from datetime import datetime


db = Database("sqlite", "data/equipment.sqlite") #, create_db=True)


class Level(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    parent_id = Required(int)
    level = Required(int)
    level_id = Set('Equipment')


class Equipment(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    upper_name = Required(str)
    price = Optional(float)
    level_id = Required(Level)
    hc_code = Optional(str)
    supplier_id = Set('Supplier')


class Supplier(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    equipment_code = Set(Equipment)


class Project(db.Entity):
    id = PrimaryKey(int, auto=True, unsigned=True)
    name = Required(str)
    table_name = Required(str)
    create_date = Required(datetime)
    modify_date = Optional(datetime)
    customer = Optional(str)


# sql_debug(True)
db.generate_mapping(create_tables=True)
