package com.rowinglogbook.api.dto.session;

import java.time.Instant;

public record SessionCloseRequest(
        Instant endTime
) {
}
