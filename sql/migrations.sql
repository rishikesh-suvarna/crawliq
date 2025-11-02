create table crawliq_audits (
  id bigserial primary key,
  url text not null,
  url_norm text not null,
  audit_hash text not null,
  status_code int,
  report_json jsonb not null,
  psi_json jsonb,
  content_hash text,
  http_etag text,
  last_modified text,
  created_at timestamptz not null default now(),
  refreshed_at timestamptz,
  expires_at timestamptz,
  unique (audit_hash)
);

create index on crawliq_audits (url_norm);
create index on crawliq_audits (expires_at);

alter table crawliq_audits
  add column if not exists http_etag text,
  add column if not exists last_modified text,
  add column if not exists html_expires_at timestamptz,
  add column if not exists psi_expires_at timestamptz,
  add column if not exists content_hash text;

create index if not exists crawliq_audits_html_exp_idx on crawliq_audits(html_expires_at);
create index if not exists crawliq_audits_psi_exp_idx on crawliq_audits(psi_expires_at);

create table if not exists crawliq_usage (
  id bigserial primary key,
  user_key text not null,
  day date not null,
  count int not null default 0,
  constraint crawliq_usage_uniq unique (user_key, day)
);
create index if not exists crawliq_usage_day_idx on crawliq_usage(day);
