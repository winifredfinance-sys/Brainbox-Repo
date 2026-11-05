-- Brainbox Ninja: TEST DATA for the admin dashboard. Not real players.
-- Run AFTER schema.sql: SQL Editor -> New query -> paste -> Run.
-- Adds about 300 made-up players over the last 45 days (roughly 2,500 events).
-- Every row has is_test = true and a nickname starting with "Test", so it is easy to spot.
-- The dashboard shows a yellow banner while test rows exist.
--
-- DELETE ALL TEST DATA (one line):
--   delete from public.events where is_test;

do $$
declare
  d int; s int; k int; q int;
  dev uuid; sess uuid; rid uuid;
  band text; types text[]; ptype text; nick text;
  first_day date; s_at timestamptz; t timestamptz;
  nses int; nr int; lvl int; adj int; rno int;
  p_ok float; p_to float; lim int;
  sc int; ans int; tos int; raw int; ms int; abandoned boolean; used int;
begin
  for d in 1..300 loop
    dev  := gen_random_uuid();
    nick := 'Test' || lpad(d::text, 3, '0');
    -- age bands: kids, teens and adults common; elders deliberately rare (shows the "below 10%" flag)
    band := (array['kids','kids','kids','teens','teens','teens','adults','adults','adults','adults','adults','elders'])[1 + floor(random() * 12)::int];
    types := case band
      when 'kids'   then array['count','sums','patterns','odd','skip','mix']
      when 'teens'  then array['maths','seq','words','proverbs','riddles','mix']
      when 'adults' then array['money','maths','seq','words','proverbs','riddles','memory','mix']
      else               array['memory','proverbs','riddles','words','numbers','mix'] end;
    first_day := (now() at time zone 'Africa/Lagos')::date - floor(random() * 45)::int;
    nses := 1 + floor(random() * random() * 7)::int;

    for s in 1..nses loop
      sess := gen_random_uuid();
      if s = 1 then
        s_at := (first_day + time '07:00' + random() * interval '13 hours') at time zone 'Africa/Lagos';
      else
        s_at := s_at + case
          when random() < 0.35 then interval '1 day'
          when random() < 0.45 then interval '7 days'
          else (2 + floor(random() * 4)::int) * interval '1 day' end;
      end if;
      exit when s_at > now();

      insert into public.events (created_at, occurred_at, event_id, device_id, session_id, event_type, nickname, app_version, is_test)
      values (s_at, s_at, gen_random_uuid(), dev, sess, 'session_start', nick, 'seed', true);

      t := s_at;
      nr := floor(random() * 7)::int;           -- 0-6 rounds this session
      for k in 1..nr loop
        rid   := gen_random_uuid();
        ptype := types[1 + floor(random() * array_length(types, 1))::int];
        lvl   := case when random() < 0.6 then 0 when random() < 0.7 then 1 else 2 end;
        rno   := floor(random() * 10)::int;
        adj   := case when random() < 0.12 then 1 when random() < 0.10 then -1 else 0 end;
        if lvl = 2 and adj = 1 then adj := 0; end if;
        if lvl = 0 and adj = -1 then adj := 0; end if;

        -- chance of a correct answer: easier at Beginner, some types harder or easier on purpose
        p_ok := case lvl when 0 then 0.74 when 1 then 0.64 else 0.52 end;
        if ptype in ('proverbs', 'seq') then p_ok := p_ok - 0.14; end if;
        if ptype in ('count', 'patterns') then p_ok := p_ok + 0.18; end if;
        if adj = 1 then p_ok := p_ok - 0.06; elsif adj = -1 then p_ok := p_ok + 0.08; end if;
        p_to := case band when 'elders' then 0.13 when 'kids' then 0.09 else 0.05 end + lvl * 0.02;
        lim  := case band when 'kids' then 30 when 'teens' then 20 + 5 * lvl
                          when 'adults' then (array[25,30,40])[lvl + 1] else 40 + 5 * lvl end;

        abandoned := random() < 0.12;
        ans := case when abandoned then 1 + floor(random() * 9)::int else 10 end;
        sc := 0; tos := 0; raw := 0; ms := 0;
        for q in 1..ans loop
          if random() < p_to then
            tos := tos + 1; ms := ms + lim * 1000;
          else
            used := floor(lim * 1000 * (0.2 + random() * 0.7))::int;
            ms := ms + used;
            if random() < p_ok then
              sc := sc + 1;
              raw := raw + 10 + floor(5.0 * (lim * 1000 - used) / (lim * 1000))::int;
            end if;
          end if;
        end loop;

        t := t + make_interval(secs => ms / 1000.0 + 15 + random() * 40);
        exit when t > now();

        insert into public.events (created_at, occurred_at, event_id, device_id, session_id, event_type, nickname,
          round_id, age_band, puzzle_type, level, round_no, score, total_questions, answered, points,
          round_ms, passed, adaptive_adj, timeouts, app_version, is_test)
        values (t, t, gen_random_uuid(), dev, sess,
          case when abandoned then 'round_abandoned' else 'round_complete' end, nick,
          rid, band, ptype, lvl, rno, sc, 10, ans, round(raw * (array[1, 1.5, 2])[lvl + 1])::int,
          ms, case when abandoned then null else sc >= 6 end, adj, tos, 'seed', true);
      end loop;
    end loop;
  end loop;
end
$$;

select count(*) as test_events_added from public.events where is_test;
