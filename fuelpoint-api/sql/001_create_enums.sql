-- Custom ENUM types for constrained columns
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE worker_status   AS ENUM ('active', 'offline', 'suspended');
CREATE TYPE worker_shift    AS ENUM ('Morning', 'Evening', 'Night');
CREATE TYPE fuel_type       AS ENUM ('Petrol', 'Diesel', 'CNG');
CREATE TYPE admin_role      AS ENUM ('super_admin', 'admin');
   

