package com.rowinglogbook.api.persistence;

import com.rowinglogbook.api.enums.BoatType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BoatTypeConverter implements AttributeConverter<BoatType, String> {

    @Override
    public String convertToDatabaseColumn(BoatType attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public BoatType convertToEntityAttribute(String dbData) {
        return BoatType.fromDatabaseValue(dbData);
    }
}
