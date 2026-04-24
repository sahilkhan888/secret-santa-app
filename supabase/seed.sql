-- Seed data for local development.
-- One active event (`holiday-2026`) and 20 participants across 5 teams.

insert into events (
  id,
  name,
  slug,
  registration_opens_at,
  registration_closes_at,
  reveal_at,
  gifting_day,
  status
) values (
  '00000000-0000-0000-0000-000000000001',
  'Entri Holiday 2026',
  'holiday-2026',
  now() - interval '2 days',
  now() + interval '14 days',
  now() + interval '30 days',
  (now() + interval '32 days')::date,
  'open'
);

insert into participants (event_id, name, team, email, budget_amount, wishlist_likes, wishlist_dislikes, hot_drink, shirt_size) values
  ('00000000-0000-0000-0000-000000000001', 'Asha Pillai',     'Engineering', 'asha@example.com',     1000, 'Sci-fi novels, pour-over coffee, mechanical keyboards', 'Anything with chocolate',        'coffee',  'm'),
  ('00000000-0000-0000-0000-000000000001', 'Bhavin Menon',    'Engineering', 'bhavin@example.com',   1000, 'Plants, board games, good whiskey',                    'Scented candles',                'tea',     'l'),
  ('00000000-0000-0000-0000-000000000001', 'Chitra Das',      'Engineering', 'chitra@example.com',   1500, 'Cycling gear, audiobooks, pottery',                    'Anything electronic',            'coffee',  's'),
  ('00000000-0000-0000-0000-000000000001', 'Dev Krishnan',    'Engineering', 'dev@example.com',      3000, 'Vinyl records, leather goods, single malts',           'Branded merchandise',            'neither', 'xl'),
  ('00000000-0000-0000-0000-000000000001', 'Esha Rao',        'Engineering', 'esha@example.com',     1000, 'Baking supplies, Japanese stationery, dark chocolate', 'Strong perfume',                 'tea',     'm'),
  ('00000000-0000-0000-0000-000000000001', 'Faizal Ahmed',    'Engineering', 'faizal@example.com',    500, 'Running socks, energy gels, podcasts',                 'Wine',                           'coffee',  'l'),
  ('00000000-0000-0000-0000-000000000001', 'Gitanjali Roy',   'Engineering', 'gita@example.com',     1500, 'Watercolours, indie magazines, jazz',                  'Fast fashion',                   'tea',     's'),
  ('00000000-0000-0000-0000-000000000001', 'Harsh Vardhan',   'Engineering', 'harsh@example.com',    1000, 'Tabletop games, climbing gear, hot sauce',             'Candles',                        'coffee',  'l'),
  ('00000000-0000-0000-0000-000000000001', 'Ila Srinivasan',  'Design',      'ila@example.com',      1000, 'Typography books, fountain pens, olive oil',           'Plastic tchotchkes',             'coffee',  'm'),
  ('00000000-0000-0000-0000-000000000001', 'Jatin Kapoor',    'Design',      'jatin@example.com',    1000, 'Polaroid film, zines, good pasta',                     'Anything Apple-branded',         'tea',     'l'),
  ('00000000-0000-0000-0000-000000000001', 'Keerthana Shah',  'Design',      'keerthana@example.com', 500, 'Plants, beeswax candles, ceramics',                    'Leather goods',                  'neither', 's'),
  ('00000000-0000-0000-0000-000000000001', 'Lakshmi Iyer',    'Design',      'lakshmi@example.com',  1500, 'Cookbooks, linen napkins, mezcal',                     'Puzzle games',                   'coffee',  'm'),
  ('00000000-0000-0000-0000-000000000001', 'Mohan Bhatt',     'Sales',       'mohan@example.com',    1000, 'Cricket gear, spicy snacks, films',                    'Flowers',                        'coffee',  'xl'),
  ('00000000-0000-0000-0000-000000000001', 'Nisha Verma',     'Sales',       'nisha@example.com',    1000, 'Silk scarves, tea sets, historical fiction',           'Gym equipment',                  'tea',     'xs'),
  ('00000000-0000-0000-0000-000000000001', 'Omkar Patil',     'Sales',       'omkar@example.com',    3000, 'Craft beer, golf accessories, travel gear',            'Self-help books',                'coffee',  'xxl'),
  ('00000000-0000-0000-0000-000000000001', 'Pooja Nair',      'Ops',         'pooja@example.com',     500, 'Socks, bookmarks, lip balm',                           'Anything loud',                  'tea',     'm'),
  ('00000000-0000-0000-0000-000000000001', 'Qasim Hussain',   'Ops',         'qasim@example.com',    1000, 'Coffee beans, cycling bibs, biographies',              'Cheese platters',                'coffee',  'l'),
  ('00000000-0000-0000-0000-000000000001', 'Rhea Menon',      'Ops',         'rhea@example.com',     1000, 'Gardening tools, crossword books, kombucha',           'Jewellery',                      'neither', 's'),
  ('00000000-0000-0000-0000-000000000001', 'Sanya Pillai',    'People',      'sanya@example.com',    1000, 'Yoga gear, herbal teas, aesthetic journals',           'Protein powder',                 'tea',     'none'),
  ('00000000-0000-0000-0000-000000000001', 'Tanvi Joshi',     'People',      'tanvi@example.com',    1000, 'Board games, espresso tools, Japanese snacks',         'Scarves',                        'coffee',  'm');
