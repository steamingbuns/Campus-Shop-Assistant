-- ============================================================
-- Campus Shop Assistant — Database Schema (admin-ready)
-- Safe to re-run: uses IF NOT EXISTS where possible
-- ============================================================

-- =========================
-- Users
-- =========================
CREATE TABLE IF NOT EXISTS public."User" (
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    address        VARCHAR(500),
    phone_number   VARCHAR(15),
    role           VARCHAR(20) DEFAULT 'user',
    status         VARCHAR(20) DEFAULT 'active',
    create_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Admin use-case: warnings counter (idempotent)
ALTER TABLE public."User"
  ADD COLUMN IF NOT EXISTS warnings INTEGER DEFAULT 0;

-- Helpful composite index for admin filters
CREATE INDEX IF NOT EXISTS idx_user_role_status
  ON public."User"(role, status);

-- =========================
-- Categories
-- =========================
CREATE TABLE IF NOT EXISTS public."Categories" (
    category_id         SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    parent_category_id  INTEGER
    -- (FK optional; omitted for flexibility)
);

-- =========================
-- Products (treated as "Listings" in Admin UI)
-- =========================
CREATE TABLE IF NOT EXISTS public."Product" (
    product_id   SERIAL PRIMARY KEY,
    seller_id    INTEGER NOT NULL,
    category_id  INTEGER NOT NULL,
    ratings      INTEGER,
    stock        INTEGER,
    description  VARCHAR(1000),
    price        NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20),
    create_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "Product_ratings_check" CHECK (ratings IS NULL OR (ratings >= 1 AND ratings <= 5))
    -- FK suggestions (uncomment if you want hard guarantees):
    -- ,CONSTRAINT fk_product_seller  FOREIGN KEY (seller_id)   REFERENCES public."User"(user_id)       ON DELETE CASCADE
    -- ,CONSTRAINT fk_product_cat     FOREIGN KEY (category_id) REFERENCES public."Categories"(category_id) ON DELETE RESTRICT
);

-- Moderation-friendly default + index for status filtering (idempotent)
ALTER TABLE public."Product"
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_product_status
  ON public."Product"(status);

-- =========================
-- Product Images
-- =========================
CREATE TABLE IF NOT EXISTS public."Product_Image" (
    image_id  SERIAL PRIMARY KEY,
    item_id   INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL
    -- Suggested FK:
    -- ,CONSTRAINT fk_prodimg_item FOREIGN KEY (item_id) REFERENCES public."Product"(product_id) ON DELETE CASCADE
);

-- =========================
-- Cart
-- =========================
CREATE TABLE IF NOT EXISTS public."Cart" (
    cart_id    SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL
    -- Suggested FKs:
    -- ,CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES public."User"(user_id)     ON DELETE CASCADE
    -- ,CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES public."Product"(product_id) ON DELETE CASCADE
);
-- Optional: avoid duplicate cart rows per (user, product)
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_cart_user_product ON public."Cart"(user_id, product_id);

-- =========================
-- Orders
-- =========================
CREATE TABLE IF NOT EXISTS public."Order" (
    order_id    SERIAL PRIMARY KEY,
    buyer_id    INTEGER NOT NULL,
    order_status VARCHAR(20),
    total_price NUMERIC(10,2) NOT NULL,
    create_at   TIMESTAMPTZ DEFAULT NOW()
    -- Suggested FK:
    -- ,CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES public."User"(user_id) ON DELETE RESTRICT
);

-- =========================
-- Order Items
-- =========================
CREATE TABLE IF NOT EXISTS public."Order_Item" (
    order_item_id SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL,
    buyer_id      INTEGER NOT NULL,
    order_id      INTEGER NOT NULL,
    price         NUMERIC(10,2) NOT NULL,
    quantity      INTEGER NOT NULL
    -- Suggested FKs:
    -- ,CONSTRAINT fk_orderitem_item  FOREIGN KEY (item_id)  REFERENCES public."Product"(product_id) ON DELETE RESTRICT
    -- ,CONSTRAINT fk_orderitem_buyer FOREIGN KEY (buyer_id) REFERENCES public."User"(user_id)       ON DELETE RESTRICT
    -- ,CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)     ON DELETE CASCADE
);

-- =========================
-- Payments
-- =========================
CREATE TABLE IF NOT EXISTS public."Payment" (
    payment_id    SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL,
    amount        NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20),
    payment_method VARCHAR(20) NOT NULL,
    create_at     TIMESTAMPTZ DEFAULT NOW()
    -- Suggested FK:
    -- ,CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES public."Order"(order_id) ON DELETE CASCADE
);

-- =========================
-- Reviews
-- =========================
CREATE TABLE IF NOT EXISTS public."Review" (
    review_id  SERIAL PRIMARY KEY,
    item_id    INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    order_id   INTEGER NOT NULL,
    rating     INTEGER,
    comment    TEXT,
    create_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "Review_rating_check" CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
    -- Suggested FKs:
    -- ,CONSTRAINT fk_review_item  FOREIGN KEY (item_id)  REFERENCES public."Product"(product_id) ON DELETE RESTRICT
    -- ,CONSTRAINT fk_review_user  FOREIGN KEY (user_id)  REFERENCES public."User"(user_id)       ON DELETE RESTRICT
    -- ,CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)     ON DELETE CASCADE
);

-- =========================
-- Messages (used for admin warn/suspend audit if desired)
-- =========================
CREATE TABLE IF NOT EXISTS public."Message" (
    message_id   SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    sent_time    TIMESTAMPTZ DEFAULT NOW(),
    is_satisfied BOOLEAN
    -- Suggested FK:
    -- ,CONSTRAINT fk_message_user FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON DELETE CASCADE
);

-- =========================
-- Reports (user -> item/user reports; status is free-form)
-- =========================
CREATE TABLE IF NOT EXISTS public."Report" (
    report_id    SERIAL PRIMARY KEY,
    reporter_id  INTEGER NOT NULL,
    item_id      INTEGER NOT NULL,
    reported_id  INTEGER NOT NULL,
    status       VARCHAR(20),
    create_at    TIMESTAMPTZ DEFAULT NOW()
    -- Suggested FKs:
    -- ,CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES public."User"(user_id)     ON DELETE CASCADE
    -- ,CONSTRAINT fk_report_item     FOREIGN KEY (item_id)     REFERENCES public."Product"(product_id) ON DELETE CASCADE
    -- ,CONSTRAINT fk_report_reported FOREIGN KEY (reported_id) REFERENCES public."User"(user_id)     ON DELETE CASCADE
);

-- ============================================================
-- Auto-update updated_at on UPDATE for User & Product
-- (Safe to re-run: drop trigger if exists, recreate)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_updated_at   ON public."User";
CREATE TRIGGER trg_user_updated_at
BEFORE UPDATE ON public."User"
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_product_updated_at ON public."Product";
CREATE TRIGGER trg_product_updated_at
BEFORE UPDATE ON public."Product"
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================
-- End of schema
-- ============================================================
