-- Campus Shop Assistant Database Schema

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
    order_status character varying(20),
    total_price numeric(10,2) NOT NULL,
    create_at timestamp with time zone DEFAULT NOW()
);

-- Order_Item table
CREATE TABLE public."Order_Item" (
    order_item_id SERIAL PRIMARY KEY,
    item_id integer NOT NULL,
    buyer_id integer NOT NULL,
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
