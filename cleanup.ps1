# Cleanup script for Galaxia game

# Remove duplicate music files
Remove-Item -Path "assets\sounds\Galaxia Theme Music.mp3" -ErrorAction SilentlyContinue
Remove-Item -Path "music" -Recurse -Force -ErrorAction SilentlyContinue

# Remove development files that aren't needed in production
$devFilesToKeep = @("README.md", "LICENSE")  # Keep these files if they exist
Get-ChildItem -Path "development" -File | ForEach-Object {
    if ($_.Name -notin $devFilesToKeep) {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

# Remove the development directory if it's empty
if ((Get-ChildItem -Path "development" -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
    Remove-Item -Path "development" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Cleanup complete!" -ForegroundColor Green
