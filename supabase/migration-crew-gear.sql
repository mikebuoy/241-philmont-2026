-- ── Crew Gear Checklist ──────────────────────────────────────────────────────
-- Master template shared across all crews (admin-editable)
CREATE TABLE crew_core_gear (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  supplier            TEXT        NOT NULL CHECK (supplier IN ('Philmont Issued', 'Troop Supplied')),
  qty                 INT         NOT NULL DEFAULT 1,
  weight_oz           NUMERIC     NOT NULL DEFAULT 0,
  description         TEXT        NOT NULL DEFAULT '',
  default_is_not_taking BOOLEAN   NOT NULL DEFAULT FALSE,
  sort_order          INT         NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-crew state. Seeded from crew_core_gear on first visit.
-- Custom items added by admins have core_item_id = NULL and is_core = FALSE.
-- crew_id is a plain INT with no upper bound so future crews can be added without a migration.
CREATE TABLE crew_gear_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id       INT         NOT NULL,
  core_item_id  UUID        REFERENCES crew_core_gear(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  supplier      TEXT        NOT NULL CHECK (supplier IN ('Philmont Issued', 'Troop Supplied')),
  qty           INT         NOT NULL DEFAULT 1,
  weight_oz     NUMERIC     NOT NULL DEFAULT 0,
  is_core       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_checked    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_not_taking BOOLEAN     NOT NULL DEFAULT FALSE,
  notes         TEXT,
  sort_order    INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX crew_gear_items_crew_idx ON crew_gear_items (crew_id);

ALTER TABLE crew_core_gear  ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read crew_core_gear"
  ON crew_core_gear FOR SELECT TO authenticated USING (true);

CREATE POLICY "read crew_gear_items"
  ON crew_gear_items FOR SELECT TO authenticated USING (true);

-- All writes go through server actions that call requireAdmin() and use the service-role client.

-- ── Seed master gear list ─────────────────────────────────────────────────────
-- Philmont Issued
INSERT INTO crew_core_gear (name, supplier, qty, weight_oz, description, sort_order) VALUES
  ('Crew cook pots (8-quart)',              'Philmont Issued', 1,  21.8,  'Rehydration, serving, wash/rinse',                        0),
  ('Dishwashing pot no lid (8-quart)',      'Philmont Issued', 1,  20,    'Wash + rinse station',                                    1),
  ('Bear bags (woven polypropylene)',        'Philmont Issued', 4,  3,     'Distributed at HQ to balance loads',                      2),
  ('Bear ropes (100 ft × ¼" nylon)',        'Philmont Issued', 2,  17,    '¼" diameter mandatory — no Dyneema',                      3),
  ('Carabiners (issued)',                   'Philmont Issued', 2,  1.5,   'With bear rope carrier',                                  4),
  ('Camp suds (decanted)',                  'Philmont Issued', 1,  0.5,   '1 per crew',                                              5),
  ('Scrubby + sump material',               'Philmont Issued', 1,  1.5,   'Cut into pieces on trail',                                6),
  ('Food strainer & scraper',               'Philmont Issued', 1,  8,     'Grey water sump, yum yum bag',                            7),
  ('Large spoon / ladle',                   'Philmont Issued', 1,  2.6,   'With cook kit',                                           8),
  ('Hot-pot tongs',                         'Philmont Issued', 1,  3.5,   'Issued — use what Philmont provides',                     9),
  ('Toilet paper (crew supply)',             'Philmont Issued', 1,  5,     'Goes in smellables at night. Resupplied.',                10),
  ('Micropur purification tabs',            'Philmont Issued', 1,  1.5,   'Kills protozoa + bacteria + viruses.',                    11);

-- Troop Supplied
INSERT INTO crew_core_gear (name, supplier, qty, weight_oz, description, sort_order) VALUES
  ('Carabiners (climbing-rated locking)',                     'Troop Supplied', 2,  1.5,   'MUST be climbing-rated. NOT issued.',                                               0),
  ('Multi-tool with pliers',                                  'Troop Supplied', 2,  3.5,   'Leatherman Squirt ~2 oz · Skeletool ~5 oz. NOT issued. 2 required per Philmont spec.', 1),
  ('Dining fly (crew-supplied)',                               'Troop Supplied', 1,  38,    'Use trekking poles — do NOT carry Philmont-issued dining fly poles (saves 1 lb 6 oz)', 2),
  ('Cook kit bundle (stove + HE pot + fuel + lighter)',        'Troop Supplied', 2,  28.47, 'Fire Maple FMS-118 + Bulin 1.5L/2.1L HE pot. Nested. 1 per cook team.',            3),
  ('Spare fuel canister',                                      'Troop Supplied', 1,  10.76, 'Backup — 3rd canister. Likely unused based on prior trek data.',                    4),
  ('Platypus QuickDraw filter',                                'Troop Supplied', 2,  2.9,   'Screws onto CNOC bag or any 28mm bottle',                                           5),
  ('Sawyer Squeeze filter',                                    'Troop Supplied', 2,  3.0,   '4 independent filter paths total',                                                  6),
  ('CNOC Vecto 2L dirty bag',                                  'Troop Supplied', 2,  2.6,   'Wide-mouth collection. Pairs with QuickDraw.',                                      7),
  ('First aid kit (crew-level)',                               'Troop Supplied', 1,  14,    '1 advisor carries. Top of pack — not buried.',                                      8),
  ('Sectional maps + compass',                                 'Troop Supplied', 1,  4,     'Crew leader carries. Hip belt or top lid pocket.',                                  9),
  ('Repair kit',                                               'Troop Supplied', 1,  3,     'Tent tape · pole sleeve · needle/thread · spare buckle',                           10);
