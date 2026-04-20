$f = 'c:\Users\tarun\OneDrive\Documents\ezyZip\frontend\react-app\src\pages\Dashboard.jsx'
$c = Get-Content $f -Raw -Encoding UTF8

$c = $c.Replace("'`u{1F310} Language'", "t('profile_lang')")
$c = $c.Replace("'`u{1F464} Change Display Name'", "t('profile_name')")
$c = $c.Replace("'Enter new display name'", "t('profile_name_ph')")
$c = $c.Replace("'(leave blank to keep current)'", "t('profile_newpw_note')")
$c = $c.Replace("'Min. 8 characters'", "t('profile_newpw_ph')")
$c = $c.Replace("'*required'", "t('profile_curpw_required')")
$c = $c.Replace("'Your current password'", "t('profile_curpw_ph')")
$c = $c.Replace("'Save Changes `u{2192}'", "t('profile_save')")
$c = $c.Replace("'Saving`u{2026}'", "t('profile_saving')")
$c = $c.Replace("'Current password is required.'", "t('profile_err_curpw')")
$c = $c.Replace("'Enter a new name or password to update.'", "t('profile_err_nothing')")
$c = $c.Replace("'New password must be at least 8 characters.'", "t('profile_err_short')")
$c = $c.Replace("t('profile_success')", "ALREADY_DONE")
$c = $c.Replace("'Weak'", "t('pw_weak')")
$c = $c.Replace("'Fair'", "t('pw_fair')")
$c = $c.Replace("'Good'", "t('pw_good')")
$c = $c.Replace("'Strong'", "t('pw_strong')")
$c = $c.Replace("const switchLang = l => { setLang(l); localStorage.setItem('pg_lang', l) }", "const switchLang = l => { setLang(l); localStorage.setItem('pg_lang', l); setActivePage(p => p) }")

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host 'done'
