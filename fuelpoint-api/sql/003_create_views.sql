CREATE OR REPLACE VIEW v_customer_summary AS
SELECT
    c.id,
    c.name,
    c.phone,
    c.email,
    c.vehicle,
    c.group_id,
    g.name              AS group_name,
    g.discount_percent  AS group_discount,
    c.status,
    c.registered_at,
    c.last_activity,
    c.updated_at,
    COALESCE(t.tx_count, 0)         AS transactions,
    COALESCE(t.total_spend, 0)      AS total_spend,
    COALESCE(t.total_discount, 0)   AS discount_received
FROM customers c
LEFT JOIN discount_groups g ON g.id = c.group_id
LEFT JOIN LATERAL (
    SELECT
        COUNT(*)              AS tx_count,
        SUM(amount)           AS total_spend,
        SUM(discount_amount)  AS total_discount
    FROM transactions
    WHERE customer_id = c.id
) t ON TRUE;

CREATE OR REPLACE VIEW v_worker_summary AS
SELECT
    w.id,
    w.name,
    w.email,
    w.phone,
    w.shift,
    w.status,
    w.joined_at,
    w.last_activity,
    w.updated_at,
    COALESCE(t.scan_count, 0)          AS scans,
    COALESCE(t.unique_customers, 0)    AS customers_scanned,
    COALESCE(t.tx_count, 0)            AS transactions,
    COALESCE(t.total_discount, 0)      AS discount_processed
FROM workers w
LEFT JOIN LATERAL (
    SELECT
        COUNT(*)                   AS scan_count,
        COUNT(*)                   AS tx_count,
        COUNT(DISTINCT customer_id) AS unique_customers,
        SUM(discount_amount)       AS total_discount
    FROM transactions
    WHERE worker_id = w.id
) t ON TRUE;

CREATE OR REPLACE VIEW v_group_distribution AS
SELECT
    g.id,
    g.name,
    g.discount_percent,
    g.is_active,
    g.is_default,
    g.created_at,
    COUNT(DISTINCT c.id)                 AS customer_count,
    COALESCE(SUM(t.discount_amount), 0)  AS total_discount_generated,
    COUNT(t.id)                          AS transaction_count
FROM discount_groups g
LEFT JOIN customers c ON c.group_id = g.id
LEFT JOIN transactions t ON t.group_id = g.id
GROUP BY g.id;

