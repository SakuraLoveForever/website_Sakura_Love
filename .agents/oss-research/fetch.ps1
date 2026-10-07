$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$outDir = "E:\dev\my_projects\Vibe Coding\website_Sakura_Love\.agents\oss-research"
$jsonPath = Join-Path $outDir "repos.json"
$logPath  = Join-Path $outDir "fetch.log"

$repos = @(
  "DIYgod/APlayer", "metowolf/MetingJS", "katspaugh/wavesurfer.js",
  "mojs/mojs", "juliangarnier/anime", "greensock/GSAP",
  "processing/p5.js", "mrdoob/three.js", "Tonejs/Tone.js",
  "tsparticles/tsparticles", "VincentGarreau/particles.js",
  "foobar404/wave.js", "goldfire/howler.js",
  "horman/audio-visualizer", "kylestetz/pizzicato",
  "goldfire/howler.js", "hvianna/audioMotion-analyzer", "jberg/butterchurn",
  "martinlaxenaire/curtainsjs", "oframe/ogl"
)
$repos = $repos | Select-Object -Unique

function Get-GH {
  param([string]$Url, [string]$Accept = "application/vnd.github+json")
  $headers = @{ "User-Agent" = "dsh-oss-research"; "Accept" = $Accept }
  try {
    $resp = Invoke-WebRequest -Uri $Url -Headers $headers -UseBasicParsing -TimeoutSec 45
    $remaining = $resp.Headers["X-RateLimit-Remaining"]
    $script:rateRemaining = $remaining
    return @{ ok = $true; status = $resp.StatusCode; json = ($resp.Content | ConvertFrom-Json); raw = $resp.Content }
  } catch {
    $status = $null
    try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
    return @{ ok = $false; status = $status; error = $_.Exception.Message; raw = $null }
  }
}

if (Test-Path $jsonPath) {
  $store = Get-Content $jsonPath -Raw | ConvertFrom-Json
} else {
  $store = [pscustomobject]@{}
}

$i = 0
foreach ($full in $repos) {
  $i++
  $name = $full
  Write-Output "=== [$i/$($repos.Count)] $name (rate remaining: $script:rateRemaining) ==="
  Add-Content -Path $logPath -Value "=== $name ==="

  if ($store.PSObject.Properties.Name -contains $name) {
    $entry = $store.$name
  } else {
    $entry = [pscustomobject]@{ repo = $full; meta = $null; metaErr = $null; commit = $null; commitErr = $null; release = $null; releaseErr = $null }
  }

  if (-not $entry.meta -and -not $entry.metaErr) {
    $res = Get-GH "https://api.github.com/repos/$full"
    if ($res.ok) {
      $j = $res.json
      $entry.meta = [pscustomobject]@{
        full_name = $j.full_name; description = $j.description; language = $j.language
        stargazers_count = $j.stargazers_count; forks_count = $j.forks_count
        open_issues_count = $j.open_issues_count; subscribers_count = $j.subscribers_count
        created_at = $j.created_at; pushed_at = $j.pushed_at; updated_at = $j.updated_at
        license = $j.license.spdx_id; archived = $j.archived; disabled = $j.disabled
        homepage = $j.homepage; default_branch = $j.default_branch
        size_kb = $j.size; topics = ($j.topics -join ",")
        has_wiki = $j.has_wiki; fork = $j.fork
      }
      Write-Output ("  stars={0} forks={1} language={2} license={3} archived={4} pushed_at={5} open_issues={6}" -f $j.stargazers_count, $j.forks_count, $j.language, $j.license.spdx_id, $j.archived, $j.pushed_at, $j.open_issues_count)
    } else {
      $entry.metaErr = "HTTP $($res.status) $($res.error)"
      Write-Output "  META ERROR: $($entry.metaErr)"
    }
    $store | Add-Member -NotePropertyName $name -NotePropertyValue $entry -Force
    $store | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding UTF8
  }

  if (-not $entry.commit -and -not $entry.commitErr) {
    $res = Get-GH "https://api.github.com/repos/$full/commits?per_page=1"
    if ($res.ok -and $res.raw) {
      try {
        $arr = $res.raw | ConvertFrom-Json
        $c = $arr[0]
        $entry.commit = [pscustomobject]@{
          sha = $c.sha; date = $c.commit.author.date; committer_date = $c.commit.committer.date
          message = ($c.commit.message -split "`n")[0]; author = $c.commit.author.name
        }
        Write-Output "  latest commit: $($entry.commit.date) - $($entry.commit.message)"
      } catch { $entry.commitErr = "parse: $($_.Exception.Message)" }
    } else {
      $entry.commitErr = "HTTP $($res.status) $($res.error)"
      Write-Output "  COMMIT ERROR: $($entry.commitErr)"
    }
    $store | Add-Member -NotePropertyName $name -NotePropertyValue $entry -Force
    $store | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding UTF8
  }

  if (-not $entry.release -and -not $entry.releaseErr) {
    $res = Get-GH "https://api.github.com/repos/$full/releases/latest"
    if ($res.ok) {
      $j = $res.json
      $entry.release = [pscustomobject]@{ tag = $j.tag_name; name = $j.name; published_at = $j.published_at; prerelease = $j.prerelease }
      Write-Output "  latest release: $($j.tag_name) ($($j.published_at))"
    } else {
      $entry.releaseErr = "HTTP $($res.status) $($res.error)"
      Write-Output "  RELEASE ERROR: $($entry.releaseErr)"
    }
    $store | Add-Member -NotePropertyName $name -NotePropertyValue $entry -Force
    $store | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding UTF8
  }

  if ($script:rateRemaining -ne $null -and [int]$script:rateRemaining -le 1) {
    Write-Output "!!! rate limit nearly exhausted, stopping"
    break
  }
  Start-Sleep -Milliseconds 250
}
Write-Output "DONE. remaining=$script:rateRemaining"
