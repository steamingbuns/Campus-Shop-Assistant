-- Reset Database Script
-- Drops all tables and recreates them from schema

-- Drop all tables with CASCADE to handle foreign key dependencies
DROP TABLE IF EXISTS 
  public."Report",
  public."Message",
  public."Review",
  public."Payment",
  public."Order_Item",
  public."Order",
  public."Cart",
  public."Product_Image",
  public."Product",
  public."Categories",
  public."User"
CASCADE;
