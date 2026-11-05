# Brainbox Ninja: checks the stats database rules using ONLY the public (publishable) key from js/config.js.
# Run after supabase/schema.sql:   powershell -ExecutionPolicy Bypass -File tests\rls-check.ps1
# It inserts ONE valid row (app_version 'rls-check'). Remove it in the SQL Editor with:
#   delete from public.events where app_version = 'rls-check';
$ErrorActionPreference = 'Stop'
$cfg = Get-Content (Join-Path $PSScriptRoot '..\js\config.js') -Raw
$url = ([regex]::Match($cfg, "url:\s*'([^']+)'")).Groups[1].Value.TrimEnd('/')
$key = ([regex]::Match($cfg, "key:\s*'([^']+)'")).Groups[1].Value
if ($key -notmatch '^sb_publishable_') { throw 'js/config.js does not hold a publishable key' }
$h = @{ apikey = $key; 'Content-Type' = 'application/json'; Prefer = 'return=minimal' }
$fails = 0
function Call($method, $path, $body) {
  try {
    $r = Invoke-WebRequest -Uri "$url$path" -Method $method -Headers $h -Body $body -UseBasicParsing
    return @{ code = [int]$r.StatusCode; text = $r.Content }
  } catch {
    $resp = $_.Exception.Response; $text = ''
    if ($resp) { try { $text = (New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd() } catch {} }
    return @{ code = $(if ($resp) { [int]$resp.StatusCode } else { 0 }); text = $text }
  }
}
function Expect($name, $res, [int[]]$okCodes, $textPattern) {
  $pass = ($okCodes -contains $res.code) -and (-not $textPattern -or $res.text -match $textPattern)
  if (-not $pass) { $script:fails++ }
  '{0}  {1}  (HTTP {2}) {3}' -f $(if ($pass) { 'PASS' } else { 'FAIL' }), $name, $res.code, ($res.text -replace '\s+', ' ').Substring(0, [Math]::Min(140, $res.text.Length))
}
function Ev($over) {
  $e = [ordered]@{ occurred_at = (Get-Date).ToUniversalTime().ToString('o'); event_id = [guid]::NewGuid(); device_id = [guid]::NewGuid(); session_id = [guid]::NewGuid()
    event_type = 'round_complete'; nickname = 'RlsCheck'; round_id = [guid]::NewGuid(); age_band = 'teens'; puzzle_type = 'maths'; level = 0; round_no = 0
    score = 7; total_questions = 10; answered = 10; points = 90; round_ms = 60000; passed = $true; adaptive_adj = 0; timeouts = 1; app_version = 'rls-check' }
  foreach ($k in $over.Keys) { $e[$k] = $over[$k] }
  return (ConvertTo-Json @($e) -Compress)
}
"Checking $url with the publishable key`n"
Expect 'anon cannot read events'            (Call GET '/rest/v1/events?select=id&limit=1' $null) @(401, 403) '42501|permission'
Expect 'anon cannot call admin_stats'       (Call POST '/rest/v1/rpc/admin_stats' '{}') @(401, 403, 404) ''
Expect 'admins list not reachable'          (Call GET '/rest/v1/admins?select=email' $null) @(401, 403, 404, 406) ''
Expect 'rejects unknown event type'         (Call POST '/rest/v1/events' (Ev @{ event_type = 'hack' })) @(400) '23514|check'
Expect 'rejects score above 10'             (Call POST '/rest/v1/events' (Ev @{ score = 99 })) @(400) '23514|check'
Expect 'rejects negative points'            (Call POST '/rest/v1/events' (Ev @{ points = -5 })) @(400) '23514|check'
Expect 'rejects points above 300'           (Call POST '/rest/v1/events' (Ev @{ points = 5000 })) @(400) '23514|check'
Expect 'rejects unknown age band'           (Call POST '/rest/v1/events' (Ev @{ age_band = 'babies' })) @(400) '23514|check'
Expect 'rejects nickname with markup'       (Call POST '/rest/v1/events' (Ev @{ nickname = '<b>hi</b>' })) @(400) '23514|check'
Expect 'rejects time far in the past'       (Call POST '/rest/v1/events' (Ev @{ occurred_at = '2020-01-01T00:00:00Z' })) @(400) '23514|check'
Expect 'rejects setting is_test'            (Call POST '/rest/v1/events' (Ev @{ is_test = $true })) @(401, 403) '42501|permission'
Expect 'rejects setting created_at'         (Call POST '/rest/v1/events' (Ev @{ created_at = '2020-01-01T00:00:00Z' })) @(401, 403) '42501|permission'
Expect 'accepts one valid event'            (Call POST '/rest/v1/events' (Ev @{})) @(201) ''
Expect 'anon cannot update'                 (Call PATCH '/rest/v1/events?app_version=eq.rls-check' '{"score":1}') @(401, 403) '42501|permission'
Expect 'anon cannot delete'                 (Call DELETE '/rest/v1/events?app_version=eq.rls-check' $null) @(401, 403) '42501|permission'
"`n$(if ($fails) { "$fails check(s) FAILED" } else { 'All checks passed.' })"
"Remove the test row: delete from public.events where app_version = 'rls-check';"
