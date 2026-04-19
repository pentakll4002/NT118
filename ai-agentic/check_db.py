import psycopg2

try:
    conn = psycopg2.connect("host=localhost port=5432 dbname=nt118 user=postgres password=postgres")
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM products")
    print("Total products:", cur.fetchone()[0])
    
    cur.execute("SELECT count(*) FROM products WHERE status = 'active'")
    print("Active products:", cur.fetchone()[0])
    
    conn.close()
except Exception as e:
    print("Error:", e)
