-- ============================================================
-- Campus Shop Assistant — Database Schema
-- Rebuilds all tables for a fresh environment
-- ============================================================

DROP SCHEMA IF EXISTS "public" CASCADE;
CREATE SCHEMA IF NOT EXISTS "public";

-- =========================
-- Users
-- =========================
CREATE TABLE public."User" (
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    address        VARCHAR(500),
    phone_number   VARCHAR(15),
    role           VARCHAR(20) DEFAULT 'user',
    status         VARCHAR(20) DEFAULT 'active',
    warnings       INTEGER DEFAULT 0,
    create_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_role_status ON public."User"(role, status);
CREATE INDEX idx_user_email ON public."User"(email);

-- =========================
-- Categories
-- =========================
CREATE TABLE public."Categories" (
    category_id         SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    parent_category_id  INTEGER
);

-- =========================
-- Products (treated as "Listings" in Admin UI)
-- =========================
CREATE TABLE public."Product" (
    product_id   SERIAL PRIMARY KEY,
    seller_id    INTEGER NOT NULL,
    category_id  INTEGER NOT NULL,
    name         VARCHAR(255) NOT NULL,
    sku          VARCHAR(100),
    ratings      INTEGER,
    stock        INTEGER,
    low_stock_threshold INTEGER DEFAULT 10,
    description  VARCHAR(1000),
    price        NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20) DEFAULT 'pending',
    create_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "Product_ratings_check" CHECK (ratings IS NULL OR (ratings >= 1 AND ratings <= 5))
);

CREATE INDEX idx_product_status ON public."Product"(status);

-- =========================
-- Product Images
-- =========================
CREATE TABLE public."Product_Image" (
    image_id  SERIAL PRIMARY KEY,
    item_id   INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL
);

-- =========================
-- Cart
-- =========================
CREATE TABLE public."Cart" (
    cart_id    SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity   INTEGER NOT NULL
);

-- =========================
-- Orders
-- =========================
CREATE TABLE public."Order" (
    order_id         SERIAL PRIMARY KEY,
    buyer_id         INTEGER NOT NULL,
    status           VARCHAR(255) NOT NULL DEFAULT 'pending',
    order_code       VARCHAR(16) UNIQUE NOT NULL,
    completion_code  VARCHAR(16) UNIQUE NOT NULL,
    total_price      NUMERIC(10,2) NOT NULL,
    meeting_details  JSONB,
    notes            TEXT,
    create_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- Order Items
-- =========================
CREATE TABLE public."Order_Item" (
    order_item_id SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL,
    order_id      INTEGER NOT NULL,
    price         NUMERIC(10,2) NOT NULL,
    quantity      INTEGER NOT NULL
);

-- =========================
-- Payments
-- =========================
CREATE TABLE public."Payment" (
    payment_id     SERIAL PRIMARY KEY,
    order_id       INTEGER NOT NULL,
    amount         NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20),
    payment_method VARCHAR(20) NOT NULL,
    create_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- Reviews
-- =========================
CREATE TABLE public."Review" (
    review_id  SERIAL PRIMARY KEY,
    item_id    INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    order_id   INTEGER NOT NULL,
    rating     INTEGER,
    comment    TEXT,
    create_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "Review_rating_check" CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- =========================
-- Messages
-- =========================
CREATE TABLE public."Message" (
    message_id   SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    sent_time    TIMESTAMPTZ DEFAULT NOW(),
    is_satisfied BOOLEAN
);

-- =========================
-- Reports
-- =========================
CREATE TABLE public."Report" (
    report_id    SERIAL PRIMARY KEY,
    reporter_id  INTEGER NOT NULL,
    item_id      INTEGER NOT NULL,
    details      TEXT,
    status       VARCHAR(20),
    create_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Foreign Keys & Constraints
-- ============================================================
ALTER TABLE public."Product"
  ADD CONSTRAINT fk_product_seller
  FOREIGN KEY (seller_id) REFERENCES public."User"(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Product"
  ADD CONSTRAINT fk_product_category
  FOREIGN KEY (category_id) REFERENCES public."Categories"(category_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Categories"
  ADD CONSTRAINT fk_categories_parent
  FOREIGN KEY (parent_category_id) REFERENCES public."Categories"(category_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."Product_Image"
  ADD CONSTRAINT fk_product_image_product
  FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Cart"
  ADD CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Cart"
  ADD CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Cart"
  ADD CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id);

ALTER TABLE public."Order"
  ADD CONSTRAINT fk_order_buyer
  FOREIGN KEY (buyer_id) REFERENCES public."User"(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Order_Item"
  ADD CONSTRAINT fk_order_item_product
    FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Order_Item"
  ADD CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Payment"
  ADD CONSTRAINT fk_payment_order
  FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Review"
  ADD CONSTRAINT fk_review_product
    FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Review"
  ADD CONSTRAINT fk_review_user
    FOREIGN KEY (user_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Review"
  ADD CONSTRAINT fk_review_order
    FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Message"
  ADD CONSTRAINT fk_message_user
  FOREIGN KEY (user_id) REFERENCES public."User"(user_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Report"
  ADD CONSTRAINT fk_report_reporter
    FOREIGN KEY (reporter_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Report"
  ADD CONSTRAINT fk_report_product
    FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Validation constraints
ALTER TABLE public."Product" ADD CONSTRAINT chk_product_price_positive CHECK (price >= 0);
ALTER TABLE public."Product" ADD CONSTRAINT chk_product_stock_nonneg CHECK (stock IS NULL OR stock >= 0);
ALTER TABLE public."Order_Item" ADD CONSTRAINT chk_order_item_price_nonneg CHECK (price >= 0);
ALTER TABLE public."Order_Item" ADD CONSTRAINT chk_order_item_quantity_pos CHECK (quantity > 0);
ALTER TABLE public."Cart" ADD CONSTRAINT chk_cart_quantity_pos CHECK (quantity > 0);

-- Performance indexes
CREATE INDEX idx_product_category ON public."Product"(category_id);
CREATE INDEX idx_product_seller ON public."Product"(seller_id);
CREATE INDEX idx_order_buyer ON public."Order"(buyer_id);
CREATE INDEX idx_payment_order ON public."Payment"(order_id);

-- ============================================================
-- Auto-update updated_at on UPDATE for User & Product
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
