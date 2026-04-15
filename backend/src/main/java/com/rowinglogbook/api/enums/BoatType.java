package com.rowinglogbook.api.enums;

public enum BoatType {
    SINGLE_SCULL,
    DOUBLE_SCULL,
    PAIR,
    QUAD_SCULL,
    FOUR,
    EIGHT;

    public static BoatType fromDatabaseValue(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "SINGLE" -> SINGLE_SCULL;
            case "DOUBLE" -> DOUBLE_SCULL;
            case "QUAD" -> QUAD_SCULL;
            default -> BoatType.valueOf(normalized);
        };
    }
}
