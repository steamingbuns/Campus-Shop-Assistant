-- Campus Shop Assistant Database Schema

-- Create schema if not exists
DROP SCHEMA IF EXISTS "public" CASCADE;
CREATE SCHEMA IF NOT EXISTS "public";

-- User table
CREATE TABLE public."User" (
    user_id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    address character varying(500),
    phone_number character varying(15),
    role character varying(20) DEFAULT 'user',
    status character varying(20) DEFAULT 'active',
    create_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Product table
CREATE TABLE public."Product" (
    product_id SERIAL PRIMARY KEY,
    seller_id integer NOT NULL,
    category_id integer NOT NULL,
    ratings integer,
    stock integer,
    description character varying(1000),
    price numeric(10,2) NOT NULL,
    status character varying(20),
    create_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    CONSTRAINT "Product_ratings_check" CHECK (((ratings >= 1) AND (ratings <= 5)))
);

-- Categories table
CREATE TABLE public."Categories" (
    category_id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    parent_category_id integer
);

-- Product_Image table
CREATE TABLE public."Product_Image" (
    image_id SERIAL PRIMARY KEY,
    item_id integer NOT NULL,
    image_url character varying(500) NOT NULL
);

-- Cart table
CREATE TABLE public."Cart" (
    cart_id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);

-- Order table
CREATE TABLE public."Order" (
    order_id SERIAL PRIMARY KEY,
    buyer_id integer NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  order_code VARCHAR(16) UNIQUE NOT NULL,
  completion_code VARCHAR(16) UNIQUE NOT NULL,
    total_price numeric(10,2) NOT NULL,
    meeting_details jsonb,
    notes text,
    create_at timestamp with time zone DEFAULT NOW()
);

-- Order_Item table
CREATE TABLE public."Order_Item" (
    order_item_id SERIAL PRIMARY KEY,
    item_id integer NOT NULL,
    order_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL
);

-- Payment table
CREATE TABLE public."Payment" (
    payment_id SERIAL PRIMARY KEY,
    order_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_status character varying(20),
    payment_method character varying(20) NOT NULL,
    create_at timestamp with time zone DEFAULT NOW()
);

-- Review table
CREATE TABLE public."Review" (
    review_id SERIAL PRIMARY KEY,
    item_id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer NOT NULL,
    rating integer,
    comment text,
    create_at timestamp with time zone DEFAULT NOW(),
    CONSTRAINT "Review_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

-- Message table
CREATE TABLE public."Message" (
    message_id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    message_text text NOT NULL,
    sent_time timestamp with time zone DEFAULT NOW(),
    is_satisfied boolean
);

-- Report table
CREATE TABLE public."Report" (
    report_id SERIAL PRIMARY KEY,
    reporter_id integer NOT NULL,
    item_id integer NOT NULL,
    reported_id integer NOT NULL,
    status character varying(20),
    create_at timestamp with time zone DEFAULT NOW()
);


-- 1) Add FK for product.seller_id -> User.user_id
ALTER TABLE public."Product"
  ADD CONSTRAINT fk_product_seller
  FOREIGN KEY (seller_id) REFERENCES public."User"(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2) Product.category_id -> Categories.category_id
ALTER TABLE public."Product"
  ADD CONSTRAINT fk_product_category
  FOREIGN KEY (category_id) REFERENCES public."Categories"(category_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) Categories.parent_category_id -> Categories.category_id (self-ref)
ALTER TABLE public."Categories"
  ADD CONSTRAINT fk_categories_parent
  FOREIGN KEY (parent_category_id) REFERENCES public."Categories"(category_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4) Product_Image.item_id -> Product.product_id
ALTER TABLE public."Product_Image"
  ADD CONSTRAINT fk_product_image_product
  FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Cart: user_id -> User and product_id -> Product
ALTER TABLE public."Cart"
  ADD CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public."Cart"
  ADD CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prevent duplicate cart items per user
ALTER TABLE public."Cart"
  ADD CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id);

-- 6) Order.buyer_id -> User.user_id
ALTER TABLE public."Order"
  ADD CONSTRAINT fk_order_buyer
  FOREIGN KEY (buyer_id) REFERENCES public."User"(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7) Order_Item: item_id -> Product, buyer_id -> User, order_id -> Order
ALTER TABLE public."Order_Item"
  ADD CONSTRAINT fk_order_item_product
    FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."Order_Item"
  ADD CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 8) Payment.order_id -> Order.order_id
ALTER TABLE public."Payment"
  ADD CONSTRAINT fk_payment_order
  FOREIGN KEY (order_id) REFERENCES public."Order"(order_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 9) Review: item_id -> Product, user_id -> User, order_id -> Order
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

-- 10) Message.user_id -> User.user_id
ALTER TABLE public."Message"
  ADD CONSTRAINT fk_message_user
  FOREIGN KEY (user_id) REFERENCES public."User"(user_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 11) Report: reporter_id -> User, reported_id -> User, item_id -> Product
ALTER TABLE public."Report"
  ADD CONSTRAINT fk_report_reporter
    FOREIGN KEY (reporter_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public."Report"
  ADD CONSTRAINT fk_report_reported
    FOREIGN KEY (reported_id) REFERENCES public."User"(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public."Report"
  ADD CONSTRAINT fk_report_product
    FOREIGN KEY (item_id) REFERENCES public."Product"(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ensure positive price, stock, quantity, rating constraints
ALTER TABLE public."Product" ADD CONSTRAINT chk_product_price_positive CHECK (price >= 0);
ALTER TABLE public."Product" ADD CONSTRAINT chk_product_stock_nonneg CHECK (stock IS NULL OR stock >= 0);

ALTER TABLE public."Order_Item" ADD CONSTRAINT chk_order_item_price_nonneg CHECK (price >= 0);
ALTER TABLE public."Order_Item" ADD CONSTRAINT chk_order_item_quantity_pos CHECK (quantity > 0);

ALTER TABLE public."Cart" ADD CONSTRAINT chk_cart_quantity_pos CHECK (quantity > 0);

-- Indexes for performance (common lookups)
CREATE INDEX idx_user_email ON public."User"(email);
CREATE INDEX idx_product_category ON public."Product"(category_id);
CREATE INDEX idx_product_seller ON public."Product"(seller_id);
CREATE INDEX idx_order_buyer ON public."Order"(buyer_id);
CREATE INDEX idx_payment_order ON public."Payment"(order_id);
