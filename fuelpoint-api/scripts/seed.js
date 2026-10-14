import { pool } from '../src/config/database.js';

// Seeded PRNG for reproducible data
function rng(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}
const rand = rng(20260923);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const TODAY = new Date('2026-09-23T10:00:00.000Z');
const dayMs = 86400000;
const iso = (daysAgo, hour = 9, minute = 15) => {
    const d = new Date(TODAY.getTime() - daysAgo * dayMs);
    d.setUTCHours(hour, minute, 0, 0);
    return d.toISOString();
};

const firstNames = [
    'Aarav','Vivaan','Diya','Ananya','Kabir','Meera','Rohan','Ishita','Arjun','Nisha',
    'Farhan','Sana','Vikram','Priya','Dev','Tara','Imran','Kavya','Rahul','Neha',
    'Yash','Simran','Aditya','Pooja','Manav','Ritika','Zoya','Karan','Lata','Omar',
];
const lastNames = [
    'Sharma','Patel','Nair','Iyer','Khan','Reddy','Gupta','Menon','Bose','Chopra',
    'Desai','Joshi','Rao','Verma','Sethi','Kulkarni','Bhat','Mehta',
];
const vehicles = [
    'Maruti Swift','Hyundai Creta','Honda City','Tata Nexon','Royal Enfield 350',
    'Toyota Innova','Mahindra Thar','TVS Jupiter','Kia Seltos','Ashok Leyland Truck',
];
const fuels = ['Petrol', 'Diesel', 'CNG'];

async function runSeed() {
    console.log('🚀 Starting comprehensive data seeding...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Clear existing tables
        console.log('🧹 Cleaning existing data...');
        await client.query(`
            TRUNCATE TABLE notifications, transactions, customers, workers, discount_groups, admins, audit_log CASCADE;
        `);

        // 1. Insert Admin
        console.log('👤 Seeding Admin...');
        const adminId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        await client.query(`
            INSERT INTO admins (id, name, email, phone, password_hash, role, location, joined_at)
            VALUES (
                $1,
                'Nikhil Hirwania', 
                'hirwanianikhil25@gmail.com', 
                '+91 98204 41120',
                '$2b$10$EPVkWLzI5M0RkVbU.85vSu4y.Y7J3o7v7h8924b1234567890123',
                'super_admin', 
                'Pune, Maharashtra', 
                NOW() - INTERVAL '720 days'
            );
        `, [adminId]);

        // 2. Insert Discount Groups
        console.log('🏷️ Seeding Discount Groups...');
        const groupConfigs = [
            { id: 'grp-default', name: 'Default / Customer', discount: 0.00, desc: 'New registrations land here until an admin assigns a group.', is_default: true, is_active: true, days: 400 },
            { id: 'grp-family', name: 'Family', discount: 2.00, desc: 'Owner family members and relatives.', is_default: false, is_active: true, days: 360 },
            { id: 'grp-friends', name: 'Friends', discount: 1.00, desc: 'Close friends and long-standing personal contacts.', is_default: false, is_active: true, days: 352 },
            { id: 'grp-employees', name: 'Employees', discount: 3.00, desc: 'Staff of the pump and partner businesses.', is_default: false, is_active: true, days: 340 },
            { id: 'grp-fleet', name: 'Fleet Partners', discount: 2.50, desc: 'Contracted logistics and taxi fleets.', is_default: false, is_active: true, days: 120 },
            { id: 'grp-legacy', name: 'Festive 2025', discount: 1.50, desc: 'Seasonal campaign group, currently paused.', is_default: false, is_active: false, days: 300 },
        ];

        const groupMap = {};
        for (const g of groupConfigs) {
            const res = await client.query(`
                INSERT INTO discount_groups (id, name, discount_percent, description, is_default, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW() - ($7 || ' days')::INTERVAL)
                RETURNING id, name, discount_percent;
            `, [g.id, g.name, g.discount, g.desc, g.is_default, g.is_active, g.days]);
            groupMap[g.name] = res.rows[0];
        }

        const defaultGroup = groupMap['Default / Customer'];

        // 3. Insert Workers
        console.log('👷 Seeding Workers...');
        const workerNames = [
            'Suresh Kumar','Anita Deshmukh','Ravi Shankar','Pooja Bansal','Imtiaz Ali',
            'Deepak Yadav','Sneha Kulkarni','Manoj Pillai','Farida Sheikh','Naveen Rathore',
        ];
        const workers = [];
        for (let i = 0; i < workerNames.length; i++) {
            const id = `WRK-${String(i + 1).padStart(3, "0")}`;
            const name = workerNames[i];
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@fuelpoint.in`;
            const phone = `+91 9${between(100000000, 899999999)}`;
            const shift = ['Morning', 'Evening', 'Night'][i % 3];
            const status = i === 8 ? 'suspended' : i % 3 === 2 ? 'offline' : 'active';
            const daysAgo = between(60, 700);

            const res = await client.query(`
                INSERT INTO workers (id, name, email, phone, shift, status, joined_at, last_activity)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, name;
            `, [
                id,
                name, 
                email, 
                phone, 
                shift, 
                status, 
                iso(daysAgo), 
                status === 'active' ? iso(0) : iso(between(1, 14), between(7, 21), between(0, 59))
            ]);
            workers.push(res.rows[0]);
        }

        // 4. Insert 96 Customers
        console.log('👥 Seeding 96 Customers...');
        const customerList = [];
        for (let i = 0; i < 96; i++) {
            const id = `CUS-${String(1000 + i)}`;
            const name = `${pick(firstNames)} ${pick(lastNames)}`;
            const phone = `+91 8${String(between(100000000, 899999999))}`;
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}${i}@mail.com`;
            const vehicle = pick(vehicles);

            // Group selection
            const r = rand();
            let selectedGroup = defaultGroup;
            if (r >= 0.14 && r < 0.4) selectedGroup = groupMap['Family'];
            else if (r >= 0.4 && r < 0.62) selectedGroup = groupMap['Friends'];
            else if (r >= 0.62 && r < 0.82) selectedGroup = groupMap['Employees'];
            else if (r >= 0.82 && r < 0.95) selectedGroup = groupMap['Fleet Partners'];
            else if (r >= 0.95) selectedGroup = groupMap['Festive 2025'];

            const registeredDaysAgo = between(0, 320);
            const status = selectedGroup.is_default && registeredDaysAgo < 6
                ? 'pending'
                : registeredDaysAgo > 250
                    ? 'inactive'
                    : 'active';

            const res = await client.query(`
                INSERT INTO customers (id, name, phone, email, vehicle, group_id, status, registered_at, last_activity)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, name, group_id, status;
            `, [
                id,
                name,
                phone,
                email,
                vehicle,
                selectedGroup.id,
                status,
                iso(registeredDaysAgo, between(8, 20), between(0, 59)),
                iso(between(0, 40), between(7, 22), between(0, 59))
            ]);
            customerList.push({
                ...res.rows[0],
                group_percent: selectedGroup.discount_percent,
                registeredDaysAgo
            });
        }

        // 5. Insert 420 Transactions
        console.log('⛽ Seeding 420 Transactions...');
        const activeCustomers = customerList.filter(c => c.status !== 'pending' && c.registeredDaysAgo > 2);
        
        for (let i = 0; i < 420; i++) {
            const id = `TXN-${String(90000 + i)}`;
            const customer = pick(activeCustomers.length > 0 ? activeCustomers : customerList);
            const worker = pick(workers);
            const amount = between(450, 4800);
            const discountPercent = Number(customer.group_percent) || 0;
            const discountAmount = Math.round((amount * discountPercent) / 100 * 100) / 100;
            const litres = Math.round((amount / 104) * 10) / 10;
            const fuel = pick(fuels);
            const daysAgo = between(0, 89);
            const createdAt = iso(daysAgo, between(6, 23), between(0, 59));

            await client.query(`
                INSERT INTO transactions (id, customer_id, worker_id, group_id, amount, discount_percent, discount_amount, litres, fuel, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            `, [
                id,
                customer.id,
                worker.id,
                customer.group_id,
                amount,
                discountPercent,
                discountAmount,
                litres,
                fuel,
                createdAt
            ]);
        }

        // 6. Insert Notifications
        console.log('🔔 Seeding Notifications...');
        const recentPending = customerList
            .filter(c => c.status === 'pending')
            .slice(0, 6);

        for (let i = 0; i < recentPending.length; i++) {
            const id = `NTF-R${i}`;
            const c = recentPending[i];
            await client.query(`
                INSERT INTO notifications (id, type, title, message, is_read, customer_id, admin_id, created_at)
                VALUES (
                    $1,
                    'registration',
                    'New customer registration — group assignment required',
                    $2,
                    $3,
                    $4,
                    $5,
                    NOW() - ($6 || ' hours')::INTERVAL
                );
            `, [
                id,
                `${c.name} registered and is currently in Default / Unassigned.`,
                i > 3,
                c.id,
                adminId,
                i * 4 + 2
            ]);
        }

        await client.query('COMMIT');
        console.log('✨ All 96 Customers, 10 Workers, 6 Groups, 420 Transactions, and Notifications seeded successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runSeed();

