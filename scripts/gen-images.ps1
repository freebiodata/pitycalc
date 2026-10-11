# Generates og-default.png (1200x630), favicon-32.png and apple-touch-icon.png (180x180)
# for PityHub using .NET System.Drawing (no external dependencies).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot '..\public'
$rnd = New-Object System.Random(42)

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bmp = $bmp; G = $g }
}

function Draw-Starfield($g, [int]$w, [int]$h, [int]$count) {
  $colors = @(
    (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 255, 255, 255))),
    (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 244, 220, 160))),
    (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 111, 211, 199)))
  )
  for ($i = 0; $i -lt $count; $i++) {
    $x = $rnd.Next(0, $w); $y = $rnd.Next(0, $h)
    $sz = $rnd.Next(1, 4)
    $pen = $colors[$rnd.Next(0, $colors.Count)]
    $g.DrawLine($pen, $x, $y, $x + $sz, $y)
  }
}

function Draw-FourStar($g, [single]$cx, [single]$cy, [single]$r, $fill) {
  # elegant 4-point star via cubic curves
  $pts = New-Object 'System.Drawing.PointF[]' 4
  $ctrl = New-Object 'System.Drawing.PointF[]' 8
  $k = 0.22  # control pull
  $pts[0] = [System.Drawing.PointF]::new($cx, ($cy - $r))
  $pts[1] = [System.Drawing.PointF]::new(($cx + $r), $cy)
  $pts[2] = [System.Drawing.PointF]::new($cx, ($cy + $r))
  $pts[3] = [System.Drawing.PointF]::new(($cx - $r), $cy)
  $ctrl[0] = [System.Drawing.PointF]::new(($cx + $k * $r), ($cy - $r + $k * $r))
  $ctrl[1] = [System.Drawing.PointF]::new(($cx + $r - $k * $r), ($cy - $k * $r))
  $ctrl[2] = [System.Drawing.PointF]::new(($cx + $r - $k * $r), ($cy + $k * $r))
  $ctrl[3] = [System.Drawing.PointF]::new(($cx + $k * $r), ($cy + $r - $k * $r))
  $ctrl[4] = [System.Drawing.PointF]::new(($cx - $k * $r), ($cy + $r - $k * $r))
  $ctrl[5] = [System.Drawing.PointF]::new(($cx - $r + $k * $r), ($cy + $k * $r))
  $ctrl[6] = [System.Drawing.PointF]::new(($cx - $r + $k * $r), ($cy - $k * $r))
  $ctrl[7] = [System.Drawing.PointF]::new(($cx - $k * $r), ($cy - $r + $k * $r))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier($pts[0].X, $pts[0].Y, $ctrl[0].X, $ctrl[0].Y, $ctrl[1].X, $ctrl[1].Y, $pts[1].X, $pts[1].Y)
  $path.AddBezier($pts[1].X, $pts[1].Y, $ctrl[2].X, $ctrl[2].Y, $ctrl[3].X, $ctrl[3].Y, $pts[2].X, $pts[2].Y)
  $path.AddBezier($pts[2].X, $pts[2].Y, $ctrl[4].X, $ctrl[4].Y, $ctrl[5].X, $ctrl[5].Y, $pts[3].X, $pts[3].Y)
  $path.AddBezier($pts[3].X, $pts[3].Y, $ctrl[6].X, $ctrl[6].Y, $ctrl[7].X, $ctrl[7].Y, $pts[0].X, $pts[0].Y)
  $path.CloseFigure()
  $g.FillPath($fill, $path)
  $path.Dispose()
}

# ---------------- OG image 1200x630 ----------------
$c = New-Canvas 1200 630
$g = $c.G; $bmp = $c.Bmp
$rect = New-Object System.Drawing.Rectangle(0, 0, 1200, 630)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect,
  [System.Drawing.Color]::FromArgb(255, 18, 15, 46),
  [System.Drawing.Color]::FromArgb(255, 43, 36, 96), 55)
$g.FillRectangle($bg, $rect)

# nebula glows
$glow1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 111, 211, 199))
$g.FillEllipse($glow1, 780, -140, 620, 480)
$glow2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 232, 194, 104))
$g.FillEllipse($glow2, -180, 380, 640, 460)

Draw-Starfield $g 1200 630 170

# big glow star top-right
$starGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 232, 194, 104))
$g.FillEllipse($starGlow, 940, 60, 200, 200)
$goldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(940, 60, 200, 200)),
  [System.Drawing.Color]::FromArgb(255, 244, 220, 160),
  [System.Drawing.Color]::FromArgb(255, 203, 155, 68), 90)
Draw-FourStar $g 1040 160 78 $goldBrush
$tealDot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 111, 211, 199))
$g.FillEllipse($tealDot, 970, 236, 14, 14)
$g.FillEllipse($tealDot, 1118, 96, 9, 9)

# text
$titleFont = New-Object System.Drawing.Font('Georgia', 88, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Regular)
$tagFont = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Regular)
$goldText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 240, 208, 138))
$whiteText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 240, 236, 255))
$tealText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 130, 216, 206))
$shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 232, 194, 104))

# soft glow behind title
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.DrawString('PityHub', $titleFont, $shadow, 66, 208)
$g.DrawString('PityHub', $titleFont, $shadow, 62, 204)
$g.DrawString('PityHub', $titleFont, $goldText, 64, 206)
$g.DrawString('Free Genshin Impact pity & wish calculators', $subFont, $whiteText, 70, 340)
$g.DrawString('soft pity  ·  50/50 & Radiance  ·  exact odds', $tagFont, $tealText, 70, 404)
$g.DrawString('pitycalc.top', $tagFont, $tealText, 70, 542)

$bmp.Save((Join-Path $outDir 'og-default.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host 'og-default.png written'

# ---------------- favicon 32 & apple-touch 180 ----------------
foreach ($size in @(32, 180)) {
  $c2 = New-Canvas $size $size
  $g2 = $c2.G; $b2 = $c2.Bmp
  $r2 = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $bg2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($r2,
    [System.Drawing.Color]::FromArgb(255, 36, 31, 82),
    [System.Drawing.Color]::FromArgb(255, 18, 15, 46), 55)
  # rounded rect
  $rr = New-Object System.Drawing.Drawing2D.GraphicsPath
  $rad = [int]($size * 0.22)
  $rr.AddArc(0, 0, $rad * 2, $rad * 2, 180, 90)
  $rr.AddArc($size - $rad * 2, 0, $rad * 2, $rad * 2, 270, 90)
  $rr.AddArc($size - $rad * 2, $size - $rad * 2, $rad * 2, $rad * 2, 0, 90)
  $rr.AddArc(0, $size - $rad * 2, $rad * 2, $rad * 2, 90, 90)
  $rr.CloseFigure()
  $g2.FillPath($bg2, $rr)
  $g2.Clip = New-Object System.Drawing.Region($rr)
  Draw-Starfield $g2 $size $size ([int]($size / 6))
  $star2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($r2,
    [System.Drawing.Color]::FromArgb(255, 244, 220, 160),
    [System.Drawing.Color]::FromArgb(255, 203, 155, 68), 90)
  Draw-FourStar $g2 ($size / 2) ($size / 2) ($size * 0.4) $star2
  $td = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 111, 211, 199))
  $d = [Math]::Max(2, [int]($size * 0.07))
  $g2.FillEllipse($td, [single]($size * 0.76), [single]($size * 0.2), $d, $d)
  if ($size -eq 32) {
    $b2.Save((Join-Path $outDir 'favicon-32.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host 'favicon-32.png written'
  } else {
    $b2.Save((Join-Path $outDir 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host 'apple-touch-icon.png written'
  }
  $g2.Dispose(); $b2.Dispose()
}
