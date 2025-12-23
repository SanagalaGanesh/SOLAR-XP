<#
  Remove comments from text files in the repository.
  - Creates a .bak backup before modifying each file.
  - Processes common file extensions only.

  WARNING: This script uses heuristic regular expressions and may remove text that looks
  like comments inside strings or other constructs. Use backups to restore if needed.
#>

param(
    [string]$Root = "",
    [switch]$WhatIf
)

if ([string]::IsNullOrEmpty($Root)) {
    $Root = (Get-Location).Path
}

# Extensions to process (add or remove as needed)
$exts = @( 
    '*.cs', '*.cshtml', '*.cshtml.cs', '*.js', '*.ts', '*.jsx', '*.tsx', 
    '*.html', '*.htm', '*.css', '*.scss', '*.xml', '*.xaml', '*.config', 
    '*.csproj', '*.sln', '*.json', '*.md', '*.txt', '*.ps1', '*.psm1', 
    '*.sql', '*.yml', '*.yaml', '*.bat', '*.sh', '*.ini', '*.props', '*.targets'
)

[int]$filesScanned = 0
[int]$filesChanged = 0

function Remove-CommentsFromContent([string]$content) {
    if ([string]::IsNullOrEmpty($content)) { return $content }

    # Remove Razor comments @* ... *@
    $content = [regex]::Replace($content, '@\*.*?\*@', '', 'Singleline')

    # Remove HTML/XML comments <!-- ... -->
    $content = [regex]::Replace($content, '<!--.*?-->', '', 'Singleline')

    # Remove C-style block comments /* ... */
    $content = [regex]::Replace($content, '/\*.*?\*/', '', 'Singleline')

    # Remove XML documentation comments /// lines (C#)
    $content = [regex]::Replace($content, '^[ \t]*///.*$', '', 'Multiline')

    # Remove C-style single line comments // but avoid URLs like http:// and https://
    $content = [regex]::Replace($content, '(?m)(?<!:)[ \t]*//.*$', '')

    # Remove SQL single-line comments --
    $content = [regex]::Replace($content, '(?m)^[ \t]*--.*$', '')

    # Remove shell / PowerShell hash comments (#)
    $content = [regex]::Replace($content, '(?m)^[ \t]*#.*$', '')

    # Remove XML/HTML leftover empty lines from removed comments
    $content = [regex]::Replace($content, '(?m)^[ \t]*\r?\n', "`r`n")

    return $content
}

Write-Host "Starting comment removal in: $Root"

foreach ($pattern in $exts) {
    $files = Get-ChildItem -Path $Root -Recurse -Include $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $filesScanned++
        try {
            $orig = Get-Content -Raw -LiteralPath $file.FullName -ErrorAction Stop
        } catch {
            Write-Verbose "Skipping binary or unreadable file: $($file.FullName)"
            continue
        }

        $new = Remove-CommentsFromContent $orig
        if ($new -ne $orig) {
            $filesChanged++
            $bakPath = "$($file.FullName).bak"
            if (-not $WhatIf) {
                Copy-Item -LiteralPath $file.FullName -Destination $bakPath -Force
                Set-Content -LiteralPath $file.FullName -Value $new -NoNewline
                Write-Host "Updated: $($file.FullName)"
            } else {
                Write-Host "Would update: $($file.FullName)"
            }
        }
    }
}

Write-Host "Files scanned: $filesScanned"
Write-Host "Files changed: $filesChanged"
