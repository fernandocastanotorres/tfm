package es.tfg.records.tests.service;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;

import java.io.StringReader;

import static org.junit.jupiter.api.Assertions.*;

class EniXsdValidationTest {

    private final Schema eniSchema;

    EniXsdValidationTest() throws Exception {
        ClassPathResource xsdResource = new ClassPathResource("eni/xsd/eni-documento.xsd");
        SchemaFactory factory = SchemaFactory.newInstance(javax.xml.XMLConstants.W3C_XML_SCHEMA_NS_URI);
        eniSchema = factory.newSchema(xsdResource.getFile());
    }

    @Test
    void validIndexXmlShouldPassValidation() throws Exception {
        String xml = buildValidIndexXml();
        Validator validator = eniSchema.newValidator();
        Source source = new StreamSource(new StringReader(xml));
        assertDoesNotThrow(() -> validator.validate(source));
    }

    @Test
    void invalidXmlShouldFailValidation() {
        String badXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><not-eni>garbage</not-eni>";
        Validator validator = eniSchema.newValidator();
        Source source = new StreamSource(new StringReader(badXml));
        assertThrows(Exception.class, () -> validator.validate(source));
    }

    @Test
    void indexXmlMissingRequiredElementShouldFailValidation() {
        String xml = buildValidIndexXml().replace("<eni:Titulo>", "<eni:TituloX>").replace("</eni:Titulo>", "</eni:TituloX>");
        Validator validator = eniSchema.newValidator();
        Source source = new StreamSource(new StringReader(xml));
        assertThrows(Exception.class, () -> validator.validate(source));
    }

    @Test
    void indexXmlWithWrongVersionNtiShouldFailValidation() {
        String xml = buildValidIndexXml().replace("ENI-NTI-2011", "ENI-NTI-9999");
        Validator validator = eniSchema.newValidator();
        Source source = new StreamSource(new StringReader(xml));
        assertThrows(Exception.class, () -> validator.validate(source));
    }

    @Test
    void indexXmlWithTamanoStringShouldFailValidation() {
        String xml = buildValidIndexXml().replace("<eni:Tamano>123456</eni:Tamano>", "<eni:Tamano>NOT_A_NUMBER</eni:Tamano>");
        Validator validator = eniSchema.newValidator();
        Source source = new StreamSource(new StringReader(xml));
        assertThrows(Exception.class, () -> validator.validate(source));
    }

    private static String buildValidIndexXml() {
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <eni:Documento xmlns:eni="http://administracionelectronica.gob.es/ENI/XSD/v1.0"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://administracionelectronica.gob.es/ENI/XSD/v1.0 eni-documento.xsd">
              <eni:Metadatos>
                <eni:Identificador>EXP-ABCD1234</eni:Identificador>
                <eni:TipoDocumento>TD01</eni:TipoDocumento>
                <eni:Titulo>Licencia de obras</eni:Titulo>
                <eni:Descripcion>Solicitud de licencia municipal</eni:Descripcion>
                <eni:Emisor>
                  <eni:Nombre>Ayuntamiento</eni:Nombre>
                  <eni:Identificador>sede.local</eni:Identificador>
                </eni:Emisor>
                <eni:FechaEmision>2025-06-15T10:30:00+00:00</eni:FechaEmision>
                <eni:Estado>Resuelto</eni:Estado>
                <eni:VersionNTI>ENI-NTI-2011</eni:VersionNTI>
                <eni:ExpedienteAsociado>
                  <eni:Identificador>EXP-ABCD1234</eni:Identificador>
                  <eni:CodigoOficina>Ayuntamiento</eni:CodigoOficina>
                </eni:ExpedienteAsociado>
              </eni:Metadatos>
              <eni:Documento>
                <eni:Contenido>
                  <eni:Identificador>550e8400-e29b-41d4-a716-446655440000</eni:Identificador>
                  <eni:NombreFichero>resolucion.pdf</eni:NombreFichero>
                  <eni:TipoMIME>application/pdf</eni:TipoMIME>
                  <eni:Tamano>123456</eni:Tamano>
                  <eni:Hash>aabbccddee0011223344556677889900aabbccddee0011223344556677889900</eni:Hash>
                  <eni:AlgoritmoHash>SHA-256</eni:AlgoritmoHash>
                  <eni:FechaInclusion>2025-06-15T10:30:00+00:00</eni:FechaInclusion>
                  <eni:Firma>
                    <eni:TipoFirma>PAdES</eni:TipoFirma>
                    <eni:FormatoFirma>CMS/PKCS7</eni:FormatoFirma>
                    <eni:FicheroFirma>signatures/resolucion.xsig</eni:FicheroFirma>
                  </eni:Firma>
                </eni:Contenido>
              </eni:Documento>
            </eni:Documento>
            """;
    }
}
