package com.rowinglogbook.api.dto.session;

import com.rowinglogbook.api.enums.SessionStatus;
import java.time.Instant;

public record SessionResponse(
        Long id,
        Long boatId,
        String boatName,
        Long createdById,
        String createdByName,
        Instant startTime,
        Instant endTime,
        SessionStatus status,
        int crewCount
) {
}
