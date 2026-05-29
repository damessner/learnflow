Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  LearnFlow Lite Asset Organizer (MORE! 1)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$destReading = "learnflow_lite/assets/reading/more1"
$destListening = "learnflow_lite/assets/listening/more1"

# Ensure destination folders exist
New-Item -ItemType Directory -Force -Path $destReading | Out-Null
New-Item -ItemType Directory -Force -Path $destListening | Out-Null

$source = Read-Host "Enter the path to your folder containing the images & audio (e.g., C:\Users\...\MORE1 or just press Enter to scan current directory)"
if ([string]::IsNullOrWhiteSpace($source)) {
    $source = "."
}

if (-not (Test-Path $source)) {
    Write-Host "Error: Source path '$source' does not exist." -ForegroundColor Red
    Exit
}

Write-Host "Scanning '$source' for assets..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $source -Recurse -File

$movedCount = 0

foreach ($file in $files) {
    $fullName = $file.FullName
    $name = $file.Name
    
    # 1. Handle Audio files (mp3 / wav / m4a) -> Listening
    if ($name -match "^U\d+_TXT\d+\.(mp3|wav|m4a)$") {
        $destFile = Join-Path $destListening $name
        Copy-Item -Path $fullName -Destination $destFile -Force
        Write-Host "Copied Audio: $name -> $destListening" -ForegroundColor Green
        $movedCount++
    }
    # 2. Handle Images (png)
    elseif ($name -match "^U\d+_TXT\d+\.png$") {
        # Check if the folder path contains "Reading" or "Listening" to differentiate
        if ($fullName -like "*Reading*") {
            $destFile = Join-Path $destReading $name
            Copy-Item -Path $fullName -Destination $destFile -Force
            Write-Host "Copied Reading Image: $name -> $destReading" -ForegroundColor Green
            $movedCount++
        }
        elseif ($fullName -like "*Listening*") {
            $destFile = Join-Path $destListening $name
            Copy-Item -Path $fullName -Destination $destFile -Force
            Write-Host "Copied Listening Image: $name -> $destListening" -ForegroundColor Green
            $movedCount++
        }
        else {
            # Ambiguity handler
            Write-Host "Ambiguity found for image: $name" -ForegroundColor Yellow
            Write-Host "Directory: $($file.DirectoryName)"
            $choice = Read-Host "Is this for [R]eading or [L]istening? (R/L)"
            if ($choice -eq "L" -or $choice -eq "l") {
                $destFile = Join-Path $destListening $name
                Copy-Item -Path $fullName -Destination $destFile -Force
                Write-Host "Copied to Listening: $name" -ForegroundColor Green
                $movedCount++
            } else {
                $destFile = Join-Path $destReading $name
                Copy-Item -Path $fullName -Destination $destFile -Force
                Write-Host "Copied to Reading: $name" -ForegroundColor Green
                $movedCount++
            }
        }
    }
}

Write-Host ""
Write-Host "Done! Successfully copied $movedCount assets into 'learnflow_lite'." -ForegroundColor Cyan
