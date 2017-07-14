$certSubject = "Patti Fuller,OU=UserAccounts,DC=corp,DC=contoso,DC=com"


$cert = New-SelfSignedCertificate `
    -CertStoreLocation Cert:\CurrentUser\My `
    -Subject "CN=$($certSubject)" `
    -KeySpec KeyExchange `
    -HashAlgorithm SHA256


$path = 'Cert:\CurrentUser\my\' + $cert.thumbprint

$pwd = ConvertTo-SecureString -String 'password!123' -Force -AsPlainText

Export-PfxCertificate -cert $path -FilePath c:\temp\my_cert.pfx -Password $pwd
