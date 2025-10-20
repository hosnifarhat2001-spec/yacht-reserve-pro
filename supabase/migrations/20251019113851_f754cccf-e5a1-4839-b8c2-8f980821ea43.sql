-- Enable realtime for immediate updates on client
ALTER PUBLICATION supabase_realtime ADD TABLE yachts;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE promotions;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

-- Set REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE yachts REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE promotions REPLICA IDENTITY FULL;
ALTER TABLE cart_items REPLICA IDENTITY FULL;