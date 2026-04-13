insert into public.sports (name, emoji, category)
values ('Gym', '🏋️', 'wellness')
on conflict (name) do nothing;
