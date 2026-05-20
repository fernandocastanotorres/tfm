package es.tfg.records.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity for message threads — one thread per case.
 */
@Entity
@Table(name = "message_threads")
@EntityListeners(AuditingEntityListener.class)
public class MessageThreadEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "procedure_id", nullable = false, unique = true)
    private ProcedureEntity procedure;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<MessageEntity> messages = new ArrayList<>();

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "unread_count_citizen")
    private int unreadCountCitizen = 0;

    @Column(name = "unread_count_admin")
    private int unreadCountAdmin = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public MessageThreadEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProcedureEntity getProcedure() {
        return procedure;
    }

    public void setProcedure(ProcedureEntity procedure) {
        this.procedure = procedure;
    }

    public List<MessageEntity> getMessages() {
        return messages;
    }

    public void setMessages(List<MessageEntity> messages) {
        this.messages = messages;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public int getUnreadCountCitizen() {
        return unreadCountCitizen;
    }

    public void setUnreadCountCitizen(int unreadCountCitizen) {
        this.unreadCountCitizen = unreadCountCitizen;
    }

    public int getUnreadCountAdmin() {
        return unreadCountAdmin;
    }

    public void setUnreadCountAdmin(int unreadCountAdmin) {
        this.unreadCountAdmin = unreadCountAdmin;
    }

    public Instant getCreatedAt() {
        return createdAt;
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
