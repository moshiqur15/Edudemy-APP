from sqlmodel import create_engine, text

engine = create_engine("postgresql://postgres:1122@localhost:5432/edudemy_db")

with engine.connect() as conn:
    conn.execute(text("UPDATE student SET gender = UPPER(gender)"))
    conn.commit()
    print("Gender values updated to uppercase")