-- Seed Data for Campus Shop Assistant
-- Includes Users, Categories, and Products

-- 1. Insert Users (Sellers)
INSERT INTO public."User" (name, email, password_hash, address, phone_number, role, status) VALUES
('John Doe', 'john.doe@example.com', 'hash123', '123 Campus Dr', '555-0101', 'user', 'active'),
('Jane Smith', 'jane.smith@example.com', 'hash456', '456 Dorm Hall', '555-0102', 'user', 'active'),
('Bob Wilson', 'bob.wilson@example.com', 'hash789', '789 Library Ln', '555-0103', 'user', 'active'),
('Alice Brown', 'alice.brown@example.com', 'hash101', '321 Science Ct', '555-0104', 'user', 'active'),
('Mike Davis', 'mike.davis@example.com', 'hash202', '654 Arts Blvd', '555-0105', 'user', 'active');

-- 2. Insert Categories
INSERT INTO public."Categories" (name, parent_category_id) VALUES
('Textbooks', NULL),
('Electronics', NULL),
('Clothing', NULL),
('Furniture', NULL),
('Stationery', NULL),
('Miscellaneous', NULL),
('Services', NULL);

-- 3. Insert Products (approx 30 items with varied descriptions for NLP)
-- Assuming User IDs 1-5 and Category IDs 1-7 based on insertion order.
-- If IDs are not 1-based sequential in your DB, you might need to adjust or look them up.

INSERT INTO public."Product" (seller_id, category_id, ratings, stock, description, price, status) VALUES
-- Textbooks
(1, 1, 4, 1, 'Calculus: Early Transcendentals, 8th Edition. Good condition, some highlighting.', 45.00, 'active'),
(2, 1, 5, 1, 'Introduction to Algorithms (CLRS). Like new, barely used.', 60.00, 'active'),
(3, 1, 3, 1, 'Organic Chemistry textbook. Cover is a bit torn but pages are clean.', 30.00, 'active'),
(1, 1, 5, 1, 'Psychology 101 course pack. Includes all lecture notes.', 15.00, 'active'),
(4, 1, 4, 1, 'Campbell Biology. Heavy book, prefer meet up at library.', 50.00, 'active'),

-- Electronics
(2, 2, 5, 1, 'Apple AirPods Pro (1st Gen). Cleaned and sanitized. Works perfectly.', 100.00, 'active'),
(3, 2, 4, 1, 'Logitech Wireless Mouse. Battery included.', 10.00, 'active'),
(5, 2, 3, 1, 'Scientific Calculator TI-84 Plus. Missing the cover case.', 55.00, 'active'),
(1, 2, 5, 1, '24 inch Monitor. HDMI cable included. Great for coding.', 80.00, 'active'),
(4, 2, 4, 1, 'Mechanical Keyboard, Blue switches. Clicky sound.', 40.00, 'active'),
(2, 2, 2, 1, 'Old iPad Mini 2. Screen cracked but touch works. Good for parts.', 30.00, 'active'),

-- Clothing
(3, 3, 5, 1, 'University Hoodie, Size M. Navy Blue. Worn twice.', 25.00, 'active'),
(5, 3, 4, 1, 'Winter Coat, Black, Size L. Very warm.', 40.00, 'active'),
(1, 3, 5, 1, 'Nike Running Shoes, Size 10. Brand new in box.', 60.00, 'active'),
(4, 3, 3, 1, 'Denim Jacket. Vintage look.', 20.00, 'active'),
(2, 3, 5, 1, 'Graduation Gown and Cap. Height 5ft 8in.', 30.00, 'active'),

-- Furniture
(1, 4, 4, 1, 'IKEA Desk Lamp. White. LED bulb included.', 12.00, 'active'),
(5, 4, 3, 1, 'Office Chair. Height adjustable. Mesh back. One wheel sticks a bit.', 25.00, 'active'),
(3, 4, 5, 1, 'Small bedside table. Wooden finish.', 15.00, 'active'),
(2, 4, 4, 1, 'Full length mirror. No scratches.', 20.00, 'active'),
(4, 4, 2, 1, 'Bean bag chair. Needs some more beans.', 10.00, 'active'),

-- Stationery
(5, 5, 5, 10, 'Unused Notebooks. Set of 3. Lined paper.', 5.00, 'active'),
(1, 5, 5, 5, 'Pack of Ballpoint Pens. Blue ink.', 3.00, 'active'),
(3, 5, 4, 1, 'Engineering Drawing Kit. Compass and ruler included.', 12.00, 'active'),
(2, 5, 5, 2, 'Highlighters, assorted colors. Pack of 5.', 4.00, 'active'),

-- Miscellaneous / Services
(4, 6, 5, 1, 'Tennis Racket. Wilson brand. Grip recently replaced.', 35.00, 'active'),
(1, 6, 4, 1, 'Yoga Mat. Purple. Non-slip.', 10.00, 'active'),
(5, 6, 5, 1, 'Electric Kettle. Boils water fast.', 15.00, 'active'),
(3, 7, 5, 1, 'Tutoring for Math 101. $20 per hour. Flexible schedule.', 20.00, 'active'),
(2, 7, 5, 1, 'Moving help. I have a van and can help you move boxes.', 30.00, 'active'),
(1, 6, 3, 1, 'Storage box. Plastic. 50L capacity.', 8.00, 'active');
