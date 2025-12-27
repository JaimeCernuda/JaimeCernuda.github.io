
$mappings = @{
    "hstream" = "cernuda-2024-hstream-3043"
    "hades" = "cernuda-2024-hades-e18c"
    "jarvis" = "cernuda-2024-jarvis-3b52"
    "hflow" = "cernuda-2021-hflow-2f5b"
    "dtio" = "bateman-2025-dtio-e77d"
    "luxio" = "bateman-2022-luxio-2487"
    "chronolog" = "kougkas-2020-chronolog-c458"
    "labstor" = "logan-2022-labstor-f69d"
    "apollo" = "rajesh-2021-apollo-dbd8"
    "dayu" = "tang-2024-dayu-f286"
    "viper" = "ye-2024-viper-0a1b"
    "kv-caching" = "ye-2025-characterizing-behavior-f631"
}

$baseDir = "d:\Libraries\Documents\projects\personal_website"
$grcDir = "$baseDir\grc-context\publications"
$publicDir = "$baseDir\public"
$papersDir = "$publicDir\papers"
$imagesDir = "$publicDir\images\publications"
$contentDir = "$publicDir\content\publications"

# Create directories
New-Item -ItemType Directory -Force -Path $papersDir | Out-Null
New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null

foreach ($shortSlug in $mappings.Keys) {
    $longSlug = $mappings[$shortSlug]
    Write-Host "Processing $shortSlug ($longSlug)..."

    # 1. Copy PDF
    $pdfSource = "$grcDir\pdfs\$longSlug.pdf"
    $pdfDest = "$papersDir\$shortSlug.pdf"
    if (Test-Path $pdfSource) {
        Copy-Item -Path $pdfSource -Destination $pdfDest -Force
        Write-Host "  Copied PDF."
    } else {
        Write-Warning "  PDF not found: $pdfSource"
    }

    # 2. Copy Images
    $imgSource = "$grcDir\grc_parsed_pdfs\$longSlug\img"
    $imgDest = "$imagesDir\$shortSlug"
    if (Test-Path $imgSource) {
        New-Item -ItemType Directory -Force -Path $imgDest | Out-Null
        Copy-Item -Path "$imgSource\*" -Destination $imgDest -Force -Recurse
        Write-Host "  Copied images."
    }

    # 3. Update Markdown
    $mdFile = "$contentDir\$shortSlug.md"
    if (Test-Path $mdFile) {
        $content = Get-Content -Path $mdFile -Raw
        
        # Split frontmatter and body
        if ($content -match '(?s)^---\s*(.*?)\s*---\s*(.*)$') {
            $frontmatter = $matches[1]
            $body = $matches[2]
            
            # Update PDF link in frontmatter
            if (Test-Path $pdfSource) {
                $frontmatter = $frontmatter -replace 'pdf: "http.*?"', "pdf: ""/papers/$shortSlug.pdf"""
            }
            
            # Reconstruct content with just frontmatter initially
            $newContent = "---`n$frontmatter`n---`n"
            
            # Append parsed content if available
            $parsedMdPath = "$grcDir\grc_parsed_pdfs\$longSlug\$longSlug.md"
            if (Test-Path $parsedMdPath) {
                $parsedContent = Get-Content -Path $parsedMdPath -Raw
                
                # Fix image paths in parsed content
                $parsedContent = $parsedContent -replace '\./img/', "/images/publications/$shortSlug/"
                
                # Remove duplicate Title, Authors, Abstract
                # Regex to remove the first few sections if they match standard patterns
                # Remove Title (Lines starting with # )
                $parsedContent = $parsedContent -replace '(?m)^# .*?$', ''
                
                # Remove Authors section
                $parsedContent = $parsedContent -replace '(?s)## Authors.*?##', '##'
                
                # Remove Abstract section
                $parsedContent = $parsedContent -replace '(?s)## Abstract.*?##', '##'
                
                # Remove Index Terms section
                $parsedContent = $parsedContent -replace '(?s)## Index Terms.*?##', '##'
                
                # Clean up extra newlines
                $parsedContent = $parsedContent -replace '^\s+', ''
                
                # Append to new content
                $newContent = $newContent + "`n" + $parsedContent
                Write-Host "  Appended parsed content (cleaned)."
            } else {
                # If no parsed content, keep original body
                $newContent = $newContent + $body
            }
            
            Set-Content -Path $mdFile -Value $newContent -Encoding UTF8
            Write-Host "  Updated markdown file."
        }
    } else {
        Write-Warning "  Markdown file not found: $mdFile"
    }
}
