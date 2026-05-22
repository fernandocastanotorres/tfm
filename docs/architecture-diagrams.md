# TFG Records Platform - Diagramas de Arquitectura

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Cliente"
        A[Angular Frontend<br/>Sede Ciudadano]
        B[Angular Frontend<br/>Backoffice Admin]
    end

    subgraph "API Gateway / Nginx"
        C[Nginx Reverse Proxy<br/>TLS Termination]
    end

    subgraph "Backend - Spring Boot"
        D[REST Controllers<br/>entrypoints]
        E[Application Services<br/>Business Logic]
        F[Domain Layer<br/>Entities + Ports]
        G[Infrastructure<br/>JPA + Security + Storage]
        H[Flowable BPM Engine<br/>Process Automation]
        I[Signature Service<br/>Bouncy Castle CMS]
        J[Audit Service<br/>ENS Compliance]
    end

    subgraph "Data Layer"
        K[(PostgreSQL 16<br/>Primary Database)]
        L[(H2 In-Memory<br/>Development)]
        M[File Storage<br/>Documents]
    end

    subgraph "External Services"
        N[LibreOffice<br/>PDF Conversion]
        O[Mailpit<br/>SMTP + Web UI]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    G --> K
    G --> L
    G --> M
    I --> N
    J --> O
```

## 2. Arquitectura Hexagonal (Ports & Adapters)

```mermaid
graph TB
    subgraph "Primary Adapters (Driving)"
        A1[REST Controllers<br/>SignatureController]
        A2[REST Controllers<br/>ProcedureController]
        A3[REST Controllers<br/>AuthController]
        A4[BPMN Process Events]
    end

    subgraph "Application Layer"
        B1[SignatureService<br/>PAdES CMS Signing]
        B2[ProcedureService<br/>Case Management]
        B3[AuthService<br/>JWT Authentication]
        B4[WorkflowService<br/>BPM Orchestration]
    end

    subgraph "Domain Layer (Core)"
        C1[Document Entity]
        C2[Procedure Entity]
        C3[User Entity]
        C4[Repository Ports<br/>Interfaces]
        C5[Domain Services]
    end

    subgraph "Secondary Adapters (Driven)"
        D1[JPA Repositories<br/>Spring Data]
        D2[JWT Provider<br/>Token Generation]
        D3[File Storage<br/>Local FS]
        D4[Bouncy Castle<br/>Crypto Operations]
        D5[Email Gateway<br/>SMTP Integration]
    end

    subgraph "Infrastructure"
        E1[(PostgreSQL)]
        E2[(H2 Dev)]
        E3[File System]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4

    B1 --> C1
    B1 --> C4
    B2 --> C2
    B2 --> C4
    B3 --> C3
    B4 --> C2

    C4 -.-> D1
    B3 -.-> D2
    B1 -.-> D4
    B2 -.-> D3
    B3 -.-> D5

    D1 --> E1
    D1 --> E2
    D3 --> E3
```

## 3. Diagrama de Secuencia - Firma Electrónica

```mermaid
sequenceDiagram
    participant U as Usuario (Angular)
    participant C as SignatureController
    participant S as SignatureService
    participant BC as Bouncy Castle
    participant A as AuditService
    participant FS as FileStorage

    U->>C: POST /citizen/signatures/sign<br/>(multipart PDF)
    C->>S: signDocument(byte[] pdfContent)
    
    Note over S: 1. Generar clave RSA 2048<br/>(si no existe)
    S->>BC: KeyPairGenerator.getInstance("RSA")
    BC-->>S: KeyPair (2048-bit)
    
    Note over S: 2. Crear certificado self-signed
    S->>BC: X509v3CertificateBuilder<br/>CN=TFG Service Signing
    BC-->>S: X509Certificate
    
    Note over S: 3. Generar CMS/PKCS#7 signature
    S->>BC: CMSSignedDataGenerator
    S->>BC: addSignerInfoGenerator<br/>(SHA256withRSA)
    S->>BC: generate(CMSProcessableByteArray)
    BC-->>S: CMSSignedData (firma)
    
    Note over S: 4. Embed signature in PDF
    S->>S: embedSignatureInPdf()<br/>Append /Sig dictionary
    
    S-->>C: byte[] signedPdf
    C->>A: auditService.record(SIGN, SUCCESS)
    C-->>U: 200 OK<br/>(signed PDF download)
```

## 4. Diagrama de Secuencia - Verificación de Firma

```mermaid
sequenceDiagram
    participant U as Usuario (Angular)
    participant C as SignatureController
    participant S as SignatureService
    participant BC as Bouncy Castle
    participant A as AuditService

    U->>C: POST /citizen/signatures/verify<br/>(multipart signed PDF)
    C->>S: verifySignature(byte[] signedPdf)
    
    Note over S: 1. Extraer firma del PDF
    S->>S: extractSignatureFromPdf()<br/>Parse /Contents <hex>
    
    Note over S: 2. Parsear CMS signature
    S->>BC: new CMSSignedData(signatureBytes)
    BC-->>S: CMSSignedData object
    
    Note over S: 3. Verificar signers
    S->>BC: getSignerInfos().getSigners()
    BC-->>S: Collection<SignerInformation>
    
    alt Firma válida
        S-->>C: true
        C->>A: auditService.record(VERIFY, SUCCESS)
        C-->>U: 200 OK<br/>{valid: true}
    else Firma inválida
        S-->>C: false
        C->>A: auditService.record(VERIFY, FAILURE)
        C-->>U: 200 OK<br/>{valid: false}
    end
```

## 5. Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Desarrollo Local"
        A1[Angular Dev Server<br/>:4200]
        A2[Backoffice Dev Server<br/>:4300]
        B[Spring Boot<br/>:8080]
        C[(H2 In-Memory<br/>Database)]
        D[File System<br/>./data/documents]
    end

    subgraph "Producción (Docker)"
        E1[Nginx Container<br/>:80/:443]
        E2[Backend Container<br/>:8080]
        E3[Frontend Container<br/>:80]
        E4[Backoffice Container<br/>:80]
        F[(PostgreSQL Container<br/>:5432)]
        G[LibreOffice Container<br/>:2002]
        H[Volume: postgres-data]
        I[Volume: documents]
    end

    A1 --> B
    A2 --> B
    B --> C
    B --> D

    E1 --> E2
    E1 --> E3
    E1 --> E4
    E2 --> F
    E2 --> G
    E2 --> I
    F --> H
```

## 6. Modelo de Dominio - Entidades Principales

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String passwordHash
        +String displayName
        +String nationalId
        +String phone
        +String address
        +Boolean active
        +String otpCode
        +Instant otpExpiry
        +Set~String~ roles
    }

    class Procedure {
        +UUID id
        +String title
        +ProcedureStatus status
        +UUID owner
        +UUID procedureType
        +String assignedUnit
        +String formData
        +Instant submittedAt
    }

    class Document {
        +UUID id
        +String name
        +String mimeType
        +Long size
        +String storagePath
        +DocumentStatus status
        +Integer version
        +Instant uploadedAt
    }

    class ProcedureType {
        +UUID id
        +String title
        +String description
        +String unit
        +BigDecimal feeAmount
        +Integer deadlineDays
        +String status
    }

    class ProcedureTask {
        +UUID id
        +String title
        +String description
        +TaskType type
        +Integer orderIndex
        +String formSchema
        +String uploadRequirements
    }

    class AuditLog {
        +UUID id
        +Instant timestamp
        +String userId
        +AuditAction action
        +String resourceType
        +UUID resourceUuid
        +String clientIp
        +String appContext
        +AuditResult result
        +String details
    }

    User "1" --> "*" Procedure : owns
    Procedure "1" --> "*" Document : contains
    ProcedureType "1" --> "*" ProcedureTask : defines
    Procedure "*" --> "1" ProcedureType : based_on
    AuditLog records actions on all entities
```

## 7. Flujo de Estado de Expediente

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Crear expediente
    DRAFT --> SUBMITTED: Ciudadano envía
    SUBMITTED --> IN_REVIEW: Tramitador asigna
    IN_REVIEW --> APPROVED: Resolución favorable
    IN_REVIEW --> REJECTED: Resolución desfavorable
    IN_REVIEW --> AMENDMENT_REQUIRED: Documentación pendiente
    AMENDMENT_REQUIRED --> RESUBMITTED: Ciudadano subsana
    RESUBMITTED --> IN_REVIEW: Tramitador revisa
    APPROVED --> [*]
    REJECTED --> [*]
    
    note right of DRAFT
        Ciudadano puede editar
        y adjuntar documentos
    end note
    
    note right of IN_REVIEW
        Tramitador revisa
        documentación
    end note
    
    note right of AMENDMENT_REQUIRED
        Se solicita documentación
        adicional al ciudadano
    end note
```

## 8. Componentes del Frontend (Angular)

```mermaid
graph TB
    subgraph "Application Layer"
        A1[DocumentsApiService]
        A2[SignatureApiService]
        A3[CasesApiService]
        A4[AuthApiService]
        A5[ConfirmDialogService]
    end

    subgraph "Adapters Layer"
        B1[DocumentsComponent]
        B2[SignatureComponent]
        B3[CasesComponent]
        B4[AuthComponent]
    end

    subgraph "Models"
        C1[DocumentItem]
        C2[CaseItem]
        C3[UserItem]
        C4[SignatureInfo]
    end

    subgraph "Utils"
        D1[Pagination Utils]
        D2[i18n Service]
    end

    B1 --> A1
    B1 --> A3
    B2 --> A2
    B3 --> A3
    B4 --> A4

    A1 --> C1
    A3 --> C2
    A4 --> C3
    A2 --> C4

    B1 --> D1
    B3 --> D1
    B1 --> D2
    B2 --> D2
    B3 --> D2
    B4 --> D2
```

## 9. Cobertura de Tests (JaCoCo)

```mermaid
pie title Coverage por Capa
    "Domain Model (100%)" : 100
    "Application Exception (92%)" : 92
    "Infrastructure Config (96%)" : 96
    "Application Mapper (76%)" : 76
    "Persistence Adapter (64%)" : 64
    "Persistence Mapper (60%)" : 60
    "Persistence Entity (55%)" : 55
    "Application DTO (34%)" : 34
    "Controller Layer (31%)" : 31
    "Application Service (24%)" : 24
```

## 10. Security Filter Chain

```mermaid
graph LR
    A[Request] --> B[DisableEncodeUrlFilter]
    B --> C[WebAsyncManagerIntegrationFilter]
    C --> D[SecurityContextHolderFilter]
    D --> E[HeaderWriterFilter]
    E --> F[CorsFilter]
    F --> G[LogoutFilter]
    G --> H[CorrelationIdFilter]
    H --> I[SecurityHeadersFilter]
    I --> J[RateLimitFilter]
    J --> K[JwtAuthenticationFilter]
    K --> L[RequestCacheAwareFilter]
    L --> M[SecurityContextHolderAwareRequestFilter]
    M --> N[AnonymousAuthenticationFilter]
    N --> O[SessionManagementFilter]
    O --> P[ExceptionTranslationFilter]
    P --> Q[AuthorizationFilter]
    Q --> R[Controller]
```
