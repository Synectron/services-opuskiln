ALTER TABLE shop_settings ADD COLUMN magicpin TEXT NOT NULL DEFAULT '';

UPDATE shop_settings
SET magicpin = 'https://magicpin.in/Allahabad/Naini/Restaurant/Pure-Veg-Rkn-Punjabi-Soya-Chaap/store/203c06a'
WHERE id = 1;
