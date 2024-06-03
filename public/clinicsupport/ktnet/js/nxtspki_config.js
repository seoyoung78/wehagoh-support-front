/**
 * Created by jhkoo77 on 2015-08-26.
 */

var nxTSPKIConfig = { version: {}, options: {} };

nxTSPKIConfig.version.nx = "1,0,0,8";
nxTSPKIConfig.version.tstoolkit = "2,0,7,0";
nxTSPKIConfig.installPage = "clinicsupport/ktnet/nxtspkisetup.exe";
nxTSPKIConfig.installMessage = "SCORE PKI for OpenWeb 프로그램이 설치 되어 있지 않거나, 이전 버전이 설치되어 있습니다. \n\n설치파일을 다운로드 받으시겠습니까?";
nxTSPKIConfig.processingImageUrl = "";

nxTSPKIConfig.options.siteName = "gpost";
nxTSPKIConfig.options.ldapInfo =
  "KISA:dirsys.rootca.or.kr:389|KICA:ldap.signgate.com:389|SignKorea:dir.signkorea.com:389|Yessign:ds.yessign.or.kr:389|CrossCert:dir.crosscert.com:389|TradeSign:ldap.tradesign.net:389|NCASign:ds.nca.or.kr:389|";
nxTSPKIConfig.options.ctlInfo = "";
nxTSPKIConfig.options.initPolicies =
  "1 2 410 200012 1 1 3:범용기업|1 2 410 200004 5 1 1 7:범용기업|1 2 410 200005 1 1 5:범용기업|1 2 410 200004 5 2 1 1:범용기업|1 2 410 200004 5 4 1 2:범용기업|1 2 410 200004 5 3 1 1:범용기관|1 2 410 200004 5 3 1 2:범용기업|1 2 410 200005 1 1 6 8:국세청신고용|1 2 410 200012 1 1 301:의료용(개인)|";
nxTSPKIConfig.options.includeCertPath = false;
nxTSPKIConfig.options.includeSigningTime = true;
nxTSPKIConfig.options.includeCRL = false;
nxTSPKIConfig.options.includeContent = true;
nxTSPKIConfig.options.crlCheckOption = true;
nxTSPKIConfig.options.arlCheckOption = true;
// nxTSPKIConfig.options.loginDataKmCert =
  // "-----BEGIN CERTIFICATE-----MIIFIjCCBAqgAwIBAgIEWfW5lzANBgkqhkiG9w0BAQsFADBPMQswCQYDVQQGEwJLUjESMBAGA1UECgwJVHJhZGVTaWduMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFTATBgNVBAMMDFRyYWRlU2lnbkNBNDAeFw0yMzA2MDUwMDQzNDJaFw0yNDA4MDQwODM1MzRaMGIxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlUcmFkZVNpZ24xFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEoMCYGA1UEAwwfKOyjvCnrjZTsobTruYTspojsmKhfMDAwMTc2MzA1ODCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMdVLM51lzz3yMmK9cmt2RlmI8yrLtwx1n7UXLJorZLzJc8jeOY1pGAf84yJYf8OvgGqSIAMosaq8IW++UhTo2VXsGJnUZ6bhApHkeJbJtIQmsPqRtG/FdU2vP2jzScpsWrs5iBpXlPm7sM79VkABkfJAyILp1YewszZpb8v8d7iq085uLblmUH9yaSTWjjwfYPaHs/fYks8DmXpUnAI1g9g8mnfVEG2dpXC69nUPFWTBIcQorw+9baRVsm/Iz4b6T10EWGGnG6CGs7LEkD0jl1eoQJ0XQ9tpzYYP48tkLdoQtjiTZY1uScMZxSPsA7LzaO8br/7sWdDjYjhN/nBvbsCAwEAAaOCAfEwggHtMIGPBgNVHSMEgYcwgYSAFKGxx2PhqfTSmUtB9FJEZ9KxcHY0oWikZjBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQGA1UEAwwNS0lTQSBSb290Q0EgNIICEDUwHQYDVR0OBBYEFPIt+Pp+DbYypphYnAjKSGMij2iNMA4GA1UdDwEB/wQEAwIFIDB6BgNVHSABAf8EcDBuMGwGCSqDGoyaTAEBBjBfMC4GCCsGAQUFBwICMCIeIMd0ACDHeMmdwRyylAAgrPWz2cd4yZ3BHAAgx4WyyLLkMC0GCCsGAQUFBwIBFiFodHRwOi8vd3d3LnRyYWRlc2lnbi5uZXQvY3BzLmh0bWwwZgYDVR0fBF8wXTBboFmgV4ZVbGRhcDovL2xkYXAudHJhZGVzaWduLm5ldDozODkvY249Y3JsMWRwMTg4LG91PWNybGRwNCxvdT1BY2NyZWRpdGVkQ0Esbz1UcmFkZVNpZ24sYz1LUjBGBggrBgEFBQcBAQQ6MDgwNgYIKwYBBQUHMAGGKmh0dHA6Ly9vY3NwLnRyYWRlc2lnbi5uZXQ6MTgwMDAvT0NTUFNlcnZlcjANBgkqhkiG9w0BAQsFAAOCAQEAA82a9mIAWoUSkbt64kLRXN8EPGObPZ7ufW/u074b3hsO4W26u6BFutEoUDNgipnkDnY1zzpvc3MOMNJKKBpm0kqV5g8A4KbXXasI5IpyEi7qOjQZvg7AhCl1UMYcf+HK3L4o0L3j+zkF+1KKs2aG+pWgeQ3BrsvhTKIvHHcUO/20xAcuJzlCnm6HH77YK7QhF5v5r1doGJDMQprbY1MQPEpmb2Pja++dcCD4LEE9DWGCygEKvmnZXycDYqhP7ltUAu4N7l3c/oMMWAPskgaWmSs56jHI2jmWjmsm3YragP6T7PLKYXl7D2ZutJdU0ExSCtqhadMwfMLHkjoK79+KYQ==-----END CERTIFICATE-----";
nxTSPKIConfig.options.selectCertFirstButton = "HDD";
nxTSPKIConfig.options.bannerUrl = "localhost:9080/NXTSDemo/img/gpost.bmp";
nxTSPKIConfig.options.infovine = {};
nxTSPKIConfig.options.phoneUrl = "http://test.ubikey.co.kr/infovine/1252/download.html";
nxTSPKIConfig.options.phoneVersion = "1,2,5,2";
nxTSPKIConfig.options.phoneParam = "INFOVINE|http://test.ubikey.co.kr/infovine/1252/DownloadList &KTNET|NULL";

nxTSPKIConfig.options.loadKmCert = true;
nxTSPKIConfig.options.tsaHashAlg = "sha256";
nxTSPKIConfig.options.tsaUrl = "http://tsatest.tradesign.net:8090/service/timestamp/issue";
nxTSPKIConfig.options.tsaId = "test";
nxTSPKIConfig.options.tsaPassword = "testPwd";

nxTSPKIConfig.options.encryptionAlgorithm = "";
nxTSPKIConfig.options.defaultMediaType = "";

nxTSMessage.iframeTimeout = "응답이 지연되었습니다 잠시후 다시 시도해주세요..";
nxTSMessage.ajaxTimeout = "응답이 지연되었습니다 잠시후 다시 시도해주세요.";
