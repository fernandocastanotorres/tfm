package es.tfm.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "document_registry_counters")
@IdClass(DocumentRegistryCounterEntity.DocumentRegistryCounterId.class)
public class DocumentRegistryCounterEntity {

    @Id
    @Column(name = "registry_type", length = 10, nullable = false)
    private String registryType;

    @Id
    @Column(name = "unit_code", length = 20, nullable = false)
    private String unitCode;

    @Id
    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_value", nullable = false)
    private Long lastValue;

    public String getRegistryType() { return registryType; }
    public void setRegistryType(String registryType) { this.registryType = registryType; }
    public String getUnitCode() { return unitCode; }
    public void setUnitCode(String unitCode) { this.unitCode = unitCode; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Long getLastValue() { return lastValue; }
    public void setLastValue(Long lastValue) { this.lastValue = lastValue; }

    public static class DocumentRegistryCounterId implements Serializable {
        private String registryType;
        private String unitCode;
        private Integer year;

        public DocumentRegistryCounterId() {}
        public DocumentRegistryCounterId(String registryType, String unitCode, Integer year) {
            this.registryType = registryType;
            this.unitCode = unitCode;
            this.year = year;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) { return true; }
            if (!(o instanceof DocumentRegistryCounterId that)) { return false; }
            return Objects.equals(registryType, that.registryType)
                    && Objects.equals(unitCode, that.unitCode)
                    && Objects.equals(year, that.year);
        }

        @Override
        public int hashCode() {
            return Objects.hash(registryType, unitCode, year);
        }
    }
}
