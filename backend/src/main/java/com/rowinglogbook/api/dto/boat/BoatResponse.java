package com.rowinglogbook.api.dto.boat;

import com.rowinglogbook.api.entity.Boat;

public record BoatResponse(
        Long id,
        String name,
        String type,
        Integer capacity,
        String status
) {
    public static BoatResponse from(Boat boat) {
        return new BoatResponse(
                boat.getId(),
                boat.getName(),
                boat.getType().name(),
                boat.getCapacity(),
                boat.getStatus().name()
        );
    }
}
