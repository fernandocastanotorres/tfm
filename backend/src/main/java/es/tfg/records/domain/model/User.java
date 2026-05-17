package es.tfg.records.domain.model;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Domain model representing a registered user in the system.
 */
public class User {

    private UUID id;
    private String email;
    private String passwordHash;
    private String displayName;
    private String nationalId;
    private String phone;
    private String address;
    private Set<String> roles;
    private boolean active;
    private String otpCode;
    private Instant otpExpiry;
    private Instant lastVerificationEmailSentAt;
    private Instant createdAt;
    private Instant updatedAt;

    public User() {
    }

    public User(UUID id, String email, String passwordHash, String displayName,
                Set<String> roles, boolean active) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.roles = roles;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public Instant getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(Instant otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastVerificationEmailSentAt() {
        return lastVerificationEmailSentAt;
    }

    public void setLastVerificationEmailSentAt(Instant lastVerificationEmailSentAt) {
        this.lastVerificationEmailSentAt = lastVerificationEmailSentAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
