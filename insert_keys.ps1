$src = 'c:\Users\tarun\OneDrive\Documents\ezyZip\frontend\i18n.js'
$lines = Get-Content $src
$out = [System.Collections.Generic.List[string]]::new()
$i = 0
foreach ($line in $lines) {
  $i++
  $out.Add($line)

  # EN: after signup_error_server (line 43)
  if ($i -eq 43) {
    $out.Add('    signup_error_name: "Please enter your full name.",')
    $out.Add('    signup_error_short: "Password must be at least 8 characters.",')
    $out.Add('    profile_err_curpw: "Current password is required.",')
    $out.Add('    profile_err_nothing: "Enter a new name or password to update.",')
    $out.Add('    profile_err_short: "New password must be at least 8 characters.",')
    $out.Add('    profile_success: "' + [char]0x2713 + ' Profile updated successfully!",')
    $out.Add('    profile_saving: "Saving' + [char]0x2026 + '",')
    $out.Add('    profile_save: "Save Changes ' + [char]0x2192 + '",')
  }
  # EN: after detect_email (line 67)
  if ($i -eq 67) {
    $out.Add('    detect_healthy: "Your plant looks healthy ' + [char]0x2014 + ' no disease detected!",')
    $out.Add('    detect_diseased: "Disease detected ' + [char]0x2014 + ' see details and recommended actions below.",')
  }
  # EN: after stats_scans (line 90)
  if ($i -eq 90) {
    $out.Add('    stats_trend: "📈 Scan Trend (last 14 days)",')
    $out.Add('    stats_streak_label: "Active scan day",')
    $out.Add('    stats_streak_labels: "Active scan days",')
  }

  # TE: after signup_error_server (line 171 + 8 inserted = 179)
  if ($i -eq 179) {
    $out.Add('    signup_error_name: "' + [char]0x0C26 + [char]0x0C2F + [char]0x0C1A + [char]0x0C47 + [char]0x0C38 + [char]0x0C3F + ' ' + [char]0x0C2E + [char]0x0C40 + ' ' + [char]0x0C2A + [char]0x0C42 + [char]0x0C30 + [char]0x0C4D + [char]0x0C24 + [char]0x0C3F + ' ' + [char]0x0C2A + [char]0x0C47 + [char]0x0C30 + [char]0x0C41 + ' ' + [char]0x0C28 + [char]0x0C2E + [char]0x0C4B + [char]0x0C26 + [char]0x0C41 + ' ' + [char]0x0C1A + [char]0x0C47 + [char]0x0C2F + [char]0x0C02 + [char]0x0C21 + [char]0x0C3F + '.",')
    $out.Add('    signup_error_short: "' + [char]0x0C2A + [char]0x0C3E + [char]0x0C38 + [char]0x0C4D + [char]0x0C35 + [char]0x0C30 + [char]0x0C4D + [char]0x0C21 + [char]0x0C4D + ' ' + [char]0x0C15 + [char]0x0C28 + [char]0x0C40 + [char]0x0C38 + [char]0x0C02 + ' 8 ' + [char]0x0C05 + [char]0x0C15 + [char]0x0C4D + [char]0x0C37 + [char]0x0C30 + [char]0x0C3E + [char]0x0C32 + [char]0x0C41 + ' ' + [char]0x0C09 + [char]0x0C02 + [char]0x0C21 + [char]0x0C3E + [char]0x0C32 + [char]0x0C3F + '.",')
    $out.Add('    profile_err_curpw: "' + [char]0x0C2A + [char]0x0C4D + [char]0x0C30 + [char]0x0C38 + [char]0x0C4D + [char]0x0C24 + [char]0x0C41 + [char]0x0C24 + ' ' + [char]0x0C2A + [char]0x0C3E + [char]0x0C38 + [char]0x0C4D + [char]0x0C35 + [char]0x0C30 + [char]0x0C4D + [char]0x0C21 + [char]0x0C4D + ' ' + [char]0x0C05 + [char]0x0C35 + [char]0x0C38 + [char]0x0C30 + [char]0x0C02 + '.",')
    $out.Add('    profile_err_nothing: "' + [char]0x0C05 + [char]0x0C2A + [char]0x0C4D + [char]0x0C21 + [char]0x0C47 + [char]0x0C1F + [char]0x0C4D + ' ' + [char]0x0C1A + [char]0x0C47 + [char]0x0C2F + [char]0x0C21 + [char]0x0C3E + [char]0x0C28 + [char]0x0C3F + [char]0x0C15 + [char]0x0C3F + ' ' + [char]0x0C15 + [char]0x0C4A + [char]0x0C24 + [char]0x0C4D + [char]0x0C24 + ' ' + [char]0x0C2A + [char]0x0C47 + [char]0x0C30 + [char]0x0C41 + ' ' + [char]0x0C32 + [char]0x0C47 + [char]0x0C26 + [char]0x0C3E + ' ' + [char]0x0C2A + [char]0x0C3E + [char]0x0C38 + [char]0x0C4D + [char]0x0C35 + [char]0x0C30 + [char]0x0C4D + [char]0x0C21 + [char]0x0C4D + ' ' + [char]0x0C28 + [char]0x0C2E + [char]0x0C4B + [char]0x0C26 + [char]0x0C41 + ' ' + [char]0x0C1A + [char]0x0C47 + [char]0x0C2F + [char]0x0C02 + [char]0x0C21 + [char]0x0C3F + '.",')
    $out.Add('    profile_err_short: "' + [char]0x0C15 + [char]0x0C4A + [char]0x0C24 + [char]0x0C4D + [char]0x0C24 + ' ' + [char]0x0C2A + [char]0x0C3E + [char]0x0C38 + [char]0x0C4D + [char]0x0C35 + [char]0x0C30 + [char]0x0C4D + [char]0x0C21 + [char]0x0C4D + ' ' + [char]0x0C15 + [char]0x0C28 + [char]0x0C40 + [char]0x0C38 + [char]0x0C02 + ' 8 ' + [char]0x0C05 + [char]0x0C15 + [char]0x0C4D + [char]0x0C37 + [char]0x0C30 + [char]0x0C3E + [char]0x0C32 + [char]0x0C41 + ' ' + [char]0x0C09 + [char]0x0C02 + [char]0x0C21 + [char]0x0C3E + [char]0x0C32 + [char]0x0C3F + '.",')
    $out.Add('    profile_success: "' + [char]0x2713 + ' ' + [char]0x0C2A + [char]0x0C4D + [char]0x0C30 + [char]0x0C4A + [char]0x0C2B + [char]0x0C48 + [char]0x0C32 + [char]0x0C4D + ' ' + [char]0x0C35 + [char]0x0C3F + [char]0x0C1C + [char]0x0C2F + [char]0x0C35 + [char]0x0C02 + [char]0x0C24 + [char]0x0C02 + [char]0x0C17 + [char]0x0C3E + ' ' + [char]0x0C05 + [char]0x0C2A + [char]0x0C4D + [char]0x0C21 + [char]0x0C47 + [char]0x0C1F + [char]0x0C4D + ' ' + [char]0x0C05 + [char]0x0C2F + [char]0x0C3F + [char]0x0C02 + [char]0x0C26 + [char]0x0C3F + '!",')
    $out.Add('    profile_saving: "' + [char]0x0C38 + [char]0x0C47 + [char]0x0C35 + [char]0x0C4D + ' ' + [char]0x0C05 + [char]0x0C35 + [char]0x0C41 + [char]0x0C24 + [char]0x0C4B + [char]0x0C02 + [char]0x0C26 + [char]0x0C3F + [char]0x2026 + '",')
    $out.Add('    profile_save: "' + [char]0x0C2E + [char]0x0C3E + [char]0x0C30 + [char]0x0C4D + [char]0x0C2A + [char]0x0C41 + [char]0x0C32 + [char]0x0C41 + ' ' + [char]0x0C38 + [char]0x0C47 + [char]0x0C35 + [char]0x0C4D + ' ' + [char]0x0C1A + [char]0x0C47 + [char]0x0C2F + [char]0x0C02 + [char]0x0C21 + [char]0x0C3F + ' ' + [char]0x2192 + '",')
  }
  # TE: after detect_email (line 195 + 8 = 203)
  if ($i -eq 203) {
    $out.Add('    detect_healthy: "' + [char]0x0C2E + [char]0x0C40 + ' ' + [char]0x0C2E + [char]0x0C4A + [char]0x0C15 + [char]0x0C4D + [char]0x0C15 + ' ' + [char]0x0C06 + [char]0x0C30 + [char]0x0C4B + [char]0x0C17 + [char]0x0C4D + [char]0x0C2F + [char]0x0C02 + [char]0x0C17 + [char]0x0C3E + ' ' + [char]0x0C09 + [char]0x0C02 + [char]0x0C26 + [char]0x0C3F + ' ' + [char]0x2014 + ' ' + [char]0x0C35 + [char]0x0C4D + [char]0x0C2F + [char]0x0C3E + [char]0x0C27 + [char]0x0C3F + ' ' + [char]0x0C17 + [char]0x0C41 + [char]0x0C30 + [char]0x0C4D + [char]0x0C24 + [char]0x0C3F + [char]0x0C02 + [char]0x0C1A + [char]0x0C2C + [char]0x0C21 + [char]0x0C32 + [char]0x0C47 + [char]0x0C26 + [char]0x0C41 + '!",')
    $out.Add('    detect_diseased: "' + [char]0x0C35 + [char]0x0C4D + [char]0x0C2F + [char]0x0C3E + [char]0x0C27 + [char]0x0C3F + ' ' + [char]0x0C17 + [char]0x0C41 + [char]0x0C30 + [char]0x0C4D + [char]0x0C24 + [char]0x0C3F + [char]0x0C02 + [char]0x0C1A + [char]0x0C2C + [char]0x0C21 + [char]0x0C3F + [char]0x0C02 + [char]0x0C26 + [char]0x0C3F + ' ' + [char]0x2014 + ' ' + [char]0x0C35 + [char]0x0C3F + [char]0x0C35 + [char]0x0C30 + [char]0x0C3E + [char]0x0C32 + [char]0x0C41 + ' ' + [char]0x0C15 + [char]0x0C4D + [char]0x0C30 + [char]0x0C3F + [char]0x0C02 + [char]0x0C26 + ' ' + [char]0x0C1A + [char]0x0C42 + [char]0x0C21 + [char]0x0C02 + [char]0x0C21 + [char]0x0C3F + '.",')
  }
  # TE: after stats_scans (line 218 + 8 + 2 = 228)
  if ($i -eq 228) {
    $out.Add('    stats_trend: "📈 ' + [char]0x0C38 + [char]0x0C4D + [char]0x0C15 + [char]0x0C3E + [char]0x0C28 + [char]0x0C4D + ' ' + [char]0x0C1F + [char]0x0C4D + [char]0x0C30 + [char]0x0C46 + [char]0x0C02 + [char]0x0C21 + [char]0x0C4D + ' (' + [char]0x0C1A + [char]0x0C3F + [char]0x0C35 + [char]0x0C30 + [char]0x0C3F + ' 14 ' + [char]0x0C30 + [char]0x0C4B + [char]0x0C1C + [char]0x0C41 + [char]0x0C32 + [char]0x0C41 + ')",')
    $out.Add('    stats_streak_label: "' + [char]0x0C2F + [char]0x0C3E + [char]0x0C15 + [char]0x0C4D + [char]0x0C1F + [char]0x0C3F + [char]0x0C35 + [char]0x0C4D + ' ' + [char]0x0C38 + [char]0x0C4D + [char]0x0C15 + [char]0x0C3E + [char]0x0C28 + [char]0x0C4D + ' ' + [char]0x0C30 + [char]0x0C4B + [char]0x0C1C + [char]0x0C41 + '",')
    $out.Add('    stats_streak_labels: "' + [char]0x0C2F + [char]0x0C3E + [char]0x0C15 + [char]0x0C4D + [char]0x0C1F + [char]0x0C3F + [char]0x0C35 + [char]0x0C4D + ' ' + [char]0x0C38 + [char]0x0C4D + [char]0x0C15 + [char]0x0C3E + [char]0x0C28 + [char]0x0C4D + ' ' + [char]0x0C30 + [char]0x0C4B + [char]0x0C1C + [char]0x0C41 + [char]0x0C32 + [char]0x0C41 + '",')
  }

  # HI: after signup_error_server (line 299 + 8 + 8 + 3 = 318)
  if ($i -eq 318) {
    $out.Add('    signup_error_name: "' + [char]0x0915 + [char]0x0943 + [char]0x092A + [char]0x092F + [char]0x093E + ' ' + [char]0x0905 + [char]0x092A + [char]0x0928 + [char]0x093E + ' ' + [char]0x092A + [char]0x0942 + [char]0x0930 + [char]0x093E + ' ' + [char]0x0928 + [char]0x093E + [char]0x092E + ' ' + [char]0x0926 + [char]0x0930 + [char]0x094D + [char]0x091C + ' ' + [char]0x0915 + [char]0x0930 + [char]0x0947 + [char]0x0902 + '.",')
    $out.Add('    signup_error_short: "' + [char]0x092A + [char]0x093E + [char]0x0938 + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0921 + ' ' + [char]0x0915 + [char]0x092E + ' ' + [char]0x0938 + [char]0x0947 + ' ' + [char]0x0915 + [char]0x092E + ' 8 ' + [char]0x0905 + [char]0x0915 + [char]0x094D + [char]0x0937 + [char]0x0930 + ' ' + [char]0x0939 + [char]0x094B + [char]0x0928 + [char]0x093E + ' ' + [char]0x091A + [char]0x093E + [char]0x0939 + [char]0x093F + [char]0x090F + '.",')
    $out.Add('    profile_err_curpw: "' + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0924 + [char]0x092E + [char]0x093E + [char]0x0928 + ' ' + [char]0x092A + [char]0x093E + [char]0x0938 + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0921 + ' ' + [char]0x0906 + [char]0x0935 + [char]0x0936 + [char]0x094D + [char]0x092F + [char]0x0915 + ' ' + [char]0x0939 + [char]0x0948 + '.",')
    $out.Add('    profile_err_nothing: "' + [char]0x0905 + [char]0x092A + [char]0x0921 + [char]0x0947 + [char]0x091F + ' ' + [char]0x0915 + [char]0x0930 + [char]0x0928 + [char]0x0947 + ' ' + [char]0x0915 + [char]0x0947 + ' ' + [char]0x0932 + [char]0x093F + [char]0x090F + ' ' + [char]0x0928 + [char]0x092F + [char]0x093E + ' ' + [char]0x0928 + [char]0x093E + [char]0x092E + ' ' + [char]0x092F + [char]0x093E + ' ' + [char]0x092A + [char]0x093E + [char]0x0938 + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0921 + ' ' + [char]0x0926 + [char]0x0930 + [char]0x094D + [char]0x091C + ' ' + [char]0x0915 + [char]0x0930 + [char]0x0947 + [char]0x0902 + '.",')
    $out.Add('    profile_err_short: "' + [char]0x0928 + [char]0x092F + [char]0x093E + ' ' + [char]0x092A + [char]0x093E + [char]0x0938 + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0921 + ' ' + [char]0x0915 + [char]0x092E + ' ' + [char]0x0938 + [char]0x0947 + ' ' + [char]0x0915 + [char]0x092E + ' 8 ' + [char]0x0905 + [char]0x0915 + [char]0x094D + [char]0x0937 + [char]0x0930 + ' ' + [char]0x0939 + [char]0x094B + [char]0x0928 + [char]0x093E + ' ' + [char]0x091A + [char]0x093E + [char]0x0939 + [char]0x093F + [char]0x090F + '.",')
    $out.Add('    profile_success: "' + [char]0x2713 + ' ' + [char]0x092A + [char]0x094D + [char]0x0930 + [char]0x094B + [char]0x092B + [char]0x093C + [char]0x093E + [char]0x0907 + [char]0x0932 + ' ' + [char]0x0938 + [char]0x092B + [char]0x0932 + [char]0x0924 + [char]0x093E + [char]0x092A + [char]0x0942 + [char]0x0930 + [char]0x094D + [char]0x0935 + [char]0x0915 + ' ' + [char]0x0905 + [char]0x092A + [char]0x0921 + [char]0x0947 + [char]0x091F + ' ' + [char]0x0939 + [char]0x094B + ' ' + [char]0x0917 + [char]0x0908 + '!",')
    $out.Add('    profile_saving: "' + [char]0x0938 + [char]0x0939 + [char]0x0947 + [char]0x091C + ' ' + [char]0x0930 + [char]0x0939 + [char]0x093E + ' ' + [char]0x0939 + [char]0x0948 + [char]0x2026 + '",')
    $out.Add('    profile_save: "' + [char]0x092A + [char]0x0930 + [char]0x093F + [char]0x0935 + [char]0x0930 + [char]0x094D + [char]0x0924 + [char]0x0928 + ' ' + [char]0x0938 + [char]0x0939 + [char]0x0947 + [char]0x091C + [char]0x0947 + [char]0x0902 + ' ' + [char]0x2192 + '",')
  }
  # HI: after detect_email (line 323 + 8 + 8 + 3 + 8 = 350)
  if ($i -eq 350) {
    $out.Add('    detect_healthy: "' + [char]0x0906 + [char]0x092A + [char]0x0915 + [char]0x093E + ' ' + [char]0x092A + [char]0x094C + [char]0x0927 + [char]0x093E + ' ' + [char]0x0938 + [char]0x094D + [char]0x0935 + [char]0x0938 + [char]0x094D + [char]0x0925 + ' ' + [char]0x0939 + [char]0x0948 + ' ' + [char]0x2014 + ' ' + [char]0x0915 + [char]0x094B + [char]0x0908 + ' ' + [char]0x0930 + [char]0x094B + [char]0x0917 + ' ' + [char]0x0928 + [char]0x0939 + [char]0x0940 + [char]0x0902 + ' ' + [char]0x092E + [char]0x093F + [char]0x0932 + [char]0x093E + '!",')
    $out.Add('    detect_diseased: "' + [char]0x0930 + [char]0x094B + [char]0x0917 + ' ' + [char]0x092E + [char]0x093F + [char]0x0932 + [char]0x093E + ' ' + [char]0x2014 + ' ' + [char]0x0928 + [char]0x0940 + [char]0x091A + [char]0x0947 + ' ' + [char]0x0935 + [char]0x093F + [char]0x0935 + [char]0x0930 + [char]0x0923 + ' ' + [char]0x0914 + [char]0x0930 + ' ' + [char]0x0938 + [char]0x0941 + [char]0x091D + [char]0x093E + [char]0x0935 + ' ' + [char]0x0926 + [char]0x0947 + [char]0x0916 + [char]0x0947 + [char]0x0902 + '.",')
  }
  # HI: after stats_scans (line 346 + 8 + 8 + 3 + 8 + 2 = 375)
  if ($i -eq 375) {
    $out.Add('    stats_trend: "📈 ' + [char]0x0938 + [char]0x094D + [char]0x0915 + [char]0x0948 + [char]0x0928 + ' ' + [char]0x091F + [char]0x094D + [char]0x0930 + [char]0x0947 + [char]0x0902 + [char]0x0921 + ' (' + [char]0x092A + [char]0x093F + [char]0x091B + [char]0x0932 + [char]0x0947 + ' 14 ' + [char]0x0926 + [char]0x093F + [char]0x0928 + ')",')
    $out.Add('    stats_streak_label: "' + [char]0x0938 + [char]0x0915 + [char]0x094D + [char]0x0930 + [char]0x093F + [char]0x092F + ' ' + [char]0x0938 + [char]0x094D + [char]0x0915 + [char]0x0948 + [char]0x0928 + ' ' + [char]0x0926 + [char]0x093F + [char]0x0928 + '",')
    $out.Add('    stats_streak_labels: "' + [char]0x0938 + [char]0x0915 + [char]0x094D + [char]0x0930 + [char]0x093F + [char]0x092F + ' ' + [char]0x0938 + [char]0x094D + [char]0x0915 + [char]0x0948 + [char]0x0928 + ' ' + [char]0x0926 + [char]0x093F + [char]0x0928 + '",')
  }
}
[System.IO.File]::WriteAllLines($src, $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done. Total lines: $($out.Count)"
