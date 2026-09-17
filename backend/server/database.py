from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base


SQLALCHEMY_DATABASE_URL = "sqlite:///./roamlocal.db"



#Here roam DB is a home and main.py is the main factpry and now you need to engine to share the data that is we are creating 

engine  = create_engine(SQLALCHEMY_DATABASE_URL , connect_args = {"check_same_thread" : False})


SessionLocal = sessionmaker(autocommit = False , autoflush = False , bind =  engine)


Base =  declarative_base()

def get_db():

    db = SessionLocal()

    try : 
        yield db # Here yeild is like telling database that do your job , I am waiting over  here
    finally :
        db.close()


