# Detached simulation battery for Belladonna's Parlour (survives session restarts).
# Writes reports + a completion marker with per-run exit codes.
$ErrorActionPreference = 'Continue'
Set-Location 'H:\code\11Tools\slots-skill\games\belladonna-parlour\math'
$log = 'reports\battery.log'
"BATTERY START $(Get-Date -Format o)" | Set-Content $log -Encoding utf8
$cmds = @(
  'uv run python -m slot_math.simulate --config ..\math-config --rounds 3000000 --seed 5252 --workers 3 --bet 100 --out reports\dev-sim.json',
  'uv run python -m slot_math.simulate --config ..\math-config --rounds 30000 --seed 521 --workers 3 --bet 100 --forced-scatters 3 --out reports\tier-feature.json',
  'uv run python -m slot_math.simulate --config ..\math-config --rounds 30000 --seed 522 --workers 3 --bet 100 --forced-scatters 4 --out reports\tier-super.json',
  'uv run python -m slot_math.simulate --config ..\math-config --rounds 30000 --seed 523 --workers 3 --bet 100 --forced-scatters 5 --out reports\tier-ultimate.json',
  'uv run python -m slot_math.simulate --config ..\math-config-ante --rounds 400000 --seed 524 --workers 3 --bet 100 --out reports\ante-sim.json'
)
foreach ($c in $cmds) {
  "RUN $c" | Add-Content $log
  Invoke-Expression $c 2>&1 | Add-Content $log
  "EXIT $LASTEXITCODE" | Add-Content $log
}
"BATTERY DONE $(Get-Date -Format o)" | Add-Content $log
