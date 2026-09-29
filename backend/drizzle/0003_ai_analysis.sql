create table analysis_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('daily', 'weekly')),
  report_date date not null,
  status text not null check (status in ('published', 'held_for_review')),
  content jsonb not null,
  markdown text not null,
  prompt_version text not null,
  model text not null,
  model_version text,
  input_hash text not null,
  source_references jsonb not null,
  failure_reason text,
  created_at timestamptz not null default now(),
  constraint analysis_reports_type_date_unique unique (report_type, report_date)
);
create index analysis_reports_status_date_idx on analysis_reports (status, report_date);

create table report_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references analysis_reports(id),
  reviewer_id text not null references "user"(id),
  decision text not null check (decision in ('reviewed', 'accepted', 'rejected', 'needs_discussion')),
  notes text,
  created_at timestamptz not null default now()
);
create index report_reviews_report_created_idx on report_reviews (report_id, created_at);
create index report_reviews_reviewer_idx on report_reviews (reviewer_id);

create trigger analysis_reports_no_update before update on analysis_reports for each row execute function prevent_audit_event_mutation();
create trigger analysis_reports_no_delete before delete on analysis_reports for each row execute function prevent_audit_event_mutation();
create trigger report_reviews_no_update before update on report_reviews for each row execute function prevent_audit_event_mutation();
create trigger report_reviews_no_delete before delete on report_reviews for each row execute function prevent_audit_event_mutation();
