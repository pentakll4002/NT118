const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:postgres@localhost:5432/nt118' });

async function run() { 
  await client.connect(); 
  await client.query(`
    INSERT INTO user_addresses (user_id, recipient_name, recipient_phone, province, district, ward, street_address, is_default, created_at) 
    SELECT id, 'Khách hàng', '0987654321', 'Kiên Giang', 'Phú Quốc', 'Dương Đông', 'Bến tàu', true, NOW() 
    FROM users 
    WHERE id NOT IN (SELECT user_id FROM user_addresses);
  `); 
  console.log('Done!'); 
  process.exit(0); 
} 
run();
