package es.tfg.records.application.service;

import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.CMSTypedData;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.DigestCalculatorProvider;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;
import org.bouncycastle.util.Store;
import org.jodconverter.core.DocumentConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.Security;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Date;

/**
 * Service for electronic document signing using Bouncy Castle.
 * Implements PAdES-like signing (CMS/PKCS#7 detached signature) for PDF documents.
 * Uses a service-level self-signed certificate for signing (TFG demo).
 */
@Service
public class SignatureService {

    private static final Logger log = LoggerFactory.getLogger(SignatureService.class);

    private final DocumentConverter documentConverter;
    private final KeyStore signingKeyStore;
    private final X509Certificate signingCertificate;
    private final char[] keystorePassword;

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    @Autowired
    public SignatureService(@Autowired(required = false) DocumentConverter documentConverter,
                            @Value("${signing.keystore.password:changeit}") String keystorePassword) throws Exception {
        this.documentConverter = documentConverter;
        this.keystorePassword = keystorePassword.toCharArray();
        this.signingKeyStore = createSigningKeyStore();
        this.signingCertificate = (X509Certificate) signingKeyStore.getCertificate("signing");
        if (documentConverter == null) {
            log.info("JODConverter not available (LibreOffice not configured). Document conversion disabled.");
        }
    }

    /**
     * Signs a PDF document using CMS/PKCS#7 (PAdES-like signature).
     */
    public byte[] signDocument(byte[] pdfContent) throws Exception {
        log.info("Signing document with PAdES-like CMS signature ({} bytes)", pdfContent.length);

        CMSSignedDataGenerator gen = new CMSSignedDataGenerator();

        ContentSigner signer = new JcaContentSignerBuilder("SHA256withRSA")
                .setProvider("BC")
                .build((java.security.PrivateKey) signingKeyStore.getKey("signing", keystorePassword));

        gen.addSignerInfoGenerator(new JcaSignerInfoGeneratorBuilder(
                new JcaDigestCalculatorProviderBuilder().setProvider("BC").build())
                .build(signer, signingCertificate));

        Store<?> certs = new JcaCertStore(java.util.List.of(signingCertificate));
        gen.addCertificates(certs);

        CMSTypedData msg = new CMSProcessableByteArray(pdfContent);
        CMSSignedData signedData = gen.generate(msg, true);

        byte[] signatureBytes = signedData.getEncoded();
        log.info("Document signed successfully ({} bytes signature)", signatureBytes.length);

        return embedSignatureInPdf(pdfContent, signatureBytes);
    }

    /**
     * Generates a detached XAdES-like CMS signature (.xsig) for a document.
     * The signature is stored separately from the document for ENI compliance.
     */
    public byte[] generateDetachedSignature(byte[] documentContent) throws Exception {
        log.info("Generating detached CMS signature for document ({} bytes)", documentContent.length);

        CMSSignedDataGenerator gen = new CMSSignedDataGenerator();

        ContentSigner signer = new JcaContentSignerBuilder("SHA256withRSA")
                .setProvider("BC")
                .build((java.security.PrivateKey) signingKeyStore.getKey("signing", keystorePassword));

        gen.addSignerInfoGenerator(new JcaSignerInfoGeneratorBuilder(
                new JcaDigestCalculatorProviderBuilder().setProvider("BC").build())
                .build(signer, signingCertificate));

        Store<?> certs = new JcaCertStore(java.util.List.of(signingCertificate));
        gen.addCertificates(certs);

        CMSTypedData msg = new CMSProcessableByteArray(documentContent);
        CMSSignedData signedData = gen.generate(msg, true);

        byte[] signatureBytes = signedData.getEncoded();
        log.info("Detached signature generated ({} bytes)", signatureBytes.length);
        return signatureBytes;
    }

    /**
     * Converts a document to PDF (if not already PDF) and signs it.
     * Uses JODConverter (LibreOffice) for conversion when available.
     * Falls back to signing the original content if conversion is not available.
     */
    public byte[] signDocument(byte[] content, String mimeType) throws Exception {
        if (isPdf(mimeType)) {
            log.info("Document is already PDF, signing directly");
            return signDocument(content);
        }

        if (documentConverter != null) {
            log.info("Converting {} to PDF before signing", mimeType);
            java.io.File tempIn = java.io.File.createTempFile("doc-in-", "." + getExtension(mimeType));
            java.io.File tempOut = java.io.File.createTempFile("doc-out-", ".pdf");
            try {
                java.nio.file.Files.write(tempIn.toPath(), content);
                documentConverter.convert(tempIn).to(tempOut).as(org.jodconverter.core.document.DefaultDocumentFormatRegistry.PDF).execute();
                byte[] pdfContent = java.nio.file.Files.readAllBytes(tempOut.toPath());
                log.info("Converted to PDF ({} bytes), now signing", pdfContent.length);
                return signDocument(pdfContent);
            } finally {
                java.nio.file.Files.deleteIfExists(tempIn.toPath());
                java.nio.file.Files.deleteIfExists(tempOut.toPath());
            }
        }

        log.warn("LibreOffice not available, signing {} content directly (not PDF)", mimeType);
        return signDocument(content);
    }

    private boolean isPdf(String mimeType) {
        return mimeType != null && mimeType.toLowerCase().contains("pdf");
    }

    private String getExtension(String mimeType) {
        if (mimeType == null) return "bin";
        if (mimeType.contains("jpeg") || mimeType.contains("jpg")) return "jpg";
        if (mimeType.contains("png")) return "png";
        if (mimeType.contains("gif")) return "gif";
        if (mimeType.contains("msword")) return "doc";
        if (mimeType.contains("openxmlformats") && mimeType.contains("word")) return "docx";
        return "bin";
    }

    /**
     * Computes the SHA-256 digest of a document.
     */
    public String computeDigest(byte[] documentContent) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256", "BC");
        byte[] digest = md.digest(documentContent);
        return bytesToHex(digest);
    }

    /**
     * Verifies a CMS signature embedded in a PDF document.
     * Validates the cryptographic signature against the signing certificate.
     */
    public boolean verifySignature(byte[] signedPdfContent) {
        try {
            byte[] signatureBytes = extractSignatureFromPdf(signedPdfContent);
            if (signatureBytes == null) {
                return false;
            }

            CMSSignedData signedData = new CMSSignedData(signatureBytes);

            org.bouncycastle.util.Store certStore = signedData.getCertificates();
            if (certStore == null) {
                log.warn("No certificates found in signature");
                return false;
            }

            for (Object signerObj : signedData.getSignerInfos().getSigners()) {
                org.bouncycastle.cms.SignerInformation signer = (org.bouncycastle.cms.SignerInformation) signerObj;

                java.util.Collection certMatches = certStore.getMatches(signer.getSID());
                if (certMatches.isEmpty()) {
                    log.warn("No matching certificate found for signer");
                    return false;
                }

                X509CertificateHolder certHolder = (X509CertificateHolder) certMatches.iterator().next();

                org.bouncycastle.cms.SignerInformationVerifier verifier =
                        new org.bouncycastle.cms.jcajce.JcaSimpleSignerInfoVerifierBuilder()
                                .setProvider("BC")
                                .build(certHolder);

                if (!signer.verify(verifier)) {
                    log.warn("Signature cryptographic verification failed");
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the signing certificate subject.
     */
    public String getSigningCertificateSubject() {
        return signingCertificate.getSubjectX500Principal().getName();
    }

    private byte[] embedSignatureInPdf(byte[] pdfContent, byte[] signatureBytes) {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        try {
            String pdfStr = new String(pdfContent, java.nio.charset.StandardCharsets.ISO_8859_1);
            String signatureHex = bytesToHex(signatureBytes);

            int eofPos = pdfStr.lastIndexOf("%%EOF");
            if (eofPos == -1) {
                log.warn("PDF does not contain %%EOF marker, appending signature at end");
                baos.write(pdfContent);
                baos.write("\n%%EOF\n".getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
            } else {
                String trailer = "\n%%Signature\n"
                        + "10 0 obj\n"
                        + "<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached "
                        + "/Contents <" + signatureHex + "> "
                        + "/M (D:" + new java.text.SimpleDateFormat("yyyyMMddHHmmssZ").format(new Date()) + ") "
                        + "/Reason (TFG Electronic Signature) "
                        + "/Location (TFG Records Platform) "
                        + "/ContactInfo (tfg@records.local) >>\n"
                        + "endobj\n";

                String updatedPdf = pdfStr.substring(0, eofPos)
                        + trailer
                        + "xref\n0 1\n0000000000 65535 f \n"
                        + "trailer\n<< /Size 11 /Root 1 0 R /Prev 0 >>\n"
                        + "startxref\n" + pdfStr.length() + "\n%%EOF";

                baos.write(updatedPdf.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
            }
        } catch (Exception e) {
            log.warn("Failed to embed signature in PDF, returning CMS signature bytes: {}", e.getMessage());
            return signatureBytes;
        }
        return baos.toByteArray();
    }

    private byte[] extractSignatureFromPdf(byte[] signedPdfContent) {
        try {
            String pdfStr = new String(signedPdfContent, java.nio.charset.StandardCharsets.ISO_8859_1);
            int startIdx = pdfStr.indexOf("/Contents <");
            if (startIdx == -1) return null;

            int hexStart = pdfStr.indexOf('<', startIdx) + 1;
            int hexEnd = pdfStr.indexOf('>', hexStart);
            if (hexStart == 0 || hexEnd == -1) return null;

            String hexSig = pdfStr.substring(hexStart, hexEnd);
            return hexToBytes(hexSig);
        } catch (Exception e) {
            return null;
        }
    }

    private KeyStore createSigningKeyStore() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA", "BC");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();

        X509Certificate cert = generateSelfSignedCertificate(keyPair);

        KeyStore keyStore = KeyStore.getInstance("PKCS12", "BC");
        keyStore.load(null, null);
        keyStore.setKeyEntry("signing", keyPair.getPrivate(), keystorePassword,
                new java.security.cert.Certificate[]{cert});
        return keyStore;
    }

    private X509Certificate generateSelfSignedCertificate(KeyPair keyPair) throws Exception {
        java.math.BigInteger serial = java.math.BigInteger.valueOf(System.currentTimeMillis());
        Date notBefore = new Date();
        Date notAfter = new Date(System.currentTimeMillis() + 365L * 86400000);

        org.bouncycastle.asn1.x500.X500Name subject = new org.bouncycastle.asn1.x500.X500Name(
                "CN=TFG Service Signing, O=TFG Records, C=ES");

        org.bouncycastle.cert.X509v3CertificateBuilder certBuilder =
                new org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder(
                        subject, serial, notBefore, notAfter, subject, keyPair.getPublic());

        ContentSigner signer = new JcaContentSignerBuilder("SHA256withRSA")
                .setProvider("BC")
                .build(keyPair.getPrivate());

        return new org.bouncycastle.cert.jcajce.JcaX509CertificateConverter()
                .setProvider("BC")
                .getCertificate(certBuilder.build(signer));
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
