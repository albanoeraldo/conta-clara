-- Conta Clara V2
-- Add monthly income to financial_spaces

alter table public.financial_spaces
add column if not exists monthly_income numeric(12, 2);