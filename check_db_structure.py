from sqlmodel import create_engine, text

engine = create_engine("postgresql://postgres:1122@localhost:5432/edudemy_db")

with engine.connect() as connection:
    result = connection.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'teacher' ORDER BY ordinal_position"))
    print("Teacher table columns:")
    for row in result:
        print(f"  - {row[0]}")