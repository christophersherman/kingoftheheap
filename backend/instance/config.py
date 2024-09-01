class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:mypgpass@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False