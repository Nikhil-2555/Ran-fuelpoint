-- ============================================================
-- SEED DATA — Matches the current mock data in the frontend
-- ============================================================

-- 5.1 Default Admin
INSERT INTO admins (name, email, phone, password_hash, role, location, joined_at) VALUES
('Rajesh Menon', 'rajesh.menon@fuelpoint.in', '+91 98204 41120',
 '$2b$10$placeholder_hash_replace_with_real_bcrypt',  -- bcrypt hash of 'fuelpoint'
 'super_admin', 'Pune, Maharashtra', NOW() - INTERVAL '720 days');

-- 5.2 Discount Groups
INSERT INTO discount_groups (name, discount_percent, description, is_active, is_default, created_at) VALUES
('Default / Customer', 0.00, 'New registrations land here until an admin assigns a group.', TRUE, TRUE, NOW() - INTERVAL '400 days'),
('Family',             2.00, 'Owner family members and relatives.',                         TRUE, FALSE, NOW() - INTERVAL '360 days'),
('Friends',            1.00, 'Close friends and long-standing personal contacts.',           TRUE, FALSE, NOW() - INTERVAL '352 days'),
('Employees',          3.00, 'Staff of the pump and partner businesses.',                    TRUE, FALSE, NOW() - INTERVAL '340 days'),
('Fleet Partners',     2.50, 'Contracted logistics and taxi fleets.',                        TRUE, FALSE, NOW() - INTERVAL '120 days'),
('Festive 2025',       1.50, 'Seasonal campaign group, currently paused.',                   FALSE, FALSE, NOW() - INTERVAL '300 days');

-- 5.3 Workers
INSERT INTO workers (name, email, phone, shift, status, joined_at, last_activity) VALUES
('Suresh Kumar',     'suresh.kumar@fuelpoint.in',     '+91 9123456780', 'Morning', 'active',    NOW() - INTERVAL '500 days', NOW()),
('Anita Deshmukh',   'anita.deshmukh@fuelpoint.in',   '+91 9234567891', 'Evening', 'active',    NOW() - INTERVAL '450 days', NOW()),
('Ravi Shankar',     'ravi.shankar@fuelpoint.in',     '+91 9345678902', 'Night',   'offline',   NOW() - INTERVAL '400 days', NOW() - INTERVAL '3 days'),
('Pooja Bansal',     'pooja.bansal@fuelpoint.in',     '+91 9456789013', 'Morning', 'active',    NOW() - INTERVAL '350 days', NOW()),
('Imtiaz Ali',       'imtiaz.ali@fuelpoint.in',       '+91 9567890124', 'Evening', 'active',    NOW() - INTERVAL '300 days', NOW()),
('Deepak Yadav',     'deepak.yadav@fuelpoint.in',     '+91 9678901235', 'Night',   'offline',   NOW() - INTERVAL '250 days', NOW() - INTERVAL '5 days'),
('Sneha Kulkarni',   'sneha.kulkarni@fuelpoint.in',   '+91 9789012346', 'Morning', 'active',    NOW() - INTERVAL '200 days', NOW()),
('Manoj Pillai',     'manoj.pillai@fuelpoint.in',     '+91 9890123457', 'Evening', 'active',    NOW() - INTERVAL '150 days', NOW()),
('Farida Sheikh',    'farida.sheikh@fuelpoint.in',    '+91 9901234568', 'Night',   'suspended', NOW() - INTERVAL '100 days', NOW() - INTERVAL '2 days'),
('Naveen Rathore',   'naveen.rathore@fuelpoint.in',   '+91 9012345679', 'Morning', 'active',    NOW() - INTERVAL '60 days',  NOW());
