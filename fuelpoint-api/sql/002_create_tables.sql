CREATE TABLE admins (
    id            VARCHAR(50) PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255)  NOT NULL,
    role          admin_role    NOT NULL DEFAULT 'admin',
    location      VARCHAR(255),
    avatar_url    VARCHAR(500),
    joined_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admins_email ON admins (email);

CREATE TABLE discount_groups (
    id                VARCHAR(50) PRIMARY KEY,
    name              VARCHAR(100) NOT NULL UNIQUE,
    discount_percent  DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    description       TEXT,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    is_default        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_groups_single_default ON discount_groups (is_default) WHERE is_default = TRUE;
CREATE INDEX idx_groups_active ON discount_groups (is_active);

CREATE TABLE customers (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    vehicle         VARCHAR(100),
    password_hash   VARCHAR(255),
    group_id        VARCHAR(50)     NOT NULL REFERENCES discount_groups(id) ON DELETE SET DEFAULT,
    status          customer_status NOT NULL DEFAULT 'pending',
    last_activity   TIMESTAMPTZ,
    registered_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_customers_group    ON customers (group_id);
CREATE INDEX idx_customers_status   ON customers (status);
CREATE INDEX idx_customers_registered ON customers (registered_at DESC);

CREATE TABLE workers (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(120)   NOT NULL,
    email           VARCHAR(255)   NOT NULL UNIQUE,
    phone           VARCHAR(20)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    shift           worker_shift   NOT NULL DEFAULT 'Morning',
    status          worker_status  NOT NULL DEFAULT 'active',
    joined_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    last_activity   TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_workers_status ON workers (status);
CREATE INDEX idx_workers_shift  ON workers (shift);

CREATE TABLE transactions (
    id               VARCHAR(50) PRIMARY KEY,
    customer_id      VARCHAR(50)  NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    worker_id        VARCHAR(50)  NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    group_id         VARCHAR(50)  NOT NULL REFERENCES discount_groups(id) ON DELETE SET DEFAULT,
    amount           DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    discount_percent DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    discount_amount  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    litres           DECIMAL(8,1)  NOT NULL CHECK (litres > 0),
    fuel             fuel_type     NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_txn_customer  ON transactions (customer_id);
CREATE INDEX idx_txn_worker    ON transactions (worker_id);
CREATE INDEX idx_txn_group     ON transactions (group_id);
CREATE INDEX idx_txn_created   ON transactions (created_at DESC);
CREATE INDEX idx_txn_date_fuel ON transactions (created_at, fuel);

