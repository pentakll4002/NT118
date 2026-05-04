-- Seed 6 vouchers for testing
INSERT INTO vouchers (code, name, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date, is_active, created_by, created_at)
VALUES
-- 1. 20% discount up to 200k
('SALE20', 'Giảm 20% hóa đơn', 'Giảm 20% cho tất cả sản phẩm, tối đa 200,000đ', 'percentage'::voucher_discount_type, 20, 100000, 200000, 100, NOW(), NOW() + INTERVAL '30 days', true, 1, NOW()),

-- 2. Fixed 50k discount
('SAVE50K', 'Giảm 50,000đ', 'Giảm cố định 50,000đ cho đơn hàng từ 200,000đ', 'fixed'::voucher_discount_type, 50000, 200000, NULL, 50, NOW(), NOW() + INTERVAL '30 days', true, 1, NOW()),

-- 3. Freeship voucher (30k discount - typical freeship value)
('FREESHIP', 'Miễn phí vận chuyển', 'Giảm 30,000đ phí vận chuyển cho đơn hàng từ 50,000đ', 'fixed'::voucher_discount_type, 30000, 50000, 30000, 200, NOW(), NOW() + INTERVAL '30 days', true, 1, NOW()),

-- 4. 15% discount up to 150k
('SUMMER15', 'Mùa hè - Giảm 15%', 'Giảm 15% cho tất cả sản phẩm trong mùa hè, tối đa 150,000đ', 'percentage'::voucher_discount_type, 15, 100000, 150000, 75, NOW(), NOW() + INTERVAL '30 days', true, 1, NOW()),

-- 5. Fixed 30k discount
('WELCOME30K', 'Chào mừng - Giảm 30,000đ', 'Giảm cố định 30,000đ cho khách mới, tối thiểu 150,000đ', 'fixed'::voucher_discount_type, 30000, 150000, NULL, 100, NOW(), NOW() + INTERVAL '45 days', true, 1, NOW()),

-- 6. 10% discount no max
('LOYALTY10', 'Quà tặng khách trung thành', 'Giảm 10% cho tất cả sản phẩm, áp dụng cho đơn từ 50,000đ', 'percentage'::voucher_discount_type, 10, 50000, NULL, NULL, NOW(), NOW() + INTERVAL '60 days', true, 1, NOW())

ON CONFLICT (code) DO NOTHING;

-- Verify data
SELECT 'Voucher seed completed' as message, COUNT(*) as total_vouchers FROM vouchers;
